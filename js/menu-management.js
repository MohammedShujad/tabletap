// =====================================
// TABLETAP - MENU MANAGEMENT MODULE
// =====================================

let menuManagementCurrentPage = 1;
let menuManagementActiveCategory = "all";

function escapeMenuManagementHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getCategories() {
    const categories = new Map();

    menuItems.forEach(function (item) {
        const category = cleanCategory(item.category);
        const key = categoryKey(category);

        if (category && !categories.has(key)) {
            categories.set(key, category);
        }
    });

    return Array.from(categories.values()).sort(
        function (a, b) {
            return a.localeCompare(b);
        }
    );
}

function getMenuElements() {
    return {
        search: document.getElementById("menuManagementSearch"),
        categoryFilter: document.getElementById("menuManagementCategoryFilter"),
        statusFilter: document.getElementById("menuManagementStatusFilter"),
        sort: document.getElementById("menuManagementSort"),
        pageSize: document.getElementById("menuManagementPageSize"),
        chips: document.getElementById("menuCategoryChips"),
        range: document.getElementById("menuManagementRange"),
        activeFilter: document.getElementById("menuManagementActiveFilter"),
        pagination: document.getElementById("menuManagementPagination"),
        prev: document.getElementById("menuManagementPrevPage"),
        next: document.getElementById("menuManagementNextPage"),
        pageInfo: document.getElementById("menuManagementPageInfo"),
        empty: document.getElementById("menuManagementEmpty"),
        drawer: document.getElementById("menuItemDrawer"),
        form: document.getElementById("menuItemForm"),
        title: document.getElementById("menuDrawerTitle"),
        subtitle: document.getElementById("menuDrawerSubtitle"),
        editingId: document.getElementById("menuEditingItemId"),
        name: document.getElementById("foodName"),
        category: document.getElementById("foodCategory"),
        newCategory: document.getElementById("newCategory"),
        price: document.getElementById("foodPrice"),
        image: document.getElementById("foodImage"),
        description: document.getElementById("foodDescription"),
        available: document.getElementById("foodAvailable"),
        preview: document.getElementById("menuImagePreview"),
        message: document.getElementById("menuFormMessage"),
        currency: document.getElementById("menuFormCurrency")
    };
}

function loadCategoryOptions(selected = "") {
    const elements = getMenuElements();
    const categories = getCategories();

    if (elements.category) {
        elements.category.innerHTML =
            '<option value="">Select Category</option>';

        categories.forEach(function (category) {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            elements.category.appendChild(option);
        });

        elements.category.value = selected;
    }

    if (elements.categoryFilter) {
        const current = elements.categoryFilter.value || "all";

        elements.categoryFilter.innerHTML =
            '<option value="all">All Categories</option>';

        categories.forEach(function (category) {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            elements.categoryFilter.appendChild(option);
        });

        elements.categoryFilter.value =
            categories.includes(current) ? current : "all";
    }
}

function updateMenuSummary() {
    const available = menuItems.filter(function (item) {
        return item.available !== false;
    }).length;

    document.getElementById("menuSummaryTotal").textContent =
        menuItems.length;

    document.getElementById("menuSummaryAvailable").textContent =
        available;

    document.getElementById("menuSummaryUnavailable").textContent =
        menuItems.length - available;

    document.getElementById("menuSummaryCategories").textContent =
        getCategories().length;
}

function renderCategoryChips() {
    const elements = getMenuElements();

    if (!elements.chips) return;

    const data = [
        {
            label: "All Items",
            value: "all",
            count: menuItems.length
        },
        ...getCategories().map(function (category) {
            return {
                label: category,
                value: category,
                count: menuItems.filter(function (item) {
                    return categoryKey(item.category) ===
                        categoryKey(category);
                }).length
            };
        })
    ];

    elements.chips.innerHTML = "";

    data.forEach(function (entry) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "menu-category-chip";

        const isActive =
            entry.value === "all"
                ? menuManagementActiveCategory === "all"
                : categoryKey(entry.value) ===
                  categoryKey(menuManagementActiveCategory);

        if (isActive) button.classList.add("active");

        button.innerHTML = `
            <span>${escapeMenuManagementHtml(entry.label)}</span>
            <strong>${entry.count}</strong>
        `;

        button.addEventListener("click", function () {
            menuManagementActiveCategory = entry.value;
            elements.categoryFilter.value = entry.value;
            menuManagementCurrentPage = 1;
            renderMenuTable();
        });

        elements.chips.appendChild(button);
    });
}

function getFilteredMenuItems() {
    const elements = getMenuElements();

    const search =
        (elements.search?.value || "")
            .trim()
            .toLowerCase();

    const category =
        elements.categoryFilter?.value || "all";

    const status =
        elements.statusFilter?.value || "all";

    const sort =
        elements.sort?.value || "name-asc";

    const filtered = menuItems.filter(function (item) {
        const matchesSearch =
            !search ||
            String(item.name || "").toLowerCase().includes(search) ||
            String(item.category || "").toLowerCase().includes(search);

        const matchesCategory =
            category === "all" ||
            categoryKey(item.category) === categoryKey(category);

        const available = item.available !== false;

        const matchesStatus =
            status === "all" ||
            (status === "available" && available) ||
            (status === "unavailable" && !available);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    return filtered.sort(function (a, b) {
        if (sort === "name-desc") {
            return String(b.name || "").localeCompare(String(a.name || ""));
        }

        if (sort === "price-high") {
            return Number(b.price || 0) - Number(a.price || 0);
        }

        if (sort === "price-low") {
            return Number(a.price || 0) - Number(b.price || 0);
        }

        if (sort === "newest") {
            return (
                new Date(b.updatedAt || b.createdAt || 0).getTime() -
                new Date(a.updatedAt || a.createdAt || 0).getTime()
            );
        }

        return String(a.name || "").localeCompare(String(b.name || ""));
    });
}

function formatMenuUpdatedDate(item) {
    const value = item.updatedAt || item.createdAt;

    if (!value) return "Not recorded";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "Not recorded"
        : date.toLocaleDateString();
}

function renderMenuTable() {
    const elements = getMenuElements();
    const tableBody = document.getElementById("menuTableBody");
    const filtered = getFilteredMenuItems();

    const pageSize =
        Number(elements.pageSize?.value || 25);

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / pageSize)
    );

    menuManagementCurrentPage = Math.min(
        menuManagementCurrentPage,
        totalPages
    );

    const start =
        (menuManagementCurrentPage - 1) * pageSize;

    const pageItems =
        filtered.slice(start, start + pageSize);

    tableBody.innerHTML = "";

    updateMenuSummary();
    renderCategoryChips();

    elements.range.textContent =
        filtered.length === 0
            ? "Showing 0 items"
            : `Showing ${start + 1}–${Math.min(
                start + pageSize,
                filtered.length
            )} of ${filtered.length}`;

    const filters = [];

    if (elements.search.value.trim()) {
        filters.push(`Search: “${elements.search.value.trim()}”`);
    }

    if (elements.categoryFilter.value !== "all") {
        filters.push(elements.categoryFilter.value);
    }

    if (elements.statusFilter.value !== "all") {
        filters.push(
            elements.statusFilter.value === "available"
                ? "Available"
                : "Out of Stock"
        );
    }

    elements.activeFilter.textContent =
        filters.length ? filters.join(" · ") : "All menu items";

    if (!filtered.length) {
        elements.empty.hidden = false;
        elements.pagination.hidden = true;
        return;
    }

    elements.empty.hidden = true;

    const currency =
        restaurantSettings.currency || "SAR";

    pageItems.forEach(function (item) {
        const available = item.available !== false;
        const row = document.createElement("tr");

        const imageHtml = item.image
            ? `
                <div class="menu-item-thumbnail">
                    <img src="${escapeMenuManagementHtml(item.image)}"
                         alt="${escapeMenuManagementHtml(item.name)}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
                    <span style="display:none;">🍽️</span>
                </div>
            `
            : `<div class="menu-item-thumbnail">🍽️</div>`;

        row.innerHTML = `
            <td data-label="Item">
                <div class="menu-item-identity">
                    ${imageHtml}
                    <div>
                        <strong>${escapeMenuManagementHtml(item.name)}</strong>
                        <small>${escapeMenuManagementHtml(
                            item.description || "No description"
                        )}</small>
                    </div>
                </div>
            </td>

            <td data-label="Category">
                ${escapeMenuManagementHtml(cleanCategory(item.category))}
            </td>

            <td data-label="Price">
                <strong class="menu-item-price">
                    ${escapeMenuManagementHtml(currency)}
                    ${Number(item.price || 0).toFixed(2)}
                </strong>
            </td>

            <td data-label="Status">
                <span class="menu-status-badge ${
                    available ? "available" : "unavailable"
                }">
                    ${available ? "Available" : "Out of Stock"}
                </span>
            </td>

            <td data-label="Updated">
                ${escapeMenuManagementHtml(formatMenuUpdatedDate(item))}
            </td>

            <td data-label="Actions">
                <div class="menu-row-actions">
                    <button class="menu-edit-button"
                            type="button"
                            onclick="editItem('${escapeMenuManagementHtml(item.id)}')">
                        Edit
                    </button>

                    <button class="menu-toggle-button ${
                        available ? "disable" : "enable"
                    }"
                            type="button"
                            onclick="toggleAvailability('${escapeMenuManagementHtml(item.id)}')">
                        ${available ? "Disable" : "Enable"}
                    </button>

                    <button class="menu-delete-button"
                            type="button"
                            onclick="deleteItem('${escapeMenuManagementHtml(item.id)}')">
                        Delete
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    elements.pagination.hidden = totalPages <= 1;
    elements.pageInfo.textContent =
        `Page ${menuManagementCurrentPage} of ${totalPages}`;
    elements.prev.disabled =
        menuManagementCurrentPage === 1;
    elements.next.disabled =
        menuManagementCurrentPage === totalPages;
}

function saveMenu() {
    localStorage.setItem(
        "tableTapMenu",
        JSON.stringify(menuItems)
    );

    loadCategoryOptions();
    renderMenuTable();

    if (typeof loadStats === "function") loadStats();
}

function updateMenuImagePreview() {
    const elements = getMenuElements();
    const url = elements.image.value.trim();

    elements.preview.innerHTML = url
        ? `
            <img src="${escapeMenuManagementHtml(url)}"
                 alt="Menu item preview"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
            <span style="display:none;">🍽️</span>
            <small>Image preview</small>
        `
        : `<span>🍽️</span><small>Image preview</small>`;
}

function resetMenuItemForm() {
    const elements = getMenuElements();

    elements.form.reset();
    elements.editingId.value = "";
    elements.available.checked = true;
    elements.message.textContent = "";
    elements.currency.textContent =
        restaurantSettings.currency || "SAR";

    updateMenuImagePreview();
}

function openMenuItemDrawer(item = null) {
    const elements = getMenuElements();

    resetMenuItemForm();
    loadCategoryOptions(item?.category || "");

    if (item) {
        elements.title.textContent = "Edit Menu Item";
        elements.subtitle.textContent =
            "Update this customer-facing menu item.";
        elements.editingId.value = item.id;
        elements.name.value = item.name || "";
        elements.category.value = item.category || "";
        elements.price.value = Number(item.price || 0);
        elements.image.value = item.image || "";
        elements.description.value = item.description || "";
        elements.available.checked = item.available !== false;
    } else {
        elements.title.textContent = "Add Menu Item";
        elements.subtitle.textContent =
            "Create a new customer-facing item.";
    }

    updateMenuImagePreview();

    elements.drawer.classList.add("show");
    elements.drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeMenuItemDrawer() {
    const elements = getMenuElements();

    elements.drawer.classList.remove("show");
    elements.drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function editItem(itemId) {
    const item = menuItems.find(function (menuItem) {
        return String(menuItem.id) === String(itemId);
    });

    if (!item) {
        alert("Menu item not found.");
        return;
    }

    openMenuItemDrawer(item);
}

function toggleAvailability(itemId) {
    const item = menuItems.find(function (menuItem) {
        return String(menuItem.id) === String(itemId);
    });

    if (!item) return;

    item.available = item.available === false;
    item.updatedAt = new Date().toISOString();
    saveMenu();
}

function deleteItem(itemId) {
    const item = menuItems.find(function (menuItem) {
        return String(menuItem.id) === String(itemId);
    });

    if (!item) return;

    if (!confirm(`Delete “${item.name}”? This cannot be undone.`)) {
        return;
    }

    menuItems = menuItems.filter(function (menuItem) {
        return String(menuItem.id) !== String(itemId);
    });

    saveMenu();
}

function saveMenuItemFromForm(event) {
    event.preventDefault();

    const elements = getMenuElements();

    const name = elements.name.value.trim();
    const selectedCategory =
        cleanCategory(elements.category.value);
    const typedCategory =
        cleanCategory(elements.newCategory.value);
    const price = Number(elements.price.value);

    if (!name) {
        elements.message.textContent =
            "Please enter an item name.";
        return;
    }

    if (!Number.isFinite(price) || price <= 0) {
        elements.message.textContent =
            "Please enter a valid price.";
        return;
    }

    if (!selectedCategory && !typedCategory) {
        elements.message.textContent =
            "Please select or create a category.";
        return;
    }

    const existingCategory =
        getCategories().find(function (category) {
            return categoryKey(category) ===
                categoryKey(typedCategory);
        });

    const finalCategory =
        typedCategory
            ? existingCategory || typedCategory
            : selectedCategory;

    const now = new Date().toISOString();
    const editingId = elements.editingId.value;

    if (editingId) {
        const item = menuItems.find(function (menuItem) {
            return String(menuItem.id) === String(editingId);
        });

        if (!item) return;

        item.name = name;
        item.category = finalCategory;
        item.price = price;
        item.image = elements.image.value.trim();
        item.description =
            elements.description.value.trim();
        item.available =
            elements.available.checked;
        item.updatedAt = now;
    } else {
        menuItems.push({
            id: Date.now(),
            name,
            category: finalCategory,
            price,
            image: elements.image.value.trim(),
            description:
                elements.description.value.trim(),
            available:
                elements.available.checked,
            createdAt: now,
            updatedAt: now
        });
    }

    saveMenu();
    closeMenuItemDrawer();
}

function resetMenuManagementPageAndRender() {
    menuManagementCurrentPage = 1;
    renderMenuTable();
}

function initMenuManagementModule() {
    const elements = getMenuElements();

    loadCategoryOptions();
    renderMenuTable();

    document
        .getElementById("addMenuItemBtn")
        ?.addEventListener("click", function () {
            openMenuItemDrawer();
        });

    elements.form?.addEventListener(
        "submit",
        saveMenuItemFromForm
    );

    elements.image?.addEventListener(
        "input",
        updateMenuImagePreview
    );

    elements.search?.addEventListener(
        "input",
        resetMenuManagementPageAndRender
    );

    elements.categoryFilter?.addEventListener(
        "change",
        function () {
            menuManagementActiveCategory =
                elements.categoryFilter.value;
            resetMenuManagementPageAndRender();
        }
    );

    elements.statusFilter?.addEventListener(
        "change",
        resetMenuManagementPageAndRender
    );

    elements.sort?.addEventListener(
        "change",
        resetMenuManagementPageAndRender
    );

    elements.pageSize?.addEventListener(
        "change",
        resetMenuManagementPageAndRender
    );

    elements.prev?.addEventListener(
        "click",
        function () {
            if (menuManagementCurrentPage > 1) {
                menuManagementCurrentPage -= 1;
                renderMenuTable();
            }
        }
    );

    elements.next?.addEventListener(
        "click",
        function () {
            menuManagementCurrentPage += 1;
            renderMenuTable();
        }
    );

    document
        .querySelectorAll("[data-menu-drawer-close]")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                closeMenuItemDrawer
            );
        });

    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Escape" &&
                elements.drawer?.classList.contains("show")
            ) {
                closeMenuItemDrawer();
            }
        }
    );
}