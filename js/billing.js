// =====================================
// TABLETAP - BILLING & CASHIER MODULE
// =====================================

let billingSearchTerm = "";
let billingStatusValue = "all";
let billingSortValue = "newest";

function escapeBillingHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getCurrency() {
    return restaurantSettings.currency || "SAR";
}

function calculateBill(order) {
    const subtotal = (order.items || []).reduce(function (total, item) {
        return (
            total +
            Number(item.price || 0) *
            Number(item.quantity || 0)
        );
    }, 0);

    const vatPercent =
        Number(restaurantSettings.vatPercent || 0);

    const vatAmount =
        subtotal * (vatPercent / 100);

    const grandTotal =
        subtotal + vatAmount;

    return {
        subtotal,
        vatPercent,
        vatAmount,
        grandTotal
    };
}

function getUnpaidOrders() {
    return orders.filter(function (order) {
        return (
            order.status !== "Completed" &&
            order.paymentStatus !== "Paid"
        );
    });
}

function getPaymentMethodForOrder(orderId) {
    const paymentSelect = document.querySelector(
        `[data-payment-order="${CSS.escape(String(orderId))}"]`
    );

    return paymentSelect
        ? paymentSelect.value
        : "Cash";
}

function getBillingOrderDate(order) {
    const dateValue =
        order.createdAt ||
        order.date ||
        order.timestamp;

    const parsedDate = dateValue
        ? new Date(dateValue)
        : null;

    return parsedDate &&
        !Number.isNaN(parsedDate.getTime())
        ? parsedDate
        : null;
}

function formatBillingElapsed(order) {
    const createdDate = getBillingOrderDate(order);

    if (!createdDate) {
        return "Time unavailable";
    }

    const minutes = Math.max(
        0,
        Math.floor(
            (Date.now() - createdDate.getTime()) / 60000
        )
    );

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
}

function getBillingElements() {
    return {
        search: document.getElementById("billingOrderSearch"),
        status: document.getElementById("billingStatusFilter"),
        sort: document.getElementById("billingSortOrder"),
        pendingCount: document.getElementById("billingPendingCount"),
        pendingValue: document.getElementById("billingPendingValue"),
        collectedToday: document.getElementById("billingCollectedToday"),
        averageBill: document.getElementById("billingAverageBill"),
        visibleCount: document.getElementById("billingVisibleCount"),
        activeFilter: document.getElementById("billingActiveFilter")
    };
}

function getCollectedTodayTotal() {
    const today = new Date();

    return orders
        .filter(function (order) {
            if (
                order.paymentStatus !== "Paid" &&
                order.status !== "Completed"
            ) {
                return false;
            }

            const paidDateValue =
                order.paidAt ||
                order.completedAt;

            if (!paidDateValue) {
                return false;
            }

            const paidDate = new Date(paidDateValue);

            return (
                !Number.isNaN(paidDate.getTime()) &&
                paidDate.getFullYear() === today.getFullYear() &&
                paidDate.getMonth() === today.getMonth() &&
                paidDate.getDate() === today.getDate()
            );
        })
        .reduce(function (total, order) {
            const storedTotal = Number(order.total);

            return total + (
                Number.isFinite(storedTotal)
                    ? storedTotal
                    : calculateBill(order).grandTotal
            );
        }, 0);
}

function updateBillingSummary(unpaidOrders) {
    const elements = getBillingElements();
    const currency = getCurrency();

    const pendingValue = unpaidOrders.reduce(
        function (total, order) {
            return total + calculateBill(order).grandTotal;
        },
        0
    );

    const averageBill =
        unpaidOrders.length > 0
            ? pendingValue / unpaidOrders.length
            : 0;

    if (elements.pendingCount) {
        elements.pendingCount.textContent =
            String(unpaidOrders.length);
    }

    if (elements.pendingValue) {
        elements.pendingValue.textContent =
            `${currency} ${pendingValue.toFixed(2)}`;
    }

    if (elements.collectedToday) {
        elements.collectedToday.textContent =
            `${currency} ${getCollectedTodayTotal().toFixed(2)}`;
    }

    if (elements.averageBill) {
        elements.averageBill.textContent =
            `${currency} ${averageBill.toFixed(2)}`;
    }
}

function getVisibleBillingOrders(unpaidOrders) {
    const normalizedSearch =
        billingSearchTerm.toLowerCase();

    const filteredOrders = unpaidOrders.filter(
        function (order) {
            const customer = order.customer || {};

            const searchableText = [
                order.id,
                customer.name,
                customer.phone,
                customer.table
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                searchableText.includes(normalizedSearch);

            const matchesStatus =
                billingStatusValue === "all" ||
                String(order.status || "New") ===
                billingStatusValue;

            return matchesSearch && matchesStatus;
        }
    );

    return filteredOrders.sort(function (first, second) {
        const firstBill = calculateBill(first);
        const secondBill = calculateBill(second);

        if (billingSortValue === "highest") {
            return secondBill.grandTotal -
                firstBill.grandTotal;
        }

        if (billingSortValue === "lowest") {
            return firstBill.grandTotal -
                secondBill.grandTotal;
        }

        const firstDate =
            getBillingOrderDate(first)?.getTime() || 0;

        const secondDate =
            getBillingOrderDate(second)?.getTime() || 0;

        return billingSortValue === "oldest"
            ? firstDate - secondDate
            : secondDate - firstDate;
    });
}

function saveOrdersAndRefresh() {
    localStorage.setItem(
        "tableTapOrders",
        JSON.stringify(orders)
    );

    const latestOrder = JSON.parse(
        localStorage.getItem("tableTapLatestOrder")
    );

    if (latestOrder) {
        const updatedLatest = orders.find(function (order) {
            return String(order.id) ===
                String(latestOrder.id);
        });

        if (updatedLatest) {
            localStorage.setItem(
                "tableTapLatestOrder",
                JSON.stringify(updatedLatest)
            );
        }
    }

    loadStats();
    renderOrderHistory();
    renderRestaurantFloor();
    renderBilling();
    renderPaymentRecords();
}

function renderBilling() {
    const unpaidOrders = getUnpaidOrders();
    const visibleOrders =
        getVisibleBillingOrders(unpaidOrders);
    const elements = getBillingElements();
    const currency = getCurrency();

    billingOrdersGrid.innerHTML = "";

    billingOrderCount.textContent =
        `${unpaidOrders.length} unpaid order${unpaidOrders.length === 1 ? "" : "s"
        }`;

    updateBillingSummary(unpaidOrders);

    if (elements.visibleCount) {
        elements.visibleCount.textContent =
            `${visibleOrders.length} ${visibleOrders.length === 1
                ? "bill"
                : "bills"
            }`;
    }

    if (elements.activeFilter) {
        const filterParts = [];

        if (billingSearchTerm) {
            filterParts.push(
                `searching “${billingSearchTerm}”`
            );
        }

        if (billingStatusValue !== "all") {
            filterParts.push(
                `status: ${billingStatusValue}`
            );
        }

        elements.activeFilter.textContent =
            filterParts.length > 0
                ? filterParts.join(" · ")
                : "Showing all unpaid orders";
    }

    if (unpaidOrders.length === 0) {
        billingEmptyState.hidden = false;
        billingEmptyState.querySelector("h3").textContent =
            "No unpaid orders";
        billingEmptyState.querySelector("p").textContent =
            "Active customer orders will appear here automatically.";
        return;
    }

    if (visibleOrders.length === 0) {
        billingEmptyState.hidden = false;
        billingEmptyState.querySelector("h3").textContent =
            "No matching bills";
        billingEmptyState.querySelector("p").textContent =
            "Try another search term or status filter.";
        return;
    }

    billingEmptyState.hidden = true;

    visibleOrders.forEach(function (order) {
        const bill = calculateBill(order);
        const customer = order.customer || {};
        const itemCount = (order.items || []).reduce(
            function (total, item) {
                return total +
                    Number(item.quantity || 0);
            },
            0
        );

        const itemsHtml = (order.items || [])
            .map(function (item) {
                const quantity =
                    Number(item.quantity || 0);

                const lineTotal =
                    Number(item.price || 0) * quantity;

                return `
                    <div class="billing-item">
                        <span>
                            ${escapeBillingHtml(item.name)}
                            × ${quantity}
                        </span>

                        <strong>
                            ${escapeBillingHtml(currency)}
                            ${lineTotal.toFixed(2)}
                        </strong>
                    </div>
                `;
            })
            .join("");

        const card = document.createElement("article");
        card.className = "billing-card billing-v2-card";

        card.innerHTML = `
            <div class="billing-card-header">
                <div class="billing-card-identity">
                    <span class="billing-table-icon">▦</span>

                    <div>
                        <h3>
                            Table
                            ${escapeBillingHtml(
            customer.table || "—"
        )}
                        </h3>

                        <span class="billing-order-id">
                            ${escapeBillingHtml(
            order.id || "Unknown Order"
        )}
                        </span>
                    </div>
                </div>

                <span class="billing-status">
                    ${escapeBillingHtml(order.status || "New")}
                </span>
            </div>

            <div class="billing-card-meta">
                <span>
                    <small>Customer</small>
                    <strong>
                        ${escapeBillingHtml(
            customer.name || "Walk-in"
        )}
                    </strong>
                </span>

                <span>
                    <small>Items</small>
                    <strong>${itemCount}</strong>
                </span>

                <span>
                    <small>Elapsed</small>
                    <strong>
                        ${escapeBillingHtml(
            formatBillingElapsed(order)
        )}
                    </strong>
                </span>
            </div>

            <div class="billing-items">
                ${itemsHtml || "<p>No items available.</p>"}
            </div>

            <div class="billing-totals">
                <div class="billing-total-line">
                    <span>Subtotal</span>
                    <strong>
                        ${escapeBillingHtml(currency)}
                        ${bill.subtotal.toFixed(2)}
                    </strong>
                </div>

                <div class="billing-total-line">
                    <span>VAT (${bill.vatPercent}%)</span>
                    <strong>
                        ${escapeBillingHtml(currency)}
                        ${bill.vatAmount.toFixed(2)}
                    </strong>
                </div>

                <div class="billing-total-line grand-total">
                    <span>Amount Due</span>
                    <strong>
                        ${escapeBillingHtml(currency)}
                        ${bill.grandTotal.toFixed(2)}
                    </strong>
                </div>
            </div>

            <div class="billing-payment-field">
                <label>
                    Payment Method
                </label>

                <select data-payment-order="${escapeBillingHtml(order.id)
            }">
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Apple Pay">Apple Pay</option>
                    <option value="Pay at Counter">
                        Pay at Counter
                    </option>
                </select>
            </div>

            <div class="billing-actions">
                <button type="button"
                        class="generate-bill-button"
                        onclick="openBill('${escapeBillingHtml(order.id)
            }')">
                    View Bill
                </button>

                <button type="button"
                        class="mark-paid-button"
                        onclick="markOrderPaid('${escapeBillingHtml(order.id)
            }')">
                    Collect Payment
                </button>
            </div>
        `;

        billingOrdersGrid.appendChild(card);
    });
}

function buildReceipt(order) {
    const bill = calculateBill(order);
    const currency = getCurrency();
    const customer = order.customer || {};
    const paymentMethod =
        getPaymentMethodForOrder(order.id);

    const itemsHtml = (order.items || [])
        .map(function (item) {
            const quantity =
                Number(item.quantity || 0);

            const unitPrice =
                Number(item.price || 0);

            const lineTotal =
                unitPrice * quantity;

            return `
                <div class="receipt-item receipt-item-detailed">
                    <div>
                        <strong>
                            ${escapeBillingHtml(item.name)}
                        </strong>
                        <small>
                            ${quantity} ×
                            ${escapeBillingHtml(currency)}
                            ${unitPrice.toFixed(2)}
                        </small>
                    </div>

                    <strong>
                        ${escapeBillingHtml(currency)}
                        ${lineTotal.toFixed(2)}
                    </strong>
                </div>
            `;
        })
        .join("");

    const receiptDate =
        getBillingOrderDate(order) ||
        new Date();

    return `
        <div class="receipt-header">
            <div class="receipt-brand-mark">TT</div>

            <h2>
                ${escapeBillingHtml(
        restaurantSettings.restaurantName ||
        "Restaurant"
    )}
            </h2>

            <p>
                ${escapeBillingHtml(
        restaurantSettings.branchName || ""
    )}
            </p>

            ${restaurantSettings.address
            ? `<p>${escapeBillingHtml(
                restaurantSettings.address
            )}</p>`
            : ""
        }

            ${restaurantSettings.phone
            ? `<p>Tel: ${escapeBillingHtml(
                restaurantSettings.phone
            )}</p>`
            : ""
        }

            ${restaurantSettings.vatNumber
            ? `<p>VAT No: ${escapeBillingHtml(
                restaurantSettings.vatNumber
            )}</p>`
            : ""
        }
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-meta receipt-meta-grid">
            <span>
                <small>Order</small>
                <strong>
                    ${escapeBillingHtml(
            order.id || "Unknown"
        )}
                </strong>
            </span>

            <span>
                <small>Table</small>
                <strong>
                    ${escapeBillingHtml(
            customer.table || "—"
        )}
                </strong>
            </span>

            <span>
                <small>Customer</small>
                <strong>
                    ${escapeBillingHtml(
            customer.name || "Walk-in"
        )}
                </strong>
            </span>

            <span>
                <small>Date</small>
                <strong>
                    ${escapeBillingHtml(
            receiptDate.toLocaleString()
        )}
                </strong>
            </span>

            <span>
                <small>Payment</small>
                <strong>
                    ${escapeBillingHtml(paymentMethod)}
                </strong>
            </span>
        </div>

        <div class="receipt-items-heading">
            <span>Item</span>
            <span>Amount</span>
        </div>

        <div class="receipt-items-list">
            ${itemsHtml || "<p>No items available.</p>"}
        </div>

        <div class="receipt-summary">
            <div class="receipt-summary-line">
                <span>Subtotal</span>
                <strong>
                    ${escapeBillingHtml(currency)}
                    ${bill.subtotal.toFixed(2)}
                </strong>
            </div>

            <div class="receipt-summary-line">
                <span>VAT (${bill.vatPercent}%)</span>
                <strong>
                    ${escapeBillingHtml(currency)}
                    ${bill.vatAmount.toFixed(2)}
                </strong>
            </div>

            <div class="receipt-summary-line total">
                <span>Total</span>
                <strong>
                    ${escapeBillingHtml(currency)}
                    ${bill.grandTotal.toFixed(2)}
                </strong>
            </div>
        </div>

        <div class="receipt-footer">
            <p>
                ${escapeBillingHtml(
            restaurantSettings.receiptFooter ||
            "Thank you. Please visit again."
        )}
            </p>

            <small>Powered by TableTap</small>
        </div>
    `;
}

function openBill(orderId) {
    const order = orders.find(function (item) {
        return String(item.id) === String(orderId);
    });

    if (!order) {
        alert("Order not found.");
        return;
    }

    selectedBillingOrderId = order.id;
    printableBill.innerHTML = buildReceipt(order);

    billModalSubtitle.textContent =
        `${order.id} · Table ${order.customer?.table || "—"
        }`;

    billModal.classList.add("show");
    billModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeBill() {
    billModal.classList.remove("show");
    billModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    selectedBillingOrderId = null;
}

function printSelectedBill() {
    if (selectedBillingOrderId === null) {
        alert("Please open a bill before printing.");
        return;
    }

    const order = orders.find(function (item) {
        return String(item.id) ===
            String(selectedBillingOrderId);
    });

    if (!order) {
        alert("Order not found.");
        return;
    }

    const receiptHtml = buildReceipt(order);

    const printWindow = window.open(
        "",
        "TableTapReceipt",
        "width=520,height=760"
    );

    if (!printWindow) {
        alert(
            "The print window was blocked. Please allow pop-ups and try again."
        );
        return;
    }

    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport"
                  content="width=device-width, initial-scale=1.0">
            <title>
                Receipt ${escapeBillingHtml(order.id)}
            </title>

            <style>
                @page {
                    size: 80mm auto;
                    margin: 5mm;
                }

                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    margin: 0;
                    padding: 0;
                    background: #ffffff;
                    color: #111827;
                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;
                }

                body {
                    width: 100%;
                    font-size: 12px;
                    line-height: 1.45;
                }

                .printable-bill {
                    width: 100%;
                    max-width: 72mm;
                    margin: 0 auto;
                    padding: 0;
                    border: 0;
                    background: #ffffff;
                }

                .receipt-header {
                    text-align: center;
                    margin-bottom: 12px;
                }

                .receipt-brand-mark {
                    width: 34px;
                    height: 34px;
                    display: grid;
                    place-items: center;
                    margin: 0 auto 8px;
                    border: 1px solid #111827;
                    border-radius: 8px;
                    font-weight: 800;
                }

                .receipt-header h2 {
                    margin: 0 0 3px;
                    font-size: 18px;
                }

                .receipt-header p {
                    margin: 2px 0;
                    color: #374151;
                    font-size: 10px;
                }

                .receipt-divider {
                    border-top: 1px dashed #6b7280;
                    margin: 10px 0;
                }

                .receipt-meta-grid {
                    display: grid;
                    gap: 5px;
                    margin-bottom: 10px;
                }

                .receipt-meta-grid span {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                }

                .receipt-meta-grid small {
                    color: #6b7280;
                }

                .receipt-items-heading {
                    display: flex;
                    justify-content: space-between;
                    padding: 7px 0;
                    border-top: 1px dashed #6b7280;
                    border-bottom: 1px dashed #6b7280;
                    font-weight: 700;
                }

                .receipt-item-detailed {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 8px 0;
                    border-bottom: 1px dotted #d1d5db;
                    page-break-inside: avoid;
                }

                .receipt-item-detailed div {
                    min-width: 0;
                }

                .receipt-item-detailed strong {
                    display: block;
                }

                .receipt-item-detailed small {
                    display: block;
                    margin-top: 2px;
                    color: #6b7280;
                    font-size: 9px;
                }

                .receipt-summary {
                    display: grid;
                    gap: 6px;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px dashed #6b7280;
                }

                .receipt-summary-line {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                }

                .receipt-summary-line.total {
                    margin-top: 4px;
                    padding-top: 7px;
                    border-top: 2px solid #111827;
                    font-size: 15px;
                    font-weight: 800;
                }

                .receipt-footer {
                    margin-top: 14px;
                    padding-top: 10px;
                    border-top: 1px dashed #6b7280;
                    text-align: center;
                }

                .receipt-footer p {
                    margin: 0 0 5px;
                }

                .receipt-footer small {
                    color: #6b7280;
                    font-size: 9px;
                }

                @media print {
                    html,
                    body {
                        width: 80mm;
                    }

                    .printable-bill {
                        max-width: none;
                    }
                }
            </style>
        </head>

        <body>
            <main class="printable-bill">
                ${receiptHtml}
            </main>
        </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.addEventListener(
        "load",
        function () {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        },
        { once: true }
    );
}

function markOrderPaid(orderId) {
    const order = orders.find(function (item) {
        return String(item.id) === String(orderId);
    });

    if (!order) {
        alert("Order not found.");
        return;
    }

    const paymentMethod =
        getPaymentMethodForOrder(orderId);

    const bill = calculateBill(order);

    const confirmed = confirm(
        `Confirm ${paymentMethod} payment of ` +
        `${getCurrency()} ${bill.grandTotal.toFixed(2)}?`
    );

    if (!confirmed) {
        return;
    }

    order.paymentStatus = "Paid";
    order.paymentMethod = paymentMethod;
    order.paidAt = new Date().toISOString();
    order.completedAt = new Date().toISOString();
    order.billSubtotal =
        Number(bill.subtotal.toFixed(2));
    order.vatPercent = bill.vatPercent;
    order.vatAmount =
        Number(bill.vatAmount.toFixed(2));
    order.total =
        Number(bill.grandTotal.toFixed(2));
    order.status = "Completed";

    saveOrdersAndRefresh();

    if (
        selectedBillingOrderId !== null &&
        String(selectedBillingOrderId) ===
        String(orderId)
    ) {
        closeBill();
    }

    alert(
        "Payment recorded. The table is now available."
    );
}

function initBillingModule() {
    const elements = getBillingElements();

    if (openBillingLink) {
        openBillingLink.addEventListener(
            "click",
            function () {
                billingSection.open = true;
            }
        );
    }

    if (elements.search) {
        elements.search.addEventListener(
            "input",
            function (event) {
                billingSearchTerm =
                    event.target.value.trim();
                renderBilling();
            }
        );
    }

    if (elements.status) {
        elements.status.addEventListener(
            "change",
            function (event) {
                billingStatusValue =
                    event.target.value;
                renderBilling();
            }
        );
    }

    if (elements.sort) {
        elements.sort.addEventListener(
            "change",
            function (event) {
                billingSortValue =
                    event.target.value;
                renderBilling();
            }
        );
    }

    closeBillModalButton.addEventListener(
        "click",
        closeBill
    );

    billModalOverlay.addEventListener(
        "click",
        closeBill
    );

    printBillButton.addEventListener(
        "click",
        printSelectedBill
    );

    modalMarkPaidButton.addEventListener(
        "click",
        function () {
            if (selectedBillingOrderId !== null) {
                markOrderPaid(
                    selectedBillingOrderId
                );
            }
        }
    );

    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Escape" &&
                billModal.classList.contains("show")
            ) {
                closeBill();
            }
        }
    );

    renderBilling();
}