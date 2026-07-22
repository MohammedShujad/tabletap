// =====================================
// TABLETAP - PAYMENT RECORDS MODULE
// =====================================

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
    if (filterValue === "all") {
        return true;
    }

    const orderDate =
        getPaymentRecordDate(order);

    if (!orderDate) {
        return false;
    }

    const now = new Date();

    const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const tomorrowStart =
        new Date(todayStart);

    tomorrowStart.setDate(
        tomorrowStart.getDate() + 1
    );

    if (filterValue === "today") {
        return (
            orderDate >= todayStart &&
            orderDate < tomorrowStart
        );
    }

    const yesterdayStart =
        new Date(todayStart);

    yesterdayStart.setDate(
        yesterdayStart.getDate() - 1
    );

    if (filterValue === "yesterday") {
        return (
            orderDate >= yesterdayStart &&
            orderDate < todayStart
        );
    }

    if (filterValue === "week") {
        const weekStart =
            new Date(todayStart);

        weekStart.setDate(
            weekStart.getDate() - 6
        );

        return (
            orderDate >= weekStart &&
            orderDate < tomorrowStart
        );
    }

    if (filterValue === "month") {
        return (
            orderDate.getFullYear() ===
                now.getFullYear() &&
            orderDate.getMonth() ===
                now.getMonth()
        );
    }

    return true;
}

function getFilteredPaymentRecords() {
    const searchValue =
        paymentRecordSearch.value
            .trim()
            .toLowerCase();

    const dateFilter =
        paymentRecordDateFilter.value;

    const methodFilter =
        paymentRecordMethodFilter.value;

    return getPaidOrders().filter(function (order) {
        const orderId =
            String(order.id || "")
                .toLowerCase();

        const customerName =
            String(order.customer?.name || "")
                .toLowerCase();

        const phone =
            String(order.customer?.phone || "")
                .toLowerCase();

        const table =
            String(order.customer?.table || "")
                .toLowerCase();

        const matchesSearch =
            !searchValue ||
            orderId.includes(searchValue) ||
            customerName.includes(searchValue) ||
            phone.includes(searchValue) ||
            table.includes(searchValue);

        const matchesMethod =
            methodFilter === "all" ||
            order.paymentMethod === methodFilter;

        const matchesDate =
            matchesPaymentDateFilter(
                order,
                dateFilter
            );

        return (
            matchesSearch &&
            matchesMethod &&
            matchesDate
        );
    });
}

function updatePaymentSummary(filteredOrders) {
    const currency = getCurrency();

    const totals =
        filteredOrders.reduce(
            function (summary, order) {
                const fallbackBill =
                    calculateBill(order);

                summary.subtotal +=
                    Number(
                        order.billSubtotal ??
                        fallbackBill.subtotal
                    );

                summary.vat +=
                    Number(
                        order.vatAmount ??
                        fallbackBill.vatAmount
                    );

                summary.total +=
                    Number(
                        order.total ??
                        fallbackBill.grandTotal
                    );

                return summary;
            },
            {
                subtotal: 0,
                vat: 0,
                total: 0
            }
        );

    paymentSummaryCount.textContent =
        filteredOrders.length;

    paymentSummaryCurrency1.textContent =
        currency;

    paymentSummaryCurrency2.textContent =
        currency;

    paymentSummaryCurrency3.textContent =
        currency;

    paymentSummarySubtotal.textContent =
        totals.subtotal.toFixed(2);

    paymentSummaryVat.textContent =
        totals.vat.toFixed(2);

    paymentSummaryTotal.textContent =
        totals.total.toFixed(2);
}

function renderPaymentRecords() {
    const filteredOrders =
        getFilteredPaymentRecords();

    paymentRecordsGrid.innerHTML = "";

    paymentRecordsCount.textContent =
        `${filteredOrders.length} payment${
            filteredOrders.length === 1 ? "" : "s"
        }`;

    updatePaymentSummary(filteredOrders);

    if (filteredOrders.length === 0) {
        paymentRecordsEmpty.hidden = false;
        return;
    }

    paymentRecordsEmpty.hidden = true;

    filteredOrders
        .slice()
        .sort(function (first, second) {
            const firstDate =
                getPaymentRecordDate(first);

            const secondDate =
                getPaymentRecordDate(second);

            return (
                (secondDate?.getTime() || 0) -
                (firstDate?.getTime() || 0)
            );
        })
        .forEach(function (order) {
            const fallbackBill =
                calculateBill(order);

            const currency =
                getCurrency();

            const subtotal =
                Number(
                    order.billSubtotal ??
                    fallbackBill.subtotal
                );

            const vatAmount =
                Number(
                    order.vatAmount ??
                    fallbackBill.vatAmount
                );

            const total =
                Number(
                    order.total ??
                    fallbackBill.grandTotal
                );

            const paidDate =
                getPaymentRecordDate(order);

            const card =
                document.createElement("article");

            card.className =
                "payment-record-card";

            card.innerHTML = `
                <div class="payment-record-header">
                    <div>
                        <h3>
                            ${order.id || "Unknown Order"}
                        </h3>

                        <small>
                            ${
                                paidDate
                                    ? paidDate.toLocaleString()
                                    : "Payment date unavailable"
                            }
                        </small>
                    </div>

                    <span class="payment-record-method">
                        ${order.paymentMethod || "Unknown"}
                    </span>
                </div>

                <div class="payment-record-meta">
                    <p>
                        <strong>Customer:</strong>
                        ${order.customer?.name || "Unknown"}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${order.customer?.phone || "Not provided"}
                    </p>

                    <p>
                        <strong>Table:</strong>
                        ${order.customer?.table || "—"}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${order.paymentStatus || "Paid"}
                    </p>
                </div>

                <div class="payment-record-totals">
                    <div class="payment-record-line">
                        <span>Subtotal</span>

                        <strong>
                            ${currency}
                            ${subtotal.toFixed(2)}
                        </strong>
                    </div>

                    <div class="payment-record-line">
                        <span>VAT</span>

                        <strong>
                            ${currency}
                            ${vatAmount.toFixed(2)}
                        </strong>
                    </div>

                    <div class="payment-record-line total">
                        <span>Total</span>

                        <strong>
                            ${currency}
                            ${total.toFixed(2)}
                        </strong>
                    </div>
                </div>

                <div class="payment-record-actions">
                    <button
                        type="button"
                        onclick="openBill('${order.id}')"
                    >
                        Reprint Receipt
                    </button>
                </div>
            `;

            paymentRecordsGrid.appendChild(card);
        });
}

function initPaymentRecordsModule() {
    openPaymentRecordsLink.addEventListener(
        "click",
        function () {
            paymentRecordsSection.open = true;
        }
    );

    paymentRecordSearch.addEventListener(
        "input",
        renderPaymentRecords
    );

    paymentRecordDateFilter.addEventListener(
        "change",
        renderPaymentRecords
    );

    paymentRecordMethodFilter.addEventListener(
        "change",
        renderPaymentRecords
    );
}