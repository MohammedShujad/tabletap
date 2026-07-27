// =====================================
// TABLETAP - KITCHEN DISPLAY SYSTEM V2.1
// =====================================

const defaultKitchenSettings = {
    restaurantName: "TableTap",
    branchName: "Main Branch",
    currency: "SAR",
    logoUrl: ""
};

let kitchenSettings = {
    ...defaultKitchenSettings,
    ...(JSON.parse(localStorage.getItem("tableTapSettings")) || {})
};

let kitchenOrders =
    JSON.parse(localStorage.getItem("tableTapOrders")) || [];

let kitchenKnownOrderIds = new Set(
    kitchenOrders.map(function (order) {
        return String(order.id);
    })
);

function escapeKitchenHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getKitchenOrderDate(order) {
    const candidates = [
        order.createdAt,
        order.date,
        order.timestamp
    ];

    for (const candidate of candidates) {
        if (!candidate) continue;

        const parsed = new Date(candidate);

        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    return null;
}

function getKitchenCompletedDate(order) {
    const value =
        order.completedAt ||
        order.updatedAt ||
        null;

    if (!value) return null;

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime())
        ? null
        : parsed;
}

function getKitchenElapsedMinutes(order) {
    const orderDate = getKitchenOrderDate(order);

    if (!orderDate) return 0;

    return Math.max(
        0,
        Math.floor(
            (Date.now() - orderDate.getTime()) / 60000
        )
    );
}

function getKitchenPreparationMinutes(order) {
    const start = getKitchenOrderDate(order);
    const end = getKitchenCompletedDate(order);

    if (!start || !end) return 0;

    return Math.max(
        0,
        Math.round(
            (end.getTime() - start.getTime()) / 60000
        )
    );
}

function getKitchenTimerClass(minutes) {
    if (minutes >= 15) return "urgent";
    if (minutes >= 10) return "delayed";
    if (minutes >= 5) return "warning";
    return "fresh";
}

function getKitchenTimerLabel(timerClass) {
    const labels = {
        fresh: "Fresh",
        warning: "Watch",
        delayed: "Delayed",
        urgent: "Urgent"
    };

    return labels[timerClass] || "Fresh";
}

function getKitchenOrderType(order) {
    const rawType = String(
        order.orderType ||
        order.customer?.orderType ||
        order.type ||
        "Dine In"
    )
        .trim()
        .toLowerCase();

    if (rawType.includes("delivery")) return "delivery";

    if (
        rawType.includes("take") ||
        rawType.includes("pickup")
    ) {
        return "takeaway";
    }

    return "dine-in";
}

function getKitchenTypeLabel(type) {
    const labels = {
        "dine-in": "Dine In",
        takeaway: "Takeaway",
        delivery: "Delivery"
    };

    return labels[type] || "Dine In";
}

function getKitchenStatus(order) {
    const rawStatus = String(
        order.status || "New"
    )
        .trim()
        .toLowerCase();

    if (
        rawStatus === "pending" ||
        rawStatus === "placed" ||
        rawStatus === "waiting" ||
        rawStatus === "submitted" ||
        rawStatus === "new"
    ) {
        return "New";
    }

    if (
        rawStatus === "accepted" ||
        rawStatus === "preparing"
    ) {
        return "Preparing";
    }

    if (rawStatus === "ready") {
        return "Ready";
    }

    if (
        rawStatus === "completed" ||
        rawStatus === "served"
    ) {
        return "Completed";
    }

    if (rawStatus === "cancelled") {
        return "Cancelled";
    }

    return "New";
}

function getKitchenItemsHtml(order) {
    const items = order.items || [];

    if (items.length === 0) {
        return `
            <div class="kds-empty-items">
                No items found.
            </div>
        `;
    }

    return items
        .map(function (item) {
            const quantity = Number(item.quantity || 0);

            return `
                <div class="kds-order-item">
                    <strong>${quantity}×</strong>
                    <span>${escapeKitchenHtml(item.name)}</span>
                    ${
                        item.notes
                            ? `<small>${escapeKitchenHtml(item.notes)}</small>`
                            : ""
                    }
                </div>
            `;
        })
        .join("");
}

function getKitchenNextAction(status) {
    if (status === "New") {
        return {
            label: "Start",
            nextStatus: "Preparing",
            className: "start"
        };
    }

    if (status === "Preparing") {
        return {
            label: "Mark Ready",
            nextStatus: "Ready",
            className: "ready"
        };
    }

    if (status === "Ready") {
        return {
            label: "Complete",
            nextStatus: "Completed",
            className: "complete"
        };
    }

    return null;
}

function buildKitchenOrderCard(order) {
    const status = getKitchenStatus(order);
    const isCompleted = status === "Completed";

    const minutes = isCompleted
        ? getKitchenPreparationMinutes(order)
        : getKitchenElapsedMinutes(order);

    const timerClass = isCompleted
        ? "completed"
        : getKitchenTimerClass(minutes);

    const orderType = getKitchenOrderType(order);
    const nextAction = getKitchenNextAction(status);

    const article = document.createElement("article");

    article.className = `
        kds-order-card
        kds-order-card-${status.toLowerCase()}
        timer-${timerClass}
    `;

    article.dataset.orderId = String(order.id);

    article.innerHTML = `
        <div class="kds-order-card-header">
            <div class="kds-order-number">
                <small>Order</small>
                <h3>${escapeKitchenHtml(order.id)}</h3>
            </div>

            <div class="kds-order-timer ${timerClass}">
                <strong data-kitchen-timer>
                    ${minutes} min
                </strong>
                <small>
                    ${
                        isCompleted
                            ? "Prep time"
                            : getKitchenTimerLabel(timerClass)
                    }
                </small>
            </div>
        </div>

        <div class="kds-order-badges">
            <span class="kds-order-type type-${orderType}">
                ${getKitchenTypeLabel(orderType)}
            </span>

            <span class="kds-order-status">
                ${escapeKitchenHtml(status)}
            </span>
        </div>

        <div class="kds-order-meta">
            <div class="kds-table-meta">
                <small>Table</small>
                <strong>
                    ${escapeKitchenHtml(
                        order.customer?.table || "Counter"
                    )}
                </strong>
            </div>

            <div>
                <small>Customer</small>
                <strong>
                    ${escapeKitchenHtml(
                        order.customer?.name || "Guest"
                    )}
                </strong>
            </div>
        </div>

        <div class="kds-order-items">
            ${getKitchenItemsHtml(order)}
        </div>

        ${
            order.customer?.request
                ? `
                    <div class="kds-order-note">
                        <strong>Special request</strong>
                        <p>${escapeKitchenHtml(order.customer.request)}</p>
                    </div>
                `
                : ""
        }

        <div class="kds-order-footer">
            <small>
                ${
                    isCompleted
                        ? "Finished"
                        : "Placed"
                }:
                ${
                    (isCompleted
                        ? getKitchenCompletedDate(order)
                        : getKitchenOrderDate(order)
                    )?.toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    ) || "Unknown"
                }
            </small>

            ${
                nextAction
                    ? `
                        <button
                            type="button"
                            class="kds-action-button ${nextAction.className}"
                            onclick="changeKitchenStatus(
                                '${escapeKitchenHtml(order.id)}',
                                '${nextAction.nextStatus}'
                            )"
                        >
                            ${nextAction.label}
                        </button>
                    `
                    : `
                        <span class="kds-completed-label">
                            ✓ Completed
                        </span>
                    `
            }
        </div>
    `;

    return article;
}

function getFilteredKitchenOrders() {
    const search =
        document
            .getElementById("kitchenSearch")
            .value
            .trim()
            .toLowerCase();

    const typeFilter =
        document
            .getElementById("kitchenOrderTypeFilter")
            .value;

    const sortOrder =
        document
            .getElementById("kitchenSortOrder")
            .value;

    const filtered = kitchenOrders.filter(function (order) {
        const searchable = [
            order.id,
            order.customer?.name,
            order.customer?.table,
            order.customer?.phone
        ]
            .join(" ")
            .toLowerCase();

        return (
            (!search || searchable.includes(search)) &&
            (
                typeFilter === "all" ||
                getKitchenOrderType(order) === typeFilter
            )
        );
    });

    return filtered.sort(function (first, second) {
        const firstDate =
            getKitchenOrderDate(first)?.getTime() || 0;

        const secondDate =
            getKitchenOrderDate(second)?.getTime() || 0;

        if (sortOrder === "newest") {
            return secondDate - firstDate;
        }

        if (sortOrder === "urgent") {
            return (
                getKitchenElapsedMinutes(second) -
                getKitchenElapsedMinutes(first)
            );
        }

        return firstDate - secondDate;
    });
}

function renderKitchenColumn(containerId, orders) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="kds-column-empty">
                <span>✓</span>
                <strong>Kitchen is clear</strong>
                <small>No pending orders in this queue.</small>
            </div>
        `;
        return;
    }

    orders.forEach(function (order) {
        container.appendChild(
            buildKitchenOrderCard(order)
        );
    });
}

function getCompletedTodayOrders() {
    const now = new Date();

    return kitchenOrders.filter(function (order) {
        if (getKitchenStatus(order) !== "Completed") {
            return false;
        }

        const completedDate = getKitchenCompletedDate(order);

        return (
            completedDate &&
            completedDate.toDateString() === now.toDateString()
        );
    });
}

function calculateAverageKitchenTime(completedOrders) {
    const durations = completedOrders
        .map(getKitchenPreparationMinutes)
        .filter(function (value) {
            return Number.isFinite(value);
        });

    if (durations.length === 0) return 0;

    return Math.round(
        durations.reduce(function (sum, value) {
            return sum + value;
        }, 0) / durations.length
    );
}

function renderKitchenOrders() {
    const filtered = getFilteredKitchenOrders();

    const newOrders = filtered.filter(function (order) {
        return getKitchenStatus(order) === "New";
    });

    const preparingOrders = filtered.filter(function (order) {
        return getKitchenStatus(order) === "Preparing";
    });

    const readyOrders = filtered.filter(function (order) {
        return getKitchenStatus(order) === "Ready";
    });

    const completedOrders = filtered
        .filter(function (order) {
            return getKitchenStatus(order) === "Completed";
        })
        .sort(function (first, second) {
            return (
                (getKitchenCompletedDate(second)?.getTime() || 0) -
                (getKitchenCompletedDate(first)?.getTime() || 0)
            );
        })
        .slice(0, 8);

    renderKitchenColumn("kitchenNewOrders", newOrders);
    renderKitchenColumn("kitchenPreparingOrders", preparingOrders);
    renderKitchenColumn("kitchenReadyOrders", readyOrders);
    renderKitchenColumn("kitchenCompletedOrders", completedOrders);

    const completedToday = getCompletedTodayOrders();

    const summaryValues = {
        kitchenNewCount: newOrders.length,
        kitchenPreparingCount: preparingOrders.length,
        kitchenReadyCount: readyOrders.length,
        kitchenCompletedCount: completedToday.length,
        kitchenNewColumnCount: newOrders.length,
        kitchenPreparingColumnCount: preparingOrders.length,
        kitchenReadyColumnCount: readyOrders.length,
        kitchenCompletedColumnCount: completedOrders.length
    };

    Object.entries(summaryValues).forEach(
        function ([id, value]) {
            const element = document.getElementById(id);

            if (element) {
                element.textContent = String(value);
            }
        }
    );

    document
        .getElementById("kitchenAverageTime")
        .textContent =
        `${calculateAverageKitchenTime(completedToday)} min`;
}

function saveKitchenOrders() {
    localStorage.setItem(
        "tableTapOrders",
        JSON.stringify(kitchenOrders)
    );

    const latestOrder =
        JSON.parse(
            localStorage.getItem("tableTapLatestOrder")
        );

    if (latestOrder) {
        const updatedLatest =
            kitchenOrders.find(function (order) {
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

    renderKitchenOrders();
}

function showKitchenToast(message) {
    const toast =
        document.getElementById("kitchenToast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showKitchenToast.timeout);

    showKitchenToast.timeout = setTimeout(
        function () {
            toast.classList.remove("show");
        },
        2600
    );
}

function playKitchenNotification() {
    const soundEnabled =
        document
            .getElementById("kitchenSoundToggle")
            .checked;

    if (!soundEnabled) return;

    try {
        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        const audioContext =
            new AudioContextClass();

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.frequency.value = 880;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.12,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.45
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(
            audioContext.currentTime + 0.45
        );
    } catch (error) {
        console.warn("Kitchen sound unavailable:", error);
    }
}

function detectNewKitchenOrders(nextOrders) {
    const newlyAdded = nextOrders.filter(function (order) {
        return !kitchenKnownOrderIds.has(String(order.id));
    });

    if (newlyAdded.length > 0) {
        playKitchenNotification();

        showKitchenToast(
            `${newlyAdded.length} new order${
                newlyAdded.length === 1 ? "" : "s"
            } received`
        );
    }

    kitchenKnownOrderIds = new Set(
        nextOrders.map(function (order) {
            return String(order.id);
        })
    );
}

function changeKitchenStatus(orderId, newStatus) {
    if (!window.TableTapOrderSync) {
        console.error(
            "TableTapOrderSync is not available."
        );

        return;
    }

    const updatedOrder =
        TableTapOrderSync.updateOrderStatus(
            orderId,
            newStatus,
            "kitchen"
        );

    if (!updatedOrder) {
        return;
    }

    kitchenOrders =
        TableTapOrderSync.getOrders();

    renderKitchenOrders();

    showKitchenToast(
        `Order ${updatedOrder.id} marked ${newStatus}`
    );
}

function applyKitchenSettings() {
    const name =
        document.getElementById("kitchenRestaurantName");

    const logo =
        document.getElementById("kitchenLogo");

    if (name) {
        name.textContent =
            kitchenSettings.restaurantName || "TableTap";
    }

    if (logo) {
        if (kitchenSettings.logoUrl) {
            logo.innerHTML = `
                <img
                    src="${escapeKitchenHtml(kitchenSettings.logoUrl)}"
                    alt="${escapeKitchenHtml(
                        kitchenSettings.restaurantName
                    )}"
                >
            `;
        } else {
            logo.textContent = "TT";
        }
    }

    document.title =
        `${kitchenSettings.restaurantName || "TableTap"} Kitchen`;
}

function updateKitchenClock() {
    const now = new Date();

    document
        .getElementById("kitchenCurrentTime")
        .textContent =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    document
        .getElementById("kitchenCurrentDate")
        .textContent =
        now.toLocaleDateString(
            undefined,
            {
                weekday: "short",
                day: "numeric",
                month: "short"
            }
        );
}

function updateKitchenTimers() {
    let requiresFullRender = false;

    document
        .querySelectorAll(".kds-order-card")
        .forEach(function (card) {
            const order = kitchenOrders.find(
                function (currentOrder) {
                    return String(currentOrder.id) ===
                        String(card.dataset.orderId);
                }
            );

            if (!order) return;

            const status = getKitchenStatus(order);

            if (status === "Completed") return;

            const minutes =
                getKitchenElapsedMinutes(order);

            const nextClass =
                getKitchenTimerClass(minutes);

            const currentClass = [
                "fresh",
                "warning",
                "delayed",
                "urgent"
            ].find(function (className) {
                return card.classList.contains(
                    `timer-${className}`
                );
            });

            if (currentClass !== nextClass) {
                requiresFullRender = true;
                return;
            }

            const timer =
                card.querySelector("[data-kitchen-timer]");

            if (timer) {
                timer.textContent = `${minutes} min`;
            }
        });

    if (requiresFullRender) {
        renderKitchenOrders();
    }
}

function toggleKitchenFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement
            .requestFullscreen()
            .catch(function () {});
    } else {
        document.exitFullscreen();
    }
}

function initKitchenDisplay() {
    applyKitchenSettings();
    updateKitchenClock();
    renderKitchenOrders();

    document
        .getElementById("kitchenSearch")
        .addEventListener("input", renderKitchenOrders);

    document
        .getElementById("kitchenOrderTypeFilter")
        .addEventListener("change", renderKitchenOrders);

    document
        .getElementById("kitchenSortOrder")
        .addEventListener("change", renderKitchenOrders);

    document
        .getElementById("kitchenFullscreenButton")
        .addEventListener("click", toggleKitchenFullscreen);

    window.addEventListener(
        "storage",
        function (event) {
            if (event.key === "tableTapOrders") {
                const nextOrders =
                    JSON.parse(event.newValue) || [];

                detectNewKitchenOrders(nextOrders);
                kitchenOrders = nextOrders;
                renderKitchenOrders();
            }

            if (event.key === "tableTapSettings") {
                kitchenSettings = {
                    ...defaultKitchenSettings,
                    ...(JSON.parse(event.newValue) || {})
                };

                applyKitchenSettings();
            }
        }
    );

    setInterval(
        function () {
            updateKitchenClock();
            updateKitchenTimers();
        },
        30000
    );
}

window.changeKitchenStatus =
    changeKitchenStatus;

initKitchenDisplay();