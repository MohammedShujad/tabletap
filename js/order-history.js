// =====================================
// TABLETAP - ORDER HISTORY MODULE
// =====================================

let orderHistoryCurrentPage = 1;

function escapeOrderHistoryHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getHistoryStatusClass(status) {
    return `history-status-${String(
        status || "New"
    )
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
}

function getOrderHistoryElements() {
    return {
        search: document.getElementById("orderSearch"),
        dateFilter: document.getElementById("orderDateFilter"),
        statusFilter: document.getElementById("orderStatusFilter"),
        sort: document.getElementById("orderHistorySort"),
        pageSize: document.getElementById("orderHistoryPageSize"),
        totalCount: document.getElementById("orderHistoryTotalCount"),
        activeCount: document.getElementById("orderHistoryActiveCount"),
        completedCount: document.getElementById("orderHistoryCompletedCount"),
        cancelledCount: document.getElementById("orderHistoryCancelledCount"),
        range: document.getElementById("orderHistoryRange"),
        pagination: document.getElementById("orderHistoryPagination"),
        prev: document.getElementById("orderHistoryPrevPage"),
        next: document.getElementById("orderHistoryNextPage"),
        pageInfo: document.getElementById("orderHistoryPageInfo"),
        empty: document.getElementById("orderHistoryEmpty"),
        modal: document.getElementById("orderDetailsModal"),
        modalTitle: document.getElementById("orderDetailsTitle"),
        modalSubtitle: document.getElementById("orderDetailsSubtitle"),
        modalContent: document.getElementById("orderDetailsContent")
    };
}

function getOrderHistoryTotal(order) {
    const savedTotal = Number(order.total);

    if (Number.isFinite(savedTotal) && savedTotal > 0) {
        return savedTotal;
    }

    return (order.items || []).reduce(function (total, item) {
        return total +
            Number(item.price || 0) *
            Number(item.quantity || 0);
    }, 0);
}

function matchesOrderHistoryDate(order, selectedDate) {
    if (selectedDate === "all") {
        return true;
    }

    const orderDate = getOrderDate(order);

    if (!orderDate) {
        return false;
    }

    const now = new Date();

    const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    if (selectedDate === "today") {
        return (
            orderDate >= todayStart &&
            orderDate < tomorrowStart
        );
    }

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    if (selectedDate === "yesterday") {
        return (
            orderDate >= yesterdayStart &&
            orderDate < todayStart
        );
    }

    if (selectedDate === "week") {
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 6);

        return (
            orderDate >= weekStart &&
            orderDate < tomorrowStart
        );
    }

    return true;
}

function getFilteredOrderHistory() {
    const elements = getOrderHistoryElements();

    const searchText =
        (elements.search?.value || "")
            .trim()
            .toLowerCase();

    const selectedDate =
        elements.dateFilter?.value || "today";

    const selectedStatus =
        elements.statusFilter?.value || "all";

    const sortValue =
        elements.sort?.value || "newest";

    const filtered = orders.filter(function (order) {
        const searchableText = [
            order.id,
            order.customer?.name,
            order.customer?.phone,
            order.customer?.table
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            !searchText ||
            searchableText.includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            order.status === selectedStatus;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesOrderHistoryDate(order, selectedDate)
        );
    });

    return filtered.sort(function (first, second) {
        if (sortValue === "highest") {
            return (
                getOrderHistoryTotal(second) -
                getOrderHistoryTotal(first)
            );
        }

        if (sortValue === "lowest") {
            return (
                getOrderHistoryTotal(first) -
                getOrderHistoryTotal(second)
            );
        }

        const firstDate =
            getOrderDate(first)?.getTime() || 0;

        const secondDate =
            getOrderDate(second)?.getTime() || 0;

        return sortValue === "oldest"
            ? firstDate - secondDate
            : secondDate - firstDate;
    });
}

function updateOrderHistoryLabel() {
    const elements = getOrderHistoryElements();

    const labels = {
        today: "Showing today’s orders",
        yesterday: "Showing yesterday’s orders",
        week: "Showing the last 7 days",
        all: "Showing all orders"
    };

    activeHistoryFilter.textContent =
        labels[elements.dateFilter?.value || "today"] ||
        "Showing filtered orders";
}

function updateOrderHistorySummary(filteredOrders) {
    const elements = getOrderHistoryElements();

    const summary = filteredOrders.reduce(
        function (result, order) {
            const status =
                String(order.status || "New");

            if (status === "Completed") {
                result.completed += 1;
            } else if (status === "Cancelled") {
                result.cancelled += 1;
            } else {
                result.active += 1;
            }

            return result;
        },
        {
            active: 0,
            completed: 0,
            cancelled: 0
        }
    );

    if (elements.totalCount) {
        elements.totalCount.textContent =
            String(filteredOrders.length);
    }

    if (elements.activeCount) {
        elements.activeCount.textContent =
            String(summary.active);
    }

    if (elements.completedCount) {
        elements.completedCount.textContent =
            String(summary.completed);
    }

    if (elements.cancelledCount) {
        elements.cancelledCount.textContent =
            String(summary.cancelled);
    }
}

function buildOrderDetails(order) {
    const currency =
        typeof getCurrency === "function"
            ? getCurrency()
            : "SAR";

    const orderDate = getOrderDate(order);
    const total = getOrderHistoryTotal(order);

    const itemsHtml = (order.items || [])
        .map(function (item) {
            const quantity =
                Number(item.quantity || 0);

            const price =
                Number(item.price || 0);

            const lineTotal =
                price * quantity;

            return `
                <div class="order-details-item">
                    <div>
                        <strong>
                            ${escapeOrderHistoryHtml(item.name)}
                        </strong>
                        <small>
                            ${quantity} ×
                            ${escapeOrderHistoryHtml(currency)}
                            ${price.toFixed(2)}
                        </small>
                    </div>

                    <strong>
                        ${escapeOrderHistoryHtml(currency)}
                        ${lineTotal.toFixed(2)}
                    </strong>
                </div>
            `;
        })
        .join("");

    return `
        <section class="order-details-summary-grid">
            <div>
                <small>Customer</small>
                <strong>
                    ${escapeOrderHistoryHtml(
                        order.customer?.name || "Walk-in"
                    )}
                </strong>
            </div>

            <div>
                <small>Phone</small>
                <strong>
                    ${escapeOrderHistoryHtml(
                        order.customer?.phone || "Not provided"
                    )}
                </strong>
            </div>

            <div>
                <small>Table</small>
                <strong>
                    ${escapeOrderHistoryHtml(
                        order.customer?.table || "—"
                    )}
                </strong>
            </div>

            <div>
                <small>Date</small>
                <strong>
                    ${escapeOrderHistoryHtml(
                        orderDate
                            ? orderDate.toLocaleString()
                            : "Not available"
                    )}
                </strong>
            </div>

            <div>
                <small>Status</small>
                <strong>
                    ${escapeOrderHistoryHtml(
                        order.status || "New"
                    )}
                </strong>
            </div>

            <div>
                <small>Payment</small>
                <strong>
                    ${escapeOrderHistoryHtml(
                        order.paymentStatus || "Pending"
                    )}
                </strong>
            </div>
        </section>

        <section class="order-details-items">
            <h3>Ordered Items</h3>
            ${itemsHtml || "<p>No items available.</p>"}
        </section>

        ${
            order.notes
                ? `
                    <section class="order-details-notes">
                        <h3>Order Notes</h3>
                        <p>
                            ${escapeOrderHistoryHtml(order.notes)}
                        </p>
                    </section>
                `
                : ""
        }

        <div class="order-details-total">
            <span>Grand Total</span>
            <strong>
                ${escapeOrderHistoryHtml(currency)}
                ${total.toFixed(2)}
            </strong>
        </div>
    `;
}

function openOrderDetails(orderId) {
    const order = orders.find(function (item) {
        return String(item.id) === String(orderId);
    });

    if (!order) {
        alert("Order not found.");
        return;
    }

    const elements = getOrderHistoryElements();

    elements.modalTitle.textContent =
        order.id || "Order Details";

    elements.modalSubtitle.textContent =
        `Table ${order.customer?.table || "—"} · ${
            order.status || "New"
        }`;

    elements.modalContent.innerHTML =
        buildOrderDetails(order);

    elements.modal.classList.add("show");
    elements.modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";
}

function closeOrderDetails() {
    const modal =
        document.getElementById("orderDetailsModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function renderOrderHistory() {
    updateOrderHistoryLabel();

    const filteredOrders =
        getFilteredOrderHistory();

    const elements = getOrderHistoryElements();

    const pageSize =
        Number(elements.pageSize?.value || 25);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / pageSize)
    );

    orderHistoryCurrentPage = Math.min(
        orderHistoryCurrentPage,
        totalPages
    );

    const startIndex =
        (orderHistoryCurrentPage - 1) * pageSize;

    const pageOrders =
        filteredOrders.slice(
            startIndex,
            startIndex + pageSize
        );

    orderHistoryContainer.innerHTML = "";

    orderHistoryCount.textContent =
        `${filteredOrders.length} order${
            filteredOrders.length === 1 ? "" : "s"
        }`;

    updateOrderHistorySummary(filteredOrders);

    if (elements.range) {
        elements.range.textContent =
            filteredOrders.length === 0
                ? "Showing 0 records"
                : `Showing ${startIndex + 1}–${
                    Math.min(
                        startIndex + pageSize,
                        filteredOrders.length
                    )
                } of ${filteredOrders.length}`;
    }

    if (filteredOrders.length === 0) {
        elements.empty.hidden = false;
        elements.pagination.hidden = true;
        return;
    }

    elements.empty.hidden = true;

    pageOrders.forEach(function (order) {
        const orderDate = getOrderDate(order);
        const itemCount = (order.items || []).reduce(
            function (total, item) {
                return total +
                    Number(item.quantity || 0);
            },
            0
        );

        const total = getOrderHistoryTotal(order);

        const currency =
            typeof getCurrency === "function"
                ? getCurrency()
                : "SAR";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td data-label="Time">
                ${escapeOrderHistoryHtml(
                    orderDate
                        ? orderDate.toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )
                        : "—"
                )}
                <small>
                    ${escapeOrderHistoryHtml(
                        orderDate
                            ? orderDate.toLocaleDateString()
                            : ""
                    )}
                </small>
            </td>

            <td data-label="Order ID">
                <strong class="order-history-id">
                    ${escapeOrderHistoryHtml(
                        order.id || "Unknown"
                    )}
                </strong>
            </td>

            <td data-label="Table">
                ${escapeOrderHistoryHtml(
                    order.customer?.table || "—"
                )}
            </td>

            <td data-label="Customer">
                <strong>
                    ${escapeOrderHistoryHtml(
                        order.customer?.name || "Walk-in"
                    )}
                </strong>
                <small>
                    ${escapeOrderHistoryHtml(
                        order.customer?.phone || ""
                    )}
                </small>
            </td>

            <td data-label="Items">
                ${itemCount}
            </td>

            <td data-label="Status">
                <span class="history-status ${
                    getHistoryStatusClass(order.status)
                }">
                    ${escapeOrderHistoryHtml(
                        order.status || "New"
                    )}
                </span>
            </td>

            <td data-label="Total">
                <strong class="order-history-total">
                    ${escapeOrderHistoryHtml(currency)}
                    ${total.toFixed(2)}
                </strong>
            </td>

            <td data-label="Action">
                <button class="order-history-view-button"
                        type="button"
                        onclick="openOrderDetails('${
                            escapeOrderHistoryHtml(order.id)
                        }')">
                    View
                </button>
            </td>
        `;

        orderHistoryContainer.appendChild(row);
    });

    elements.pagination.hidden =
        totalPages <= 1;

    elements.pageInfo.textContent =
        `Page ${orderHistoryCurrentPage} of ${totalPages}`;

    elements.prev.disabled =
        orderHistoryCurrentPage === 1;

    elements.next.disabled =
        orderHistoryCurrentPage === totalPages;
}

function resetOrderHistoryPageAndRender() {
    orderHistoryCurrentPage = 1;
    renderOrderHistory();
}

function initOrderHistoryModule() {
    const elements = getOrderHistoryElements();

    elements.search?.addEventListener(
        "input",
        resetOrderHistoryPageAndRender
    );

    elements.dateFilter?.addEventListener(
        "change",
        resetOrderHistoryPageAndRender
    );

    elements.statusFilter?.addEventListener(
        "change",
        resetOrderHistoryPageAndRender
    );

    elements.sort?.addEventListener(
        "change",
        resetOrderHistoryPageAndRender
    );

    elements.pageSize?.addEventListener(
        "change",
        resetOrderHistoryPageAndRender
    );

    elements.prev?.addEventListener(
        "click",
        function () {
            if (orderHistoryCurrentPage > 1) {
                orderHistoryCurrentPage -= 1;
                renderOrderHistory();
            }
        }
    );

    elements.next?.addEventListener(
        "click",
        function () {
            orderHistoryCurrentPage += 1;
            renderOrderHistory();
        }
    );

    document
        .querySelectorAll("[data-order-details-close]")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                closeOrderDetails
            );
        });

    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Escape" &&
                elements.modal?.classList.contains("show")
            ) {
                closeOrderDetails();
            }
        }
    );

    renderOrderHistory();
}