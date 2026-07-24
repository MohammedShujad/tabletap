// =====================================
// TABLETAP - PAYMENT RECORDS MODULE
// =====================================

let paymentRecordCurrentPage = 1;

function escapePaymentHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getPaymentRecordDate(order) {
    const dateValue =
        order.paidAt ||
        order.completedAt ||
        order.createdAt;

    const parsedDate = new Date(dateValue);

    return Number.isNaN(parsedDate.getTime())
        ? null
        : parsedDate;
}

function getPaidOrders() {
    return orders.filter(function (order) {
        return (
            order.paymentStatus === "Paid" ||
            (
                order.status === "Completed" &&
                Boolean(order.paymentMethod)
            )
        );
    });
}

function matchesPaymentDateFilter(order, filterValue) {
    if (filterValue === "all") return true;

    const orderDate = getPaymentRecordDate(order);
    if (!orderDate) return false;

    const now = new Date();
    const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    if (filterValue === "today") {
        return orderDate >= todayStart && orderDate < tomorrowStart;
    }

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    if (filterValue === "yesterday") {
        return orderDate >= yesterdayStart && orderDate < todayStart;
    }

    if (filterValue === "week") {
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 6);
        return orderDate >= weekStart && orderDate < tomorrowStart;
    }

    if (filterValue === "month") {
        return (
            orderDate.getFullYear() === now.getFullYear() &&
            orderDate.getMonth() === now.getMonth()
        );
    }

    return true;
}

function getPaymentElements() {
    return {
        search: document.getElementById("paymentRecordSearch"),
        dateFilter: document.getElementById("paymentRecordDateFilter"),
        methodFilter: document.getElementById("paymentRecordMethodFilter"),
        sort: document.getElementById("paymentRecordSort"),
        pageSize: document.getElementById("paymentRecordPageSize"),
        range: document.getElementById("paymentRecordRange"),
        filterSummary: document.getElementById("paymentRecordFilterSummary"),
        average: document.getElementById("paymentSummaryAverage"),
        pagination: document.getElementById("paymentPagination"),
        prev: document.getElementById("paymentPrevPage"),
        next: document.getElementById("paymentNextPage"),
        pageInfo: document.getElementById("paymentPageInfo")
    };
}

function getPaymentAmounts(order) {
    const fallbackBill = calculateBill(order);

    return {
        subtotal: Number(order.billSubtotal ?? fallbackBill.subtotal),
        vatAmount: Number(order.vatAmount ?? fallbackBill.vatAmount),
        total: Number(order.total ?? fallbackBill.grandTotal)
    };
}

function getFilteredPaymentRecords() {
    const elements = getPaymentElements();

    const searchValue =
        (elements.search?.value || "")
            .trim()
            .toLowerCase();

    const dateFilter =
        elements.dateFilter?.value || "today";

    const methodFilter =
        elements.methodFilter?.value || "all";

    const sortValue =
        elements.sort?.value || "newest";

    const filtered = getPaidOrders().filter(function (order) {
        const searchable = [
            order.id,
            order.customer?.name,
            order.customer?.phone,
            order.customer?.table
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            !searchValue ||
            searchable.includes(searchValue);

        const matchesMethod =
            methodFilter === "all" ||
            order.paymentMethod === methodFilter;

        return (
            matchesSearch &&
            matchesMethod &&
            matchesPaymentDateFilter(order, dateFilter)
        );
    });

    return filtered.sort(function (first, second) {
        if (sortValue === "highest") {
            return getPaymentAmounts(second).total -
                getPaymentAmounts(first).total;
        }

        if (sortValue === "lowest") {
            return getPaymentAmounts(first).total -
                getPaymentAmounts(second).total;
        }

        const firstDate =
            getPaymentRecordDate(first)?.getTime() || 0;

        const secondDate =
            getPaymentRecordDate(second)?.getTime() || 0;

        return sortValue === "oldest"
            ? firstDate - secondDate
            : secondDate - firstDate;
    });
}

function updatePaymentSummary(filteredOrders) {
    const currency = getCurrency();

    const totals = filteredOrders.reduce(
        function (summary, order) {
            const amounts = getPaymentAmounts(order);
            summary.subtotal += amounts.subtotal;
            summary.vat += amounts.vatAmount;
            summary.total += amounts.total;
            return summary;
        },
        { subtotal: 0, vat: 0, total: 0 }
    );

    paymentSummaryCount.textContent = filteredOrders.length;
    paymentSummaryCurrency1.textContent = currency;
    paymentSummaryCurrency2.textContent = currency;
    paymentSummaryCurrency3.textContent = currency;
    paymentSummarySubtotal.textContent = totals.subtotal.toFixed(2);
    paymentSummaryVat.textContent = totals.vat.toFixed(2);
    paymentSummaryTotal.textContent = totals.total.toFixed(2);

    const averageElement =
        document.getElementById("paymentSummaryAverage");

    if (averageElement) {
        const average =
            filteredOrders.length > 0
                ? totals.total / filteredOrders.length
                : 0;

        averageElement.textContent =
            `${currency} ${average.toFixed(2)}`;
    }
}

function getPaymentFilterLabel() {
    const elements = getPaymentElements();

    const dateLabels = {
        today: "Today",
        yesterday: "Yesterday",
        week: "Last 7 days",
        month: "This month",
        all: "All time"
    };

    const parts = [
        dateLabels[elements.dateFilter?.value || "today"]
    ];

    if (
        elements.methodFilter &&
        elements.methodFilter.value !== "all"
    ) {
        parts.push(elements.methodFilter.value);
    }

    if (
        elements.search &&
        elements.search.value.trim()
    ) {
        parts.push(
            `Search: “${elements.search.value.trim()}”`
        );
    }

    return parts.join(" · ");
}

function renderPaymentRecords() {
    const filteredOrders = getFilteredPaymentRecords();
    const elements = getPaymentElements();

    const pageSize =
        Number(elements.pageSize?.value || 25);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / pageSize)
    );

    paymentRecordCurrentPage = Math.min(
        paymentRecordCurrentPage,
        totalPages
    );

    const startIndex =
        (paymentRecordCurrentPage - 1) * pageSize;

    const pageOrders =
        filteredOrders.slice(
            startIndex,
            startIndex + pageSize
        );

    paymentRecordsGrid.innerHTML = "";

    paymentRecordsCount.textContent =
        `${filteredOrders.length} payment${filteredOrders.length === 1 ? "" : "s"
        }`;

    updatePaymentSummary(filteredOrders);

    if (elements.filterSummary) {
        elements.filterSummary.textContent =
            getPaymentFilterLabel();
    }

    if (elements.range) {
        elements.range.textContent =
            filteredOrders.length === 0
                ? "Showing 0 records"
                : `Showing ${startIndex + 1}–${Math.min(
                    startIndex + pageSize,
                    filteredOrders.length
                )
                } of ${filteredOrders.length}`;
    }

    if (filteredOrders.length === 0) {
        paymentRecordsEmpty.hidden = false;

        if (elements.pagination) {
            elements.pagination.hidden = true;
        }

        return;
    }

    paymentRecordsEmpty.hidden = true;

    pageOrders.forEach(function (order) {
        const currency = getCurrency();
        const amounts = getPaymentAmounts(order);
        const paidDate = getPaymentRecordDate(order);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td data-label="Time">
                ${escapePaymentHtml(
            paidDate
                ? paidDate.toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                )
                : "—"
        )}
                <small>
                    ${escapePaymentHtml(
            paidDate
                ? paidDate.toLocaleDateString()
                : ""
        )}
                </small>
            </td>

            <td data-label="Order ID">
                <strong class="payment-order-link">
                    ${escapePaymentHtml(order.id || "Unknown")}
                </strong>
            </td>

            <td data-label="Table">
                ${escapePaymentHtml(order.customer?.table || "—")}
            </td>

            <td data-label="Customer">
                <strong>
                    ${escapePaymentHtml(
            order.customer?.name || "Walk-in"
        )}
                </strong>
                <small>
                    ${escapePaymentHtml(
            order.customer?.phone || ""
        )}
                </small>
            </td>

            <td data-label="Method">
                <span class="payment-ledger-method">
                    ${escapePaymentHtml(
            order.paymentMethod || "Unknown"
        )}
                </span>
            </td>

            <td data-label="Subtotal">
                ${escapePaymentHtml(currency)}
                ${amounts.subtotal.toFixed(2)}
            </td>

            <td data-label="VAT">
                ${escapePaymentHtml(currency)}
                ${amounts.vatAmount.toFixed(2)}
            </td>

            <td data-label="Total">
                <strong class="payment-ledger-total">
                    ${escapePaymentHtml(currency)}
                    ${amounts.total.toFixed(2)}
                </strong>
            </td>

            <td data-label="Action">
                <button class="payment-ledger-action"
                        type="button"
                        onclick="openPaymentReceipt('${escapePaymentHtml(order.id)
            }')">
                    Receipt
                </button>
            </td>
        `;

        paymentRecordsGrid.appendChild(row);
    });

    if (elements.pagination) {
        elements.pagination.hidden =
            totalPages <= 1;
    }

    if (elements.pageInfo) {
        elements.pageInfo.textContent =
            `Page ${paymentRecordCurrentPage} of ${totalPages}`;
    }

    if (elements.prev) {
        elements.prev.disabled =
            paymentRecordCurrentPage === 1;
    }

    if (elements.next) {
        elements.next.disabled =
            paymentRecordCurrentPage === totalPages;
    }
}

function resetPaymentPageAndRender() {
    paymentRecordCurrentPage = 1;
    renderPaymentRecords();
}
let paymentReceiptModal = null;

function ensurePaymentReceiptModal() {
    if (paymentReceiptModal) {
        return paymentReceiptModal;
    }

    const modal = document.createElement("div");
    modal.className = "bill-modal";
    modal.id = "paymentReceiptModal";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
        <div class="bill-modal-overlay"
             data-payment-receipt-close></div>

        <section aria-labelledby="paymentReceiptTitle"
                 aria-modal="true"
                 class="bill-modal-panel billing-pos-modal"
                 role="dialog">
            <div class="bill-modal-header">
                <div>
                    <span class="dashboard-eyebrow">
                        Payment receipt
                    </span>

                    <h2 id="paymentReceiptTitle">
                        Customer Bill
                    </h2>

                    <p id="paymentReceiptSubtitle"></p>
                </div>

                <button aria-label="Close receipt"
                        class="bill-modal-close"
                        data-payment-receipt-close
                        type="button">
                    &times;
                </button>
            </div>

            <div class="printable-bill"
                 id="paymentReceiptContent"></div>

            <div class="bill-modal-actions">
                <button class="secondary-button"
                        id="paymentReceiptPrint"
                        type="button">
                    🖨️ Print Receipt
                </button>

                <button class="primary-button"
                        data-payment-receipt-close
                        type="button">
                    Close
                </button>
            </div>
        </section>
    `;

    document.body.appendChild(modal);

    modal
        .querySelectorAll("[data-payment-receipt-close]")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                closePaymentReceipt
            );
        });

    modal
        .querySelector("#paymentReceiptPrint")
        .addEventListener(
            "click",
            function () {
                printSelectedBill();
            }
        );

    paymentReceiptModal = modal;
    return paymentReceiptModal;
}

function openPaymentReceipt(orderId) {
    const order = orders.find(function (item) {
        return String(item.id) === String(orderId);
    });

    if (!order) {
        alert("Payment record not found.");
        return;
    }

    const modal = ensurePaymentReceiptModal();

    selectedBillingOrderId = order.id;

    modal.querySelector(
        "#paymentReceiptContent"
    ).innerHTML = buildReceipt(order);

    modal.querySelector(
        "#paymentReceiptSubtitle"
    ).textContent =
        `${order.id} · Table ${
            order.customer?.table || "—"
        }`;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closePaymentReceipt() {
    if (!paymentReceiptModal) {
        return;
    }

    paymentReceiptModal.classList.remove("show");
    paymentReceiptModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";
    selectedBillingOrderId = null;
}

function initPaymentRecordsModule() {
    const elements = getPaymentElements();

    if (openPaymentRecordsLink) {
        openPaymentRecordsLink.addEventListener(
            "click",
            function () {
                paymentRecordsSection.open = true;
            }
        );
    }

    elements.search?.addEventListener(
        "input",
        resetPaymentPageAndRender
    );

    elements.dateFilter?.addEventListener(
        "change",
        resetPaymentPageAndRender
    );

    elements.methodFilter?.addEventListener(
        "change",
        resetPaymentPageAndRender
    );

    elements.sort?.addEventListener(
        "change",
        resetPaymentPageAndRender
    );

    elements.pageSize?.addEventListener(
        "change",
        resetPaymentPageAndRender
    );

    elements.prev?.addEventListener(
        "click",
        function () {
            if (paymentRecordCurrentPage > 1) {
                paymentRecordCurrentPage -= 1;
                renderPaymentRecords();
            }
        }
    );

    elements.next?.addEventListener(
        "click",
        function () {
            paymentRecordCurrentPage += 1;
            renderPaymentRecords();
        }
    );

    renderPaymentRecords();
}