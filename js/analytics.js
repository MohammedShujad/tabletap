// =====================================
// TABLETAP - ANALYTICS MODULE
// =====================================

function filterOrdersByPeriod(period) {
    const now = new Date();

    return orders.filter(function (order) {
        const orderDate = getOrderDate(order);

        if (!orderDate) {
            return period === "all";
        }

        if (period === "today") {
            return isSameDay(orderDate, now);
        }

        if (period === "yesterday") {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);

            return isSameDay(orderDate, yesterday);
        }

        if (period === "month") {
            return (
                orderDate.getFullYear() === now.getFullYear() &&
                orderDate.getMonth() === now.getMonth()
            );
        }

        if (
            period === "custom" &&
            customStartDate &&
            customEndDate
        ) {
            const start =
                new Date(customStartDate + "T00:00:00");

            const end =
                new Date(customEndDate + "T23:59:59.999");

            return (
                orderDate >= start &&
                orderDate <= end
            );
        }

        return true;
    });
}

function calculateBestSellingItem(filteredOrders) {
    const itemSales = {};

    filteredOrders.forEach(function (order) {
        (order.items || []).forEach(function (item) {
            const itemName =
                item.name || "Unknown Item";

            itemSales[itemName] =
                (itemSales[itemName] || 0) +
                Number(item.quantity || 0);
        });
    });

    const entries =
        Object.entries(itemSales);

    if (entries.length === 0) {
        return "—";
    }

    entries.sort(function (first, second) {
        return second[1] - first[1];
    });

    return entries[0][0];
}

function calculateTopCategory(filteredOrders) {
    const categorySales = {};

    filteredOrders.forEach(function (order) {
        (order.items || []).forEach(function (item) {
            const category =
                item.category || "Uncategorized";

            categorySales[category] =
                (categorySales[category] || 0) +
                Number(item.quantity || 0);
        });
    });

    const entries =
        Object.entries(categorySales);

    if (entries.length === 0) {
        return "—";
    }

    entries.sort(function (first, second) {
        return second[1] - first[1];
    });

    return entries[0][0];
}

function loadStats() {
    const filteredOrders =
        filterOrdersByPeriod(
            selectedAnalyticsPeriod
        );

    const completedOrders =
        filteredOrders.filter(function (order) {
            return order.status === "Completed";
        });

    const activeOrders =
        filteredOrders.filter(function (order) {
            return order.status !== "Completed";
        });

    const totalRevenue =
        completedOrders.reduce(function (total, order) {
            return total + Number(order.total || 0);
        }, 0);

    const averageOrder =
        completedOrders.length > 0
            ? totalRevenue / completedOrders.length
            : 0;

    document
        .getElementById("totalOrders")
        .textContent =
        filteredOrders.length;

    document
        .getElementById("totalRevenue")
        .textContent =
        totalRevenue.toFixed(2);

    document
        .getElementById("completedOrders")
        .textContent =
        completedOrders.length;

    document
        .getElementById("activeOrders")
        .textContent =
        activeOrders.length;

    document
        .getElementById("averageOrder")
        .textContent =
        averageOrder.toFixed(2);

    document
        .getElementById("bestSellingItem")
        .textContent =
        calculateBestSellingItem(filteredOrders);

    document
        .getElementById("topCategory")
        .textContent =
        calculateTopCategory(filteredOrders);

    document
        .getElementById("menuCount")
        .textContent =
        menuItems.length;
}

function initAnalyticsModule() {
    analyticsFilterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            analyticsFilterButtons.forEach(
                function (currentButton) {
                    currentButton.classList.remove(
                        "active"
                    );
                }
            );

            toggleCustomDateButton.classList.remove(
                "active"
            );

            customDatePanel.classList.remove(
                "show"
            );

            button.classList.add("active");

            selectedAnalyticsPeriod =
                button.dataset.period;

            loadStats();
        });
    });

    toggleCustomDateButton.addEventListener(
        "click",
        function () {
            customDatePanel.classList.toggle(
                "show"
            );

            toggleCustomDateButton.classList.toggle(
                "active",
                customDatePanel.classList.contains(
                    "show"
                )
            );
        }
    );

    clearCustomDateButton.addEventListener(
        "click",
        function () {
            startDateInput.value = "";
            endDateInput.value = "";

            customStartDate = null;
            customEndDate = null;
            selectedAnalyticsPeriod = "today";

            customDatePanel.classList.remove(
                "show"
            );

            toggleCustomDateButton.classList.remove(
                "active"
            );

            analyticsFilterButtons.forEach(
                function (button) {
                    button.classList.toggle(
                        "active",
                        button.dataset.period ===
                            "today"
                    );
                }
            );

            loadStats();
        }
    );

    applyCustomDateButton.addEventListener(
        "click",
        function () {
            if (
                !startDateInput.value ||
                !endDateInput.value
            ) {
                alert(
                    "Please select both start and end dates."
                );

                return;
            }

            if (
                startDateInput.value >
                endDateInput.value
            ) {
                alert(
                    "Start date cannot be after end date."
                );

                return;
            }

            customStartDate =
                startDateInput.value;

            customEndDate =
                endDateInput.value;

            selectedAnalyticsPeriod =
                "custom";

            analyticsFilterButtons.forEach(
                function (button) {
                    button.classList.remove(
                        "active"
                    );
                }
            );

            toggleCustomDateButton.classList.add(
                "active"
            );

            customDatePanel.classList.remove(
                "show"
            );

            loadStats();
        }
    );
}