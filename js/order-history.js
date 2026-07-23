// =====================================
// TABLETAP - ORDER HISTORY MODULE
// =====================================

function getHistoryStatusClass(status) {
    return `history-status-${String(
        status || "New"
    ).toLowerCase()}`;
}

function getFilteredOrderHistory() {
    const searchText =
        orderSearch.value
            .trim()
            .toLowerCase();

    const selectedDate =
        orderDateFilter.value;

    const selectedStatus =
        orderStatusFilter.value;

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

    const yesterdayStart =
        new Date(todayStart);

    yesterdayStart.setDate(
        yesterdayStart.getDate() - 1
    );

    const weekStart =
        new Date(todayStart);

    weekStart.setDate(
        weekStart.getDate() - 6
    );

    return orders.filter(function (order) {
        const orderId =
            String(order.id || "")
                .toLowerCase();

        const customerName =
            String(
                order.customer?.name || ""
            ).toLowerCase();

        const phone =
            String(
                order.customer?.phone || ""
            ).toLowerCase();

        const orderDate =
            getOrderDate(order);

        const matchesSearch =
            !searchText ||
            orderId.includes(searchText) ||
            customerName.includes(searchText) ||
            phone.includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            order.status === selectedStatus;

        let matchesDate = true;

        if (selectedDate !== "all") {
            if (!orderDate) {
                matchesDate = false;
            } else if (
                selectedDate === "today"
            ) {
                matchesDate =
                    orderDate >= todayStart &&
                    orderDate < tomorrowStart;
            } else if (
                selectedDate === "yesterday"
            ) {
                matchesDate =
                    orderDate >= yesterdayStart &&
                    orderDate < todayStart;
            } else if (
                selectedDate === "week"
            ) {
                matchesDate =
                    orderDate >= weekStart &&
                    orderDate < tomorrowStart;
            }
        }

        return (
            matchesSearch &&
            matchesStatus &&
            matchesDate
        );
    });
}

function updateOrderHistoryLabel() {
    const labels = {
        today: "Showing today’s orders",
        yesterday: "Showing yesterday’s orders",
        week: "Showing the last 7 days",
        all: "Showing all orders"
    };

    activeHistoryFilter.textContent =
        labels[orderDateFilter.value] ||
        "Showing filtered orders";
}

function renderOrderHistory() {
    updateOrderHistoryLabel();

    const filteredOrders =
        getFilteredOrderHistory();

    orderHistoryContainer.innerHTML = "";

    orderHistoryCount.textContent =
        `${filteredOrders.length} order${
            filteredOrders.length === 1
                ? ""
                : "s"
        } found`;

    if (filteredOrders.length === 0) {
        orderHistoryContainer.innerHTML = `
            <div class="history-empty">
                <h3>No orders found</h3>
                <p>
                    Try another search or status filter.
                </p>
            </div>
        `;

        return;
    }

    filteredOrders
        .slice()
        .reverse()
        .forEach(function (order) {
            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "history-order-card";

            const itemsHtml =
                (order.items || [])
                    .map(function (item) {
                        const quantity =
                            Number(
                                item.quantity || 0
                            );

                        const lineTotal =
                            Number(
                                item.price || 0
                            ) * quantity;

                        return `
                            <div class="history-order-item">
                                <span>
                                    ${item.name}
                                    ×
                                    ${quantity}
                                </span>

                                <strong>
                                    SAR ${lineTotal.toFixed(2)}
                                </strong>
                            </div>
                        `;
                    })
                    .join("");

            card.innerHTML = `
                <h3>
                    ${order.id || "Unknown Order"}
                </h3>

                <div class="history-order-meta">
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
                        ${order.customer?.table || "Not provided"}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${order.createdAt || "Not available"}
                    </p>
                </div>

                <div>
                    ${
                        itemsHtml ||
                        "<p>No items available.</p>"
                    }
                </div>

                <div class="history-order-footer">
                    <span
                        class="history-status ${getHistoryStatusClass(
                            order.status
                        )}"
                    >
                        ${order.status || "New"}
                    </span>

                    <strong>
                        Total:
                        SAR
                        ${Number(
                            order.total || 0
                        ).toFixed(2)}
                    </strong>
                </div>
            `;

            orderHistoryContainer.appendChild(
                card
            );
        });
}

function initOrderHistoryModule() {
    orderSearch.addEventListener(
        "input",
        renderOrderHistory
    );

    orderDateFilter.addEventListener(
        "change",
        renderOrderHistory
    );

    orderStatusFilter.addEventListener(
        "change",
        renderOrderHistory
    );
}