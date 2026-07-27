// =====================================
// TABLETAP - SHARED ORDER SYNC ENGINE
// =====================================

(function () {
    const ORDERS_KEY = "tableTapOrders";
    const LATEST_ORDER_KEY = "tableTapLatestOrder";
    const ORDER_EVENT = "tabletap:orders-updated";

    function getOrders() {
        try {
            const savedOrders = JSON.parse(
                localStorage.getItem(ORDERS_KEY)
            );

            return Array.isArray(savedOrders)
                ? savedOrders
                : [];
        } catch (error) {
            console.error(
                "Unable to read TableTap orders:",
                error
            );

            return [];
        }
    }

    function getOrderById(orderId) {
        return getOrders().find(function (order) {
            return (
                String(order.id) ===
                String(orderId)
            );
        }) || null;
    }

    function updateLatestOrder(orders) {
        try {
            const latestOrder = JSON.parse(
                localStorage.getItem(
                    LATEST_ORDER_KEY
                )
            );

            if (!latestOrder) {
                return;
            }

            const updatedLatest =
                orders.find(function (order) {
                    return (
                        String(order.id) ===
                        String(latestOrder.id)
                    );
                });

            if (updatedLatest) {
                localStorage.setItem(
                    LATEST_ORDER_KEY,
                    JSON.stringify(updatedLatest)
                );
            }
        } catch (error) {
            console.warn(
                "Unable to update latest order:",
                error
            );
        }
    }

    function dispatchOrderUpdate(detail) {
        window.dispatchEvent(
            new CustomEvent(
                ORDER_EVENT,
                {
                    detail: detail
                }
            )
        );
    }

    function saveOrders(
        orders,
        updateDetails = {}
    ) {
        const safeOrders =
            Array.isArray(orders)
                ? orders
                : [];

        localStorage.setItem(
            ORDERS_KEY,
            JSON.stringify(safeOrders)
        );

        updateLatestOrder(safeOrders);

        dispatchOrderUpdate({
            orders: safeOrders,
            source:
                updateDetails.source ||
                "unknown",
            orderId:
                updateDetails.orderId ||
                null,
            status:
                updateDetails.status ||
                null,
            updatedAt:
                new Date().toISOString()
        });

        return safeOrders;
    }

    function updateOrder(
        orderId,
        changes,
        source = "unknown"
    ) {
        const orders = getOrders();

        const order =
            orders.find(function (currentOrder) {
                return (
                    String(currentOrder.id) ===
                    String(orderId)
                );
            });

        if (!order) {
            console.warn(
                `Order ${orderId} was not found.`
            );

            return null;
        }

        Object.assign(
            order,
            changes,
            {
                updatedAt:
                    new Date().toISOString()
            }
        );

        saveOrders(
            orders,
            {
                source: source,
                orderId: orderId,
                status:
                    changes.status ||
                    order.status
            }
        );

        return order;
    }

    function updateOrderStatus(
        orderId,
        newStatus,
        source = "unknown"
    ) {
        const timestamp =
            new Date().toISOString();

       const statusChanges = {
    status: newStatus
};

if (newStatus === "Ready") {

    statusChanges.deliveryStatus =
        "Waiting";

    statusChanges.assignedWaiter =
        null;

    statusChanges.assignedAt =
        null;

    statusChanges.deliveredAt =
        null;
}

        if (newStatus === "Preparing") {
            statusChanges.preparingAt =
                timestamp;
        }

        if (newStatus === "Ready") {
            statusChanges.readyAt =
                timestamp;
        }

        if (newStatus === "Served") {
            statusChanges.servedAt =
                timestamp;
        }

        if (newStatus === "Completed") {
            statusChanges.completedAt =
                timestamp;
        }

        if (newStatus === "Cancelled") {
            statusChanges.cancelledAt =
                timestamp;
        }

        return updateOrder(
            orderId,
            statusChanges,
            source
        );
    }

    function subscribe(callback) {
        if (typeof callback !== "function") {
            return function () {};
        }

        function handleCustomUpdate(event) {
            callback(
                event.detail?.orders ||
                getOrders(),
                event.detail || {}
            );
        }

        function handleStorageUpdate(event) {
            if (event.key !== ORDERS_KEY) {
                return;
            }

            let nextOrders = [];

            try {
                nextOrders =
                    JSON.parse(
                        event.newValue
                    ) || [];
            } catch (error) {
                nextOrders = [];
            }

            callback(
                nextOrders,
                {
                    source: "storage",
                    updatedAt:
                        new Date().toISOString()
                }
            );
        }

        window.addEventListener(
            ORDER_EVENT,
            handleCustomUpdate
        );

        window.addEventListener(
            "storage",
            handleStorageUpdate
        );

        return function unsubscribe() {
            window.removeEventListener(
                ORDER_EVENT,
                handleCustomUpdate
            );

            window.removeEventListener(
                "storage",
                handleStorageUpdate
            );
        };
    }

    window.TableTapOrderSync = {
        getOrders: getOrders,
        getOrderById: getOrderById,
        saveOrders: saveOrders,
        updateOrder: updateOrder,
        updateOrderStatus:
            updateOrderStatus,
        subscribe: subscribe,
        storageKey: ORDERS_KEY,
        eventName: ORDER_EVENT
    };
})();