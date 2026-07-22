// =====================================
// TABLETAP - BILLING & CASHIER MODULE
// =====================================

function getCurrency() {
    return restaurantSettings.currency || "SAR";
}

function calculateBill(order) {
    const subtotal =
        (order.items || []).reduce(function (total, item) {
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
    const paymentSelect =
        document.querySelector(
            `[data-payment-order="${CSS.escape(String(orderId))}"]`
        );

    return paymentSelect
        ? paymentSelect.value
        : "Cash";
}

function saveOrdersAndRefresh() {
    localStorage.setItem(
        "tableTapOrders",
        JSON.stringify(orders)
    );

    const latestOrder =
        JSON.parse(
            localStorage.getItem("tableTapLatestOrder")
        );

    if (latestOrder) {
        const updatedLatest =
            orders.find(function (order) {
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

    billingOrdersGrid.innerHTML = "";

    billingOrderCount.textContent =
        `${unpaidOrders.length} unpaid order${
            unpaidOrders.length === 1 ? "" : "s"
        }`;

    if (unpaidOrders.length === 0) {
        billingEmptyState.hidden = false;
        return;
    }

    billingEmptyState.hidden = true;

    unpaidOrders
        .slice()
        .reverse()
        .forEach(function (order) {
            const bill = calculateBill(order);
            const currency = getCurrency();

            const itemsHtml =
                (order.items || [])
                    .map(function (item) {
                        const quantity =
                            Number(item.quantity || 0);

                        const lineTotal =
                            Number(item.price || 0) * quantity;

                        return `
                            <div class="billing-item">
                                <span>
                                    ${item.name} × ${quantity}
                                </span>

                                <strong>
                                    ${currency}
                                    ${lineTotal.toFixed(2)}
                                </strong>
                            </div>
                        `;
                    })
                    .join("");

            const card =
                document.createElement("article");

            card.className = "billing-card";

            card.innerHTML = `
                <div class="billing-card-header">
                    <div>
                        <h3>
                            Table
                            ${order.customer?.table || "—"}
                        </h3>

                        <span class="billing-order-id">
                            ${order.id || "Unknown Order"}
                        </span>
                    </div>

                    <span class="billing-status">
                        ${order.status || "New"}
                    </span>
                </div>

                <div class="billing-customer">
                    <p>
                        <strong>Customer:</strong>
                        ${order.customer?.name || "Unknown"}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${order.customer?.phone || "Not provided"}
                    </p>
                </div>

                <div class="billing-items">
                    ${itemsHtml || "<p>No items available.</p>"}
                </div>

                <div class="billing-totals">
                    <div class="billing-total-line">
                        <span>Subtotal</span>

                        <strong>
                            ${currency}
                            ${bill.subtotal.toFixed(2)}
                        </strong>
                    </div>

                    <div class="billing-total-line">
                        <span>VAT (${bill.vatPercent}%)</span>

                        <strong>
                            ${currency}
                            ${bill.vatAmount.toFixed(2)}
                        </strong>
                    </div>

                    <div class="billing-total-line grand-total">
                        <span>Grand Total</span>

                        <strong>
                            ${currency}
                            ${bill.grandTotal.toFixed(2)}
                        </strong>
                    </div>
                </div>

                <div class="billing-payment-field">
                    <label>Payment Method</label>

                    <select
                        data-payment-order="${order.id}"
                    >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Apple Pay">Apple Pay</option>
                        <option value="Pay at Counter">
                            Pay at Counter
                        </option>
                    </select>
                </div>

                <div class="billing-actions">
                    <button
                        type="button"
                        class="generate-bill-button"
                        onclick="openBill('${order.id}')"
                    >
                        Generate Bill
                    </button>

                    <button
                        type="button"
                        class="mark-paid-button"
                        onclick="markOrderPaid('${order.id}')"
                    >
                        Mark Paid
                    </button>
                </div>
            `;

            billingOrdersGrid.appendChild(card);
        });
}

function buildReceipt(order) {
    const bill = calculateBill(order);
    const currency = getCurrency();

    const itemsHtml =
        (order.items || [])
            .map(function (item) {
                const quantity =
                    Number(item.quantity || 0);

                const lineTotal =
                    Number(item.price || 0) * quantity;

                return `
                    <div class="receipt-item">
                        <span>
                            ${item.name} × ${quantity}
                        </span>

                        <strong>
                            ${currency}
                            ${lineTotal.toFixed(2)}
                        </strong>
                    </div>
                `;
            })
            .join("");

    return `
        <div class="receipt-header">
            <h2>
                ${
                    restaurantSettings.restaurantName ||
                    "Restaurant"
                }
            </h2>

            <p>
                ${restaurantSettings.branchName || ""}
            </p>

            ${
                restaurantSettings.address
                    ? `<p>${restaurantSettings.address}</p>`
                    : ""
            }

            ${
                restaurantSettings.vatNumber
                    ? `<p>VAT No: ${restaurantSettings.vatNumber}</p>`
                    : ""
            }
        </div>

        <div class="receipt-meta">
            <span>
                <strong>Order:</strong>
                ${order.id || "Unknown"}
            </span>

            <span>
                <strong>Table:</strong>
                ${order.customer?.table || "—"}
            </span>

            <span>
                <strong>Customer:</strong>
                ${order.customer?.name || "Unknown"}
            </span>

            <span>
                <strong>Date:</strong>
                ${new Date().toLocaleString()}
            </span>
        </div>

        <div>
            ${itemsHtml || "<p>No items available.</p>"}
        </div>

        <div class="receipt-summary">
            <div class="receipt-summary-line">
                <span>Subtotal</span>

                <strong>
                    ${currency}
                    ${bill.subtotal.toFixed(2)}
                </strong>
            </div>

            <div class="receipt-summary-line">
                <span>VAT (${bill.vatPercent}%)</span>

                <strong>
                    ${currency}
                    ${bill.vatAmount.toFixed(2)}
                </strong>
            </div>

            <div class="receipt-summary-line total">
                <span>Total</span>

                <strong>
                    ${currency}
                    ${bill.grandTotal.toFixed(2)}
                </strong>
            </div>
        </div>

        <div class="receipt-footer">
            <p>
                ${
                    restaurantSettings.receiptFooter ||
                    "Thank you. Please visit again."
                }
            </p>
        </div>
    `;
}

function openBill(orderId) {
    const order =
        orders.find(function (item) {
            return String(item.id) === String(orderId);
        });

    if (!order) {
        alert("Order not found.");
        return;
    }

    selectedBillingOrderId = order.id;

    printableBill.innerHTML =
        buildReceipt(order);

    billModalSubtitle.textContent =
        `${order.id} · Table ${
            order.customer?.table || "—"
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

function markOrderPaid(orderId) {
    const order =
        orders.find(function (item) {
            return String(item.id) === String(orderId);
        });

    if (!order) {
        alert("Order not found.");
        return;
    }

    const paymentMethod =
        getPaymentMethodForOrder(orderId);

    const bill =
        calculateBill(order);

    const confirmed =
        confirm(
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

    order.vatPercent =
        bill.vatPercent;

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
    openBillingLink.addEventListener(
        "click",
        function () {
            billingSection.open = true;
        }
    );

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
        function () {
            window.print();
        }
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
}