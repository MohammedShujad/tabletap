// =====================================
// TABLETAP - WAITER DELIVERY DASHBOARD
// =====================================

let waiterOrders = [];
let waiterSearchTerm = "";

function escapeWaiterHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getWaiterName() {
    const input =
        document.getElementById("waiterName");

    return input
        ? input.value.trim()
        : "";
}

function getOrderDate(order, fieldName) {
    const value = order[fieldName];

    if (!value) {
        return null;
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime())
        ? null
        : parsed;
}

function getMinutesBetween(startValue, endValue) {
    const start = startValue
        ? new Date(startValue)
        : null;

    const end = endValue
        ? new Date(endValue)
        : new Date();

    if (
        !start ||
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(
            (
                end.getTime() -
                start.getTime()
            ) / 60000
        )
    );
}

function getReadyMinutes(order) {
    return getMinutesBetween(
        order.readyAt,
        order.deliveredAt
    );
}

function getOrderItemCount(order) {
    return (order.items || []).reduce(
        function (total, item) {
            return (
                total +
                Number(item.quantity || 0)
            );
        },
        0
    );
}

function getDeliveryStatus(order) {
    if (
        order.deliveryStatus === "Delivered" ||
        order.deliveredAt
    ) {
        return "Delivered";
    }

    if (
        order.deliveryStatus === "Assigned" ||
        order.assignedWaiter
    ) {
        return "Assigned";
    }

    if (
        order.status === "Ready" ||
        order.deliveryStatus === "Waiting"
    ) {
        return "Waiting";
    }

    return "Unavailable";
}

function getVisibleWaiterOrders() {
    const search =
        waiterSearchTerm.toLowerCase();

    return waiterOrders.filter(
        function (order) {
            const deliveryStatus =
                getDeliveryStatus(order);

            if (
                deliveryStatus ===
                "Unavailable"
            ) {
                return false;
            }

            const customer =
                order.customer || {};

            const searchableText = [
                order.id,
                customer.name,
                customer.phone,
                customer.table,
                order.assignedWaiter
            ]
                .join(" ")
                .toLowerCase();

            return (
                !search ||
                searchableText.includes(search)
            );
        }
    );
}

 function buildWaiterOrderCard(order) {
    const status =
        getDeliveryStatus(order);

    const customer =
        order.customer || {};

    const itemCount =
        getOrderItemCount(order);

    const readyMinutes =
        getReadyMinutes(order);

    const card =
        document.createElement("article");

    card.className =
        `waiter-order-row waiter-order-row-${status.toLowerCase()}`;

    let actionHtml = "";

    if (status === "Waiting") {
        actionHtml = `
            <button
                class="waiter-accept-button"
                type="button"
                onclick="acceptDelivery(
                    '${escapeWaiterHtml(order.id)}'
                )"
            >
                Accept
            </button>
        `;
    }

    if (status === "Assigned") {
        actionHtml = `
            <button
                class="waiter-delivered-button"
                type="button"
                onclick="markDeliveryCompleted(
                    '${escapeWaiterHtml(order.id)}'
                )"
            >
                Delivered
            </button>
        `;
    }

    if (status === "Delivered") {
        actionHtml = `
            <span class="waiter-delivered-label">
                ✓ Delivered
            </span>
        `;
    }

    card.innerHTML = `
        <div class="waiter-row-main">

            <span class="waiter-row-status-dot"></span>

            <div class="waiter-row-order">
                <small>Order</small>

                <strong title="${escapeWaiterHtml(order.id)}">
                    ${escapeWaiterHtml(order.id)}
                </strong>
            </div>

            <div class="waiter-row-table">
                <small>Table</small>

                <strong>
                    ${escapeWaiterHtml(
                        customer.table || "—"
                    )}
                </strong>
            </div>

            <div class="waiter-row-customer">
                <small>Customer</small>

                <strong title="${escapeWaiterHtml(
                    customer.name || "Guest"
                )}">
                    ${escapeWaiterHtml(
                        customer.name || "Guest"
                    )}
                </strong>
            </div>

            <div class="waiter-row-items">
                <small>Items</small>

                <strong>
                    ${itemCount}
                </strong>
            </div>

            <div class="waiter-row-time">
                <small>Waiting</small>

                <strong>
                    ${readyMinutes} min
                </strong>
            </div>

            <div class="waiter-row-action">
                ${actionHtml}
            </div>

        </div>

        ${
            order.assignedWaiter
                ? `
                    <div class="waiter-row-assignment">
                        Assigned to
                        <strong>
                            ${escapeWaiterHtml(
                                order.assignedWaiter
                            )}
                        </strong>
                    </div>
                `
                : ""
        }
    `;

    return card;
}

function renderWaiterColumn(
    containerId,
    orders
) {
    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="waiter-column-empty">
                <span>✓</span>
                <strong>No orders</strong>
                <small>This queue is clear.</small>
            </div>
        `;

        return;
    }

    orders.forEach(function (order) {
        container.appendChild(
            buildWaiterOrderCard(order)
        );
    });
}

function getDeliveredTodayOrders() {
    const today =
        new Date().toDateString();

    return waiterOrders.filter(
        function (order) {
            if (!order.deliveredAt) {
                return false;
            }

            return (
                new Date(
                    order.deliveredAt
                ).toDateString() === today
            );
        }
    );
}

function calculateAverageDeliveryTime(
    deliveredOrders
) {
    if (deliveredOrders.length === 0) {
        return 0;
    }

    const totalMinutes =
        deliveredOrders.reduce(
            function (total, order) {
                return (
                    total +
                    getMinutesBetween(
                        order.readyAt,
                        order.deliveredAt
                    )
                );
            },
            0
        );

    return Math.round(
        totalMinutes /
        deliveredOrders.length
    );
}

function renderWaiterDashboard() {
    const visibleOrders =
        getVisibleWaiterOrders();

    const waiterName =
        getWaiterName();

    const waitingOrders =
        visibleOrders.filter(
            function (order) {
                return (
                    getDeliveryStatus(order) ===
                    "Waiting"
                );
            }
        );

    const assignedOrders =
        visibleOrders.filter(
            function (order) {
                return (
                    getDeliveryStatus(order) ===
                    "Assigned" &&
                    (
                        !waiterName ||
                        order.assignedWaiter ===
                        waiterName
                    )
                );
            }
        );

    const deliveredToday =
        getDeliveredTodayOrders();

    renderWaiterColumn(
        "waiterWaitingList",
        waitingOrders
    );

    renderWaiterColumn(
        "waiterAssignedList",
        assignedOrders
    );

    renderWaiterColumn(
        "waiterDeliveredList",
        deliveredToday
    );

    const summaryValues = {
        waiterWaitingCount:
            waitingOrders.length,

        waiterAssignedCount:
            assignedOrders.length,

        waiterDeliveredCount:
            deliveredToday.length,

        waiterAverageTime:
            `${calculateAverageDeliveryTime(
                deliveredToday
            )} min`,

        waiterWaitingColumnCount:
            waitingOrders.length,

        waiterAssignedColumnCount:
            assignedOrders.length,

        waiterDeliveredColumnCount:
            deliveredToday.length
    };

    Object.entries(
        summaryValues
    ).forEach(
        function ([id, value]) {
            const element =
                document.getElementById(id);

            if (element) {
                element.textContent =
                    String(value);
            }
        }
    );
}

function showWaiterToast(message) {
    const toast =
        document.getElementById(
            "waiterToast"
        );

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(
        showWaiterToast.timeout
    );

    showWaiterToast.timeout =
        window.setTimeout(
            function () {
                toast.classList.remove(
                    "show"
                );
            },
            2500
        );
}

function acceptDelivery(orderId) {
    const waiterName =
        getWaiterName();

    if (!waiterName) {
        alert(
            "Please enter your waiter name first."
        );

        document
            .getElementById(
                "waiterName"
            )
            .focus();

        return;
    }

    const updatedOrder =
        TableTapOrderSync.updateOrder(
            orderId,
            {
                deliveryStatus:
                    "Assigned",

                assignedWaiter:
                    waiterName,

                assignedAt:
                    new Date().toISOString()
            },
            "waiter"
        );

    if (!updatedOrder) {
        return;
    }

    waiterOrders =
        TableTapOrderSync.getOrders();

    renderWaiterDashboard();

    showWaiterToast(
        `Order ${updatedOrder.id} assigned to ${waiterName}`
    );
}

function markDeliveryCompleted(
    orderId
) {
    const order =
        TableTapOrderSync.getOrderById(
            orderId
        );

    if (!order) {
        return;
    }

    const waiterName =
        getWaiterName();

    if (
        waiterName &&
        order.assignedWaiter &&
        order.assignedWaiter !== waiterName
    ) {
        alert(
            `This order is assigned to ${order.assignedWaiter}.`
        );

        return;
    }

    const timestamp =
        new Date().toISOString();

    const updatedOrder =
        TableTapOrderSync.updateOrder(
            orderId,
            {
                status: "Completed",
                deliveryStatus:
                    "Delivered",
                deliveredAt:
                    timestamp,
                completedAt:
                    timestamp
            },
            "waiter"
        );

    if (!updatedOrder) {
        return;
    }

    waiterOrders =
        TableTapOrderSync.getOrders();

    renderWaiterDashboard();

    showWaiterToast(
        `Order ${updatedOrder.id} delivered successfully`
    );
}

function initWaiterDashboard() {
    if (!window.TableTapOrderSync) {
        console.error(
            "TableTapOrderSync is not available."
        );

        return;
    }

    waiterOrders =
        TableTapOrderSync.getOrders();

    const savedWaiterName =
        localStorage.getItem(
            "tableTapWaiterName"
        );

    const waiterNameInput =
        document.getElementById(
            "waiterName"
        );

    const searchInput =
        document.getElementById(
            "waiterSearch"
        );

    if (
        waiterNameInput &&
        savedWaiterName
    ) {
        waiterNameInput.value =
            savedWaiterName;
    }

    waiterNameInput?.addEventListener(
        "input",
        function (event) {
            localStorage.setItem(
                "tableTapWaiterName",
                event.target.value.trim()
            );

            renderWaiterDashboard();
        }
    );

    searchInput?.addEventListener(
        "input",
        function (event) {
            waiterSearchTerm =
                event.target.value.trim();

            renderWaiterDashboard();
        }
    );

    TableTapOrderSync.subscribe(
        function (orders) {
            waiterOrders = orders;
            renderWaiterDashboard();
        }
    );

    renderWaiterDashboard();
}

window.acceptDelivery =
    acceptDelivery;

window.markDeliveryCompleted =
    markDeliveryCompleted;

document.addEventListener(
    "DOMContentLoaded",
    initWaiterDashboard
);