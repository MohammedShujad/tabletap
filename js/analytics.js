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

            return orderDate >= start && orderDate <= end;
        }

        return true;
    });
}

function calculateBestSellingItem(filteredOrders) {
    const itemSales = {};

    filteredOrders.forEach(function (order) {
        (order.items || []).forEach(function (item) {
            const itemName = item.name || "Unknown Item";

            itemSales[itemName] =
                (itemSales[itemName] || 0) +
                Number(item.quantity || 0);
        });
    });

    const entries = Object.entries(itemSales);

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

    const entries = Object.entries(categorySales);

    if (entries.length === 0) {
        return "—";
    }

    entries.sort(function (first, second) {
        return second[1] - first[1];
    });

    return entries[0][0];
}

function getDashboardOrderTotal(order) {
    const storedTotal = Number(order.total);

    if (Number.isFinite(storedTotal)) {
        return storedTotal;
    }

    return (order.items || []).reduce(
        function (total, item) {
            return total +
                Number(item.price || 0) *
                Number(item.quantity || 0);
        },
        0
    );
}

function calculateDashboardActiveTables() {
    return tables.filter(function (table) {
        if (table.enabled === false) {
            return false;
        }

        return orders.some(function (order) {
            return (
                String(order.customer?.table || "") ===
                    String(table.number || table.name || "") &&
                order.status !== "Completed" &&
                order.status !== "Cancelled"
            );
        });
    }).length;
}

function renderDashboardHourlyChart(filteredOrders) {
    const chart =
        document.getElementById("dashboardHourlyChart");

    const peakLabel =
        document.getElementById("dashboardPeakHour");

    if (!chart || !peakLabel) {
        return;
    }

    const hourlyTotals = Array.from(
        { length: 24 },
        function () {
            return 0;
        }
    );

    filteredOrders.forEach(function (order) {
        if (order.status !== "Completed") {
            return;
        }

        const orderDate = getOrderDate(order);

        if (!orderDate) {
            return;
        }

        hourlyTotals[orderDate.getHours()] +=
            getDashboardOrderTotal(order);
    });

    const visibleHours = hourlyTotals
        .map(function (value, hour) {
            return { value, hour };
        })
        .filter(function (entry) {
            return entry.value > 0;
        });

    if (visibleHours.length === 0) {
        chart.innerHTML =
            '<div class="dashboard-chart-empty">No completed sales in this period.</div>';

        peakLabel.textContent = "Peak: —";
        return;
    }

    const maxValue = Math.max(
        ...visibleHours.map(function (entry) {
            return entry.value;
        })
    );

    const peak = visibleHours.reduce(
        function (best, current) {
            return current.value > best.value
                ? current
                : best;
        },
        visibleHours[0]
    );

    peakLabel.textContent =
        `Peak: ${String(peak.hour).padStart(2, "0")}:00`;

    chart.innerHTML = visibleHours
        .map(function (entry) {
            const height = Math.max(
                12,
                Math.round(
                    (entry.value / maxValue) * 100
                )
            );

            return `
                <div class="dashboard-chart-column">
                    <div class="dashboard-chart-value">
                        ${entry.value.toFixed(0)}
                    </div>

                    <div class="dashboard-chart-track">
                        <span style="height:${height}%"></span>
                    </div>

                    <small>
                        ${String(entry.hour).padStart(2, "0")}
                    </small>
                </div>
            `;
        })
        .join("");
}

function renderDashboardStatusBreakdown(filteredOrders) {
    const container =
        document.getElementById(
            "dashboardStatusBreakdown"
        );

    if (!container) {
        return;
    }

    const statuses = [
        "New",
        "Accepted",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled"
    ];

    const counts = {};

    statuses.forEach(function (status) {
        counts[status] = 0;
    });

    filteredOrders.forEach(function (order) {
        const status = order.status || "New";
        counts[status] = (counts[status] || 0) + 1;
    });

    container.innerHTML = statuses
        .map(function (status) {
            return `
                <div class="dashboard-status-row">
                    <span>
                        <i class="dashboard-status-dot status-${status.toLowerCase()}"></i>
                        ${status}
                    </span>
                    <strong>${counts[status] || 0}</strong>
                </div>
            `;
        })
        .join("");
}

function loadStats() {
    const filteredOrders =
        filterOrdersByPeriod(selectedAnalyticsPeriod);

    const completedOrders =
        filteredOrders.filter(function (order) {
            return order.status === "Completed";
        });

    const activeOrders =
        filteredOrders.filter(function (order) {
            return (
                order.status !== "Completed" &&
                order.status !== "Cancelled"
            );
        });

    const totalRevenue =
        completedOrders.reduce(function (total, order) {
            return total + getDashboardOrderTotal(order);
        }, 0);

    const averageOrder =
        completedOrders.length > 0
            ? totalRevenue / completedOrders.length
            : 0;

    const activeTables =
        calculateDashboardActiveTables();

    const currency =
        restaurantSettings.currency || "SAR";

    document.getElementById("totalOrders").textContent =
        filteredOrders.length;

    document.getElementById("totalRevenue").textContent =
        totalRevenue.toFixed(2);

    document.getElementById("completedOrders").textContent =
        completedOrders.length;

    document.getElementById("activeOrders").textContent =
        activeOrders.length;

    document.getElementById("averageOrder").textContent =
        averageOrder.toFixed(2);

    document.getElementById("bestSellingItem").textContent =
        calculateBestSellingItem(filteredOrders);

    document.getElementById("topCategory").textContent =
        calculateTopCategory(filteredOrders);

    document.getElementById("menuCount").textContent =
        menuItems.length;

    const activeTablesElement =
        document.getElementById(
            "dashboardActiveTables"
        );

    if (activeTablesElement) {
        activeTablesElement.textContent =
            String(activeTables);
    }

    [
        document.getElementById("dashboardCurrency"),
        document.getElementById("dashboardAverageCurrency")
    ].forEach(function (element) {
        if (element) {
            element.textContent = currency;
        }
    });

    const currentDate =
        document.getElementById(
            "dashboardCurrentDate"
        );

    if (currentDate) {
        currentDate.textContent =
            new Date().toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                    day: "numeric",
                    month: "short"
                }
            );
    }

    const mirrors = {
        dashboardActiveOrdersMirror:
            activeOrders.length,
        dashboardActiveTablesMirror:
            activeTables,
        dashboardMenuItemsMirror:
            menuItems.length
    };

    Object.entries(mirrors).forEach(
        function ([id, value]) {
            const element =
                document.getElementById(id);

            if (element) {
                element.textContent =
                    String(value);
            }
        }
    );

    renderDashboardHourlyChart(filteredOrders);
    renderDashboardStatusBreakdown(filteredOrders);
}

function initAnalyticsModule() {
    analyticsFilterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            analyticsFilterButtons.forEach(
                function (currentButton) {
                    currentButton.classList.remove("active");
                }
            );

            toggleCustomDateButton.classList.remove("active");
            customDatePanel.classList.remove("show");
            button.classList.add("active");

            selectedAnalyticsPeriod =
                button.dataset.period;

            loadStats();
        });
    });

    toggleCustomDateButton.addEventListener(
        "click",
        function () {
            customDatePanel.classList.toggle("show");

            toggleCustomDateButton.classList.toggle(
                "active",
                customDatePanel.classList.contains("show")
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

            customDatePanel.classList.remove("show");
            toggleCustomDateButton.classList.remove("active");

            analyticsFilterButtons.forEach(
                function (button) {
                    button.classList.toggle(
                        "active",
                        button.dataset.period === "today"
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

            selectedAnalyticsPeriod = "custom";

            analyticsFilterButtons.forEach(
                function (button) {
                    button.classList.remove("active");
                }
            );

            toggleCustomDateButton.classList.add("active");
            customDatePanel.classList.remove("show");

            loadStats();
        }
    );
}