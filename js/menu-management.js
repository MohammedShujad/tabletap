// =====================================
// TABLETAP - MENU MANAGEMENT MODULE
// =====================================

function getCategories() {
    const categoryMap = new Map();

    menuItems.forEach(function (item) {
        const category =
            cleanCategory(item.category);

        const key =
            categoryKey(category);

        if (
            category &&
            !categoryMap.has(key)
        ) {
            categoryMap.set(
                key,
                category
            );
        }
    });

    return Array.from(
        categoryMap.values()
    );
}

function loadCategoryOptions() {
    foodCategory.innerHTML =
        '<option value="">Select Category</option>';

    getCategories().forEach(
        function (category) {
            const option =
                document.createElement(
                    "option"
                );

            option.value = category;
            option.textContent = category;

            foodCategory.appendChild(
                option
            );
        }
    );
}

function renderMenuTable() {
    const tableBody =
        document.getElementById(
            "menuTableBody"
        );

    tableBody.innerHTML = "";

    menuItems.forEach(function (item) {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${
                    item.image
                        ? `<img
                            src="${item.image}"
                            alt="${item.name}"
                            style="
                                width:60px;
                                height:45px;
                                object-fit:cover;
                                border-radius:8px;
                                margin-right:10px;
                                vertical-align:middle;
                            "
                        >`
                        : ""
                }

                ${item.name}
            </td>

            <td>
                ${item.category}
            </td>

            <td>
                SAR ${Number(item.price)}
            </td>

            <td>
                ${
                    item.available
                        ? '<strong style="color:#238636;">Available</strong>'
                        : '<strong style="color:#c0392b;">Out of Stock</strong>'
                }
            </td>

            <td>
                <button
                    class="action-button edit-button"
                    onclick="editItem('${item.id}')"
                >
                    Edit
                </button>

                <button
                    class="action-button"
                    style="
                        background:${
                            item.available
                                ? "#f0a500"
                                : "#2e9d56"
                        };
                        color:white;
                    "
                    onclick="toggleAvailability('${item.id}')"
                >
                    ${
                        item.available
                            ? "Disable"
                            : "Enable"
                    }
                </button>

                <button
                    class="action-button delete-button"
                    onclick="deleteItem('${item.id}')"
                >
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function saveMenu() {
    localStorage.setItem(
        "tableTapMenu",
        JSON.stringify(menuItems)
    );

    loadCategoryOptions();
    loadStats();
    renderMenuTable();
    renderOrderHistory();
}

function editItem(itemId) {
    const item =
        menuItems.find(
            function (menuItem) {
                return (
                    String(menuItem.id) ===
                    String(itemId)
                );
            }
        );

    if (!item) {
        return;
    }

    const newName =
        prompt(
            "Enter item name:",
            item.name
        );

    const newPrice =
        prompt(
            "Enter item price:",
            item.price
        );

    const newImage =
        prompt(
            "Enter image URL:",
            item.image || ""
        );

    if (!newName || !newPrice) {
        return;
    }

    const parsedPrice =
        Number(newPrice);

    if (
        Number.isNaN(parsedPrice) ||
        parsedPrice <= 0
    ) {
        alert(
            "Please enter a valid price."
        );

        return;
    }

    item.name = newName.trim();
    item.price = parsedPrice;
    item.image =
        newImage
            ? newImage.trim()
            : "";

    saveMenu();
}

function toggleAvailability(itemId) {
    const item =
        menuItems.find(
            function (menuItem) {
                return (
                    String(menuItem.id) ===
                    String(itemId)
                );
            }
        );

    if (!item) {
        return;
    }

    item.available =
        !item.available;

    saveMenu();
}

function deleteItem(itemId) {
    const confirmed =
        confirm(
            "Are you sure you want to delete this item?"
        );

    if (!confirmed) {
        return;
    }

    menuItems =
        menuItems.filter(
            function (item) {
                return (
                    String(item.id) !==
                    String(itemId)
                );
            }
        );

    saveMenu();
}

function initMenuManagementModule() {
    addMenuItemBtn.addEventListener(
        "click",
        function () {
            const isHidden =
                addItemForm.style.display ===
                "none";

            addItemForm.style.display =
                isHidden
                    ? "block"
                    : "none";

            addMenuItemBtn.textContent =
                isHidden
                    ? "Close Form"
                    : "+ Add New Menu Item";
        }
    );

    saveNewItem.addEventListener(
        "click",
        function () {
            const name =
                document
                    .getElementById(
                        "foodName"
                    )
                    .value
                    .trim();

            const selectedCategory =
                cleanCategory(
                    foodCategory.value
                );

            const typedCategory =
                cleanCategory(
                    newCategory.value
                );

            const price =
                Number(
                    document
                        .getElementById(
                            "foodPrice"
                        )
                        .value
                );

            const image =
                document
                    .getElementById(
                        "foodImage"
                    )
                    .value
                    .trim();

            if (
                !name ||
                Number.isNaN(price) ||
                price <= 0
            ) {
                alert(
                    "Please enter a valid food name and price."
                );

                return;
            }

            if (
                !selectedCategory &&
                !typedCategory
            ) {
                alert(
                    "Please select or create a category."
                );

                return;
            }

            const existingCategory =
                getCategories().find(
                    function (category) {
                        return (
                            categoryKey(category) ===
                            categoryKey(
                                typedCategory
                            )
                        );
                    }
                );

            const finalCategory =
                typedCategory
                    ? existingCategory ||
                      typedCategory
                    : selectedCategory;

            menuItems.push({
                id: Date.now(),
                name: name,
                category:
                    finalCategory,
                price: price,
                image: image,
                available: true
            });

            document
                .getElementById(
                    "foodName"
                )
                .value = "";

            document
                .getElementById(
                    "foodPrice"
                )
                .value = "";

            document
                .getElementById(
                    "foodImage"
                )
                .value = "";

            foodCategory.value = "";
            newCategory.value = "";

            addItemForm.style.display =
                "none";

            addMenuItemBtn.textContent =
                "+ Add New Menu Item";

            saveMenu();

            alert(
                "Menu item added successfully."
            );
        }
    );

    openMenuManagementLink.addEventListener(
        "click",
        function () {
            menuManagementSection.open =
                true;
        }
    );
}