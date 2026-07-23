// =====================================
// TABLETAP - RESTAURANT FLOOR MODULE
// =====================================

let floorAreaFilter = "all";
let floorSearchTerm = "";
let floorViewMode = "comfortable";

function saveTables() {
    localStorage.setItem(
        "tableTapTables",
        JSON.stringify(tables)
    );

    renderRestaurantFloor();
}

function getActiveOrderForTable(table) {
    const matchingOrders = orders.filter(function (order) {
        return (
            order.status !== "Completed" &&
            normalizeTableValue(order.customer?.table) ===
            normalizeTableValue(table.number)
        );
    });

    return matchingOrders.length > 0
        ? matchingOrders[matchingOrders.length - 1]
        : null;
}

function getTableStatus(table, activeOrder) {
    if (!table.enabled) {
        return "Disabled";
    }

    if (!activeOrder) {
        return "Available";
    }

    return activeOrder.status || "New";
}

function getTableStatusClass(status) {
    return `status-${String(status || "Available")
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
}

function formatWaitingTime(order) {
    const orderDate = getOrderDate(order);

    if (!orderDate) {
        return "Time unavailable";
    }

    const minutes = Math.max(
        0,
        Math.floor((Date.now() - orderDate.getTime()) / 60000)
    );

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
}

function escapeFloorHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getFloorCurrency() {
    const settings = JSON.parse(
        localStorage.getItem("tableTapSettings") || "{}"
    );

    return settings.currency || "SAR";
}

function getOrderRunningTotal(order) {
    const directTotal = Number(
        order.total ??
        order.grandTotal ??
        order.totalAmount
    );

    if (Number.isFinite(directTotal)) {
        return directTotal;
    }

    const items = Array.isArray(order.items)
        ? order.items
        : [];

    return items.reduce(function (sum, item) {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;

        return sum + (price * quantity);
    }, 0);
}

function getFloorElements() {
    return {
        search: document.getElementById("floorTableSearch"),
        filters: document.getElementById("floorAreaFilters"),
        comfortableView: document.getElementById("floorComfortableView"),
        compactView: document.getElementById("floorCompactView"),
        visibleCount: document.getElementById("floorVisibleCount"),
        activeFilterText: document.getElementById("floorActiveFilterText"),
        allCount: document.getElementById("floorAllCount")
    };
}

function updateFloorSummary() {
    let available = 0;
    let active = 0;
    let ready = 0;
    let disabled = 0;

    tables.forEach(function (table) {
        const activeOrder = getActiveOrderForTable(table);
        const status = getTableStatus(table, activeOrder);

        if (status === "Disabled") {
            disabled += 1;
        } else if (status === "Available") {
            available += 1;
        } else if (status === "Ready") {
            ready += 1;
        } else {
            active += 1;
        }
    });

    availableTableCount.textContent = available;
    activeTableCount.textContent = active;
    readyTableCount.textContent = ready;
    disabledTableCount.textContent = disabled;
}

function getFloorAreas() {
    return Array.from(
        new Set(
            tables
                .map(function (table) {
                    return String(table.area || "Unassigned").trim();
                })
                .filter(Boolean)
        )
    ).sort(function (first, second) {
        return first.localeCompare(second);
    });
}

function renderFloorAreaFilters() {
    const elements = getFloorElements();

    if (!elements.filters) {
        return;
    }

    const areaCounts = tables.reduce(function (counts, table) {
        const area = String(table.area || "Unassigned").trim();

        counts[area] = (counts[area] || 0) + 1;
        return counts;
    }, {});

    const filterButtons = [
        `
            <button
                class="floor-filter-button ${floorAreaFilter === "all" ? "active" : ""}"
                type="button"
                data-floor-area="all"
            >
                All
                <span>${tables.length}</span>
            </button>
        `
    ];

    getFloorAreas().forEach(function (area) {
        filterButtons.push(`
            <button
                class="floor-filter-button ${floorAreaFilter === area ? "active" : ""}"
                type="button"
                data-floor-area="${escapeFloorHtml(area)}"
            >
                ${escapeFloorHtml(area)}
                <span>${areaCounts[area] || 0}</span>
            </button>
        `);
    });

    elements.filters.innerHTML = filterButtons.join("");
}

function getVisibleFloorTables() {
    const normalizedSearch = normalizeTableValue(floorSearchTerm);

    return tables
        .filter(function (table) {
            const tableArea = String(table.area || "Unassigned").trim();

            const matchesArea =
                floorAreaFilter === "all" ||
                tableArea === floorAreaFilter;

            const matchesSearch =
                !normalizedSearch ||
                normalizeTableValue(table.name).includes(normalizedSearch) ||
                normalizeTableValue(table.number).includes(normalizedSearch) ||
                normalizeTableValue(tableArea).includes(normalizedSearch);

            return matchesArea && matchesSearch;
        })
        .sort(function (first, second) {
            const areaComparison = String(first.area || "")
                .localeCompare(String(second.area || ""));

            if (areaComparison !== 0) {
                return areaComparison;
            }

            return String(first.number).localeCompare(
                String(second.number),
                undefined,
                { numeric: true }
            );
        });
}

function createFloorTableCard(table) {
    const activeOrder = getActiveOrderForTable(table);
    const status = getTableStatus(table, activeOrder);
    const statusClass = getTableStatusClass(status);
    const currency = getFloorCurrency();
    const runningTotal = activeOrder
        ? getOrderRunningTotal(activeOrder)
        : 0;

    const card = document.createElement("article");

    card.className =
        `floor-table-card ${statusClass}`;

    card.dataset.tableId = String(table.id);

    const orderInfo = activeOrder
        ? `
            <div class="floor-order-info floor-live-order">
                <div class="floor-live-order-row">
                    <span>Order</span>
                    <strong>${escapeFloorHtml(activeOrder.id || "Unknown")}</strong>
                </div>

                <div class="floor-live-order-row">
                    <span>Guest</span>
                    <strong>${escapeFloorHtml(activeOrder.customer?.name || "Walk-in")}</strong>
                </div>

                <div class="floor-live-order-row">
                    <span>Elapsed</span>
                    <strong>${escapeFloorHtml(formatWaitingTime(activeOrder))}</strong>
                </div>

                <div class="floor-live-order-row floor-running-total">
                    <span>Running bill</span>
                    <strong>${escapeFloorHtml(currency)} ${runningTotal.toFixed(2)}</strong>
                </div>
            </div>
        `
        : `
            <div class="floor-available-message">
                <span>✓</span>
                Ready for the next guest
            </div>
        `;

    const operationalActions = activeOrder
        ? `
            <button
                type="button"
                class="floor-order-button"
                onclick="openFloorWorkspace('orders')"
            >
                View Order
            </button>

            <button
                type="button"
                class="floor-billing-button"
                onclick="openFloorWorkspace('billing')"
            >
                Open Billing
            </button>
        `
        : "";

    card.innerHTML = `
        <div class="floor-card-header">
            <div class="floor-table-identity">
                <span class="floor-table-symbol">▦</span>

                <div>
                    <h3>${escapeFloorHtml(table.name)}</h3>
                    <small>Table ${escapeFloorHtml(table.number)}</small>
                </div>
            </div>

            <span class="floor-table-status ${statusClass}">
                ${escapeFloorHtml(status)}
            </span>
        </div>

    <div class="floor-table-meta floor-table-meta-premium">
    <span>
        <small>Seats</small>
        <strong>${escapeFloorHtml(table.capacity)}</strong>
    </span>

    <span>
        <small>Table Code</small>
        <strong>${escapeFloorHtml(table.number)}</strong>
    </span>
    </div>

        ${orderInfo}

        <div class="floor-operational-actions">
            ${operationalActions}
        </div>

        <div class="floor-table-actions floor-management-actions">
            <button
                type="button"
                class="floor-edit-button"
                onclick="editTable('${escapeFloorHtml(table.id)}')"
            >
                Edit
            </button>

            <button
                type="button"
                class="floor-toggle-button"
                onclick="toggleTable('${escapeFloorHtml(table.id)}')"
            >
                ${table.enabled ? "Disable" : "Enable"}
            </button>

            <button
                type="button"
                class="floor-delete-button"
                onclick="deleteTable('${escapeFloorHtml(table.id)}')"
            >
                Delete
            </button>
        </div>
    `;

    return card;
}

function openFloorWorkspace(view) {
    const navigationControl = document.querySelector(
        `[data-admin-view="${view}"]`
    );

    if (navigationControl) {
        navigationControl.click();
    }
}

function renderRestaurantFloor() {
    restaurantFloorGrid.innerHTML = "";

    updateFloorSummary();
    renderFloorAreaFilters();

    const elements = getFloorElements();
    const visibleTables = getVisibleFloorTables();

    restaurantFloorGrid.classList.toggle(
        "compact-view",
        floorViewMode === "compact"
    );

    if (elements.comfortableView) {
        elements.comfortableView.classList.toggle(
            "active",
            floorViewMode === "comfortable"
        );
    }

    if (elements.compactView) {
        elements.compactView.classList.toggle(
            "active",
            floorViewMode === "compact"
        );
    }

    if (elements.visibleCount) {
        elements.visibleCount.textContent =
            `${visibleTables.length} ${visibleTables.length === 1 ? "table" : "tables"}`;
    }

    if (elements.activeFilterText) {
        const areaText =
            floorAreaFilter === "all"
                ? "all areas"
                : floorAreaFilter;

        elements.activeFilterText.textContent =
            floorSearchTerm
                ? `Searching “${floorSearchTerm}” in ${areaText}`
                : `Showing ${areaText}`;
    }

    if (tables.length === 0) {
        restaurantFloorEmpty.hidden = false;
        restaurantFloorEmpty.querySelector("h3").textContent =
            "No tables created yet";
        restaurantFloorEmpty.querySelector("p").textContent =
            "Add your first table to start building the live restaurant floor.";
        return;
    }

    if (visibleTables.length === 0) {
        restaurantFloorEmpty.hidden = false;
        restaurantFloorEmpty.querySelector("h3").textContent =
            "No matching tables";
        restaurantFloorEmpty.querySelector("p").textContent =
            "Try another search term or select a different restaurant area.";
        return;
    }

    restaurantFloorEmpty.hidden = true;

    const groupedTables = visibleTables.reduce(function (groups, table) {
        const area = String(table.area || "Unassigned").trim();

        if (!groups[area]) {
            groups[area] = [];
        }

        groups[area].push(table);
        return groups;
    }, {});

    Object.keys(groupedTables)
        .sort(function (first, second) {
            return first.localeCompare(second);
        })
        .forEach(function (area) {
            const areaSection = document.createElement("section");
            const areaTables = groupedTables[area];
            const activeAreaTables = areaTables.filter(function (table) {
                const status = getTableStatus(
                    table,
                    getActiveOrderForTable(table)
                );

                return !["Available", "Disabled"].includes(status);
            }).length;

            areaSection.className = "floor-area-group";
            areaSection.innerHTML = `
                <div class="floor-area-heading">
                    <div>
                        <span class="floor-area-icon">⌂</span>
                        <div>
                            <h3>${escapeFloorHtml(area)}</h3>
                            <p>
                                ${areaTables.length} ${areaTables.length === 1 ? "table" : "tables"}
                                · ${activeAreaTables} active
                            </p>
                        </div>
                    </div>
                </div>

                <div class="floor-area-table-grid"></div>
            `;

            const areaGrid =
                areaSection.querySelector(".floor-area-table-grid");

            areaTables.forEach(function (table) {
                areaGrid.appendChild(createFloorTableCard(table));
            });

            restaurantFloorGrid.appendChild(areaSection);
        });
}

function resetTableForm() {
    addTableForm.reset();
    tableEnabledInput.value = "true";
    addTableForm.hidden = true;
    toggleAddTableForm.innerHTML =
        "<span>＋</span> Add Table";
}

function editTable(tableId) {
    const table = tables.find(function (item) {
        return String(item.id) === String(tableId);
    });

    if (!table) {
        return;
    }

    const newName =
        prompt("Enter table name:", table.name);

    const newNumber =
        prompt("Enter table number/code:", table.number);

    const newCapacity =
        prompt("Enter seating capacity:", table.capacity);

    const newArea =
        prompt("Enter table area:", table.area);

    if (
        newName === null ||
        newNumber === null ||
        newCapacity === null ||
        newArea === null
    ) {
        return;
    }

    const duplicate = tables.some(function (item) {
        return (
            String(item.id) !== String(tableId) &&
            normalizeTableValue(item.number) ===
            normalizeTableValue(newNumber)
        );
    });

    if (duplicate) {
        alert(
            "Another table already uses this table number/code."
        );
        return;
    }

    const capacity = Number(newCapacity);

    if (
        !newName.trim() ||
        !newNumber.trim() ||
        !newArea.trim() ||
        !Number.isInteger(capacity) ||
        capacity < 1
    ) {
        alert("Please enter valid table information.");
        return;
    }

    table.name = newName.trim();
    table.number = newNumber.trim();
    table.capacity = capacity;
    table.area = newArea.trim();

    saveTables();
}

function toggleTable(tableId) {
    const table = tables.find(function (item) {
        return String(item.id) === String(tableId);
    });

    if (!table) {
        return;
    }

    table.enabled = !table.enabled;

    saveTables();
}

function deleteTable(tableId) {
    const table = tables.find(function (item) {
        return String(item.id) === String(tableId);
    });

    if (!table) {
        return;
    }

    const activeOrder =
        getActiveOrderForTable(table);

    if (activeOrder) {
        alert(
            "This table has an active order. Complete the order before deleting the table."
        );
        return;
    }

    const confirmed =
        confirm(`Delete ${table.name}?`);

    if (!confirmed) {
        return;
    }

    tables = tables.filter(function (item) {
        return String(item.id) !== String(tableId);
    });

    saveTables();
}

function initRestaurantFloorModule() {
    const elements = getFloorElements();

    if (openRestaurantFloorLink) {
        openRestaurantFloorLink.addEventListener(
            "click",
            function () {
                restaurantFloorSection.open = true;
            }
        );
    }

    toggleAddTableForm.addEventListener(
        "click",
        function () {
            const willOpen = addTableForm.hidden;

            addTableForm.hidden = !willOpen;

            toggleAddTableForm.innerHTML =
                willOpen
                    ? "<span>×</span> Close Form"
                    : "<span>＋</span> Add Table";

            if (willOpen) {
                tableNameInput.focus();
            }
        }
    );

    cancelAddTable.addEventListener(
        "click",
        resetTableForm
    );

    if (elements.search) {
        elements.search.addEventListener(
            "input",
            function (event) {
                floorSearchTerm = event.target.value.trim();
                renderRestaurantFloor();
            }
        );
    }

    if (elements.filters) {
        elements.filters.addEventListener(
            "click",
            function (event) {
                const button =
                    event.target.closest("[data-floor-area]");

                if (!button) {
                    return;
                }

                floorAreaFilter =
                    button.dataset.floorArea || "all";

                renderRestaurantFloor();
            }
        );
    }

    document
        .querySelectorAll("[data-floor-view]")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    floorViewMode =
                        button.dataset.floorView || "comfortable";

                    localStorage.setItem(
                        "tableTapFloorView",
                        floorViewMode
                    );

                    renderRestaurantFloor();
                }
            );
        });

    floorViewMode =
        localStorage.getItem("tableTapFloorView") ||
        "comfortable";

    addTableForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const name =
                tableNameInput.value.trim();

            const number =
                tableNumberInput.value.trim();

            const capacity =
                Number(tableCapacityInput.value);

            const area =
                tableAreaInput.value;

            const enabled =
                tableEnabledInput.value === "true";

            if (
                !name ||
                !number ||
                !area ||
                !Number.isInteger(capacity) ||
                capacity < 1
            ) {
                alert(
                    "Please complete all table fields correctly."
                );
                return;
            }

            const duplicate =
                tables.some(function (table) {
                    return (
                        normalizeTableValue(table.number) ===
                        normalizeTableValue(number)
                    );
                });

            if (duplicate) {
                alert(
                    "This table number/code already exists."
                );
                return;
            }

            tables.push({
                id: Date.now(),
                name: name,
                number: number,
                capacity: capacity,
                area: area,
                enabled: enabled,
                createdAt: new Date().toISOString()
            });

            saveTables();
            resetTableForm();
        }
    );

    renderRestaurantFloor();
}