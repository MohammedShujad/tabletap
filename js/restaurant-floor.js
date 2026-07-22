// =====================================
// TABLETAP - RESTAURANT FLOOR MODULE
// =====================================

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

    return `${minutes} min`;
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

function renderRestaurantFloor() {
    restaurantFloorGrid.innerHTML = "";

    updateFloorSummary();

    if (tables.length === 0) {
        restaurantFloorEmpty.hidden = false;
        return;
    }

    restaurantFloorEmpty.hidden = true;

    tables
        .slice()
        .sort(function (first, second) {
            return String(first.number).localeCompare(
                String(second.number),
                undefined,
                { numeric: true }
            );
        })
        .forEach(function (table) {
            const activeOrder = getActiveOrderForTable(table);
            const status = getTableStatus(table, activeOrder);
            const statusClass = getTableStatusClass(status);

            const card = document.createElement("article");

            card.className =
                `floor-table-card ${statusClass}`;

            const orderInfo = activeOrder
                ? `
                    <div class="floor-order-info">
                        <p>
                            <strong>Order:</strong>
                            ${activeOrder.id || "Unknown"}
                        </p>

                        <p>
                            <strong>Customer:</strong>
                            ${activeOrder.customer?.name || "Unknown"}
                        </p>

                        <p>
                            <strong>Waiting:</strong>
                            ${formatWaitingTime(activeOrder)}
                        </p>
                    </div>
                `
                : "";

            card.innerHTML = `
                <h3>🍽️ ${table.name}</h3>

                <div class="floor-table-meta">
                    <span>
                        <strong>Code:</strong>
                        ${table.number}
                    </span>

                    <span>
                        <strong>Seats:</strong>
                        ${table.capacity}
                    </span>

                    <span>
                        <strong>Area:</strong>
                        ${table.area}
                    </span>
                </div>

                <span class="floor-table-status ${statusClass}">
                    ${status}
                </span>

                ${orderInfo}

                <div class="floor-table-actions">
                    <button
                        type="button"
                        class="floor-edit-button"
                        onclick="editTable('${table.id}')"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="floor-toggle-button"
                        onclick="toggleTable('${table.id}')"
                    >
                        ${table.enabled ? "Disable" : "Enable"}
                    </button>

                    <button
                        type="button"
                        class="floor-delete-button"
                        onclick="deleteTable('${table.id}')"
                    >
                        Delete
                    </button>
                </div>
            `;

            restaurantFloorGrid.appendChild(card);
        });
}

function resetTableForm() {
    addTableForm.reset();
    tableEnabledInput.value = "true";
    addTableForm.hidden = true;
    toggleAddTableForm.textContent = "+ Add Table";
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
    openRestaurantFloorLink.addEventListener(
        "click",
        function () {
            restaurantFloorSection.open = true;
        }
    );

    toggleAddTableForm.addEventListener(
        "click",
        function () {
            const willOpen = addTableForm.hidden;

            addTableForm.hidden = !willOpen;

            toggleAddTableForm.textContent =
                willOpen
                    ? "Close Form"
                    : "+ Add Table";

            if (willOpen) {
                tableNameInput.focus();
            }
        }
    );

    cancelAddTable.addEventListener(
        "click",
        resetTableForm
    );

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
}