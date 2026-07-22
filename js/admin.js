
        let menuItems =
            JSON.parse(localStorage.getItem("tableTapMenu")) ||
            defaultMenuItems;

        menuItems = menuItems.map(function (item) {
            return {
                ...item,
                available: item.available !== false
            };
        });

        let orders =
            JSON.parse(localStorage.getItem("tableTapOrders")) || [];

        let tables =
            JSON.parse(localStorage.getItem("tableTapTables")) || [];


        
        let restaurantSettings = { ...defaultRestaurantSettings, ...(JSON.parse(localStorage.getItem("tableTapSettings")) || {}) };

        let selectedAnalyticsPeriod = "today";
        let customStartDate = null;
        let customEndDate = null;


        const adminPageHeader = document.getElementById("adminPageHeader");
        const settingRestaurantName = document.getElementById("settingRestaurantName");
        const settingBranchName = document.getElementById("settingBranchName");
        const settingPhone = document.getElementById("settingPhone");
        const settingWhatsApp = document.getElementById("settingWhatsApp");
        const settingEmail = document.getElementById("settingEmail");
        const settingOpeningHours = document.getElementById("settingOpeningHours");
        const settingAddress = document.getElementById("settingAddress");
        const settingVatNumber = document.getElementById("settingVatNumber");
        const settingVatPercent = document.getElementById("settingVatPercent");
        const settingCurrency = document.getElementById("settingCurrency");
        const settingLogoUrl = document.getElementById("settingLogoUrl");
        const settingReceiptFooter = document.getElementById("settingReceiptFooter");
        const saveRestaurantSettingsButton = document.getElementById("saveRestaurantSettings");
        const settingsSavedMessage = document.getElementById("settingsSavedMessage");

        const menuManagementSection = document.getElementById("menuManagement");
        const restaurantSettingsSection = document.getElementById("restaurantSettings");
        const openMenuManagementLink = document.getElementById("openMenuManagementLink");
        const openRestaurantSettingsLink = document.getElementById("openRestaurantSettingsLink");
        const restaurantFloorSection = document.getElementById("restaurantFloor");
        const openRestaurantFloorLink = document.getElementById("openRestaurantFloorLink");
        const billingSection = document.getElementById("billingSection");
        const openBillingLink = document.getElementById("openBillingLink");
        const paymentRecordsSection = document.getElementById("paymentRecordsSection");
        const openPaymentRecordsLink = document.getElementById("openPaymentRecordsLink");
        const paymentRecordsCount = document.getElementById("paymentRecordsCount");
        const paymentSummaryCount = document.getElementById("paymentSummaryCount");
        const paymentSummaryCurrency1 = document.getElementById("paymentSummaryCurrency1");
        const paymentSummaryCurrency2 = document.getElementById("paymentSummaryCurrency2");
        const paymentSummaryCurrency3 = document.getElementById("paymentSummaryCurrency3");
        const paymentSummarySubtotal = document.getElementById("paymentSummarySubtotal");
        const paymentSummaryVat = document.getElementById("paymentSummaryVat");
        const paymentSummaryTotal = document.getElementById("paymentSummaryTotal");
        const paymentRecordSearch = document.getElementById("paymentRecordSearch");
        const paymentRecordDateFilter = document.getElementById("paymentRecordDateFilter");
        const paymentRecordMethodFilter = document.getElementById("paymentRecordMethodFilter");
        const paymentRecordsGrid = document.getElementById("paymentRecordsGrid");
        const paymentRecordsEmpty = document.getElementById("paymentRecordsEmpty");
        const billingOrdersGrid = document.getElementById("billingOrdersGrid");
        const billingEmptyState = document.getElementById("billingEmptyState");
        const billingOrderCount = document.getElementById("billingOrderCount");
        const billModal = document.getElementById("billModal");
        const billModalOverlay = document.getElementById("billModalOverlay");
        const closeBillModalButton = document.getElementById("closeBillModal");
        const billModalSubtitle = document.getElementById("billModalSubtitle");
        const printableBill = document.getElementById("printableBill");
        const printBillButton = document.getElementById("printBillButton");
        const modalMarkPaidButton = document.getElementById("modalMarkPaidButton");
        let selectedBillingOrderId = null;
        const toggleAddTableForm = document.getElementById("toggleAddTableForm");
        const addTableForm = document.getElementById("addTableForm");
        const cancelAddTable = document.getElementById("cancelAddTable");
        const tableNameInput = document.getElementById("tableName");
        const tableNumberInput = document.getElementById("tableNumber");
        const tableCapacityInput = document.getElementById("tableCapacity");
        const tableAreaInput = document.getElementById("tableArea");
        const tableEnabledInput = document.getElementById("tableEnabled");
        const restaurantFloorGrid = document.getElementById("restaurantFloorGrid");
        const restaurantFloorEmpty = document.getElementById("restaurantFloorEmpty");
        const availableTableCount = document.getElementById("availableTableCount");
        const activeTableCount = document.getElementById("activeTableCount");
        const readyTableCount = document.getElementById("readyTableCount");
        const disabledTableCount = document.getElementById("disabledTableCount");

        const addMenuItemBtn = document.getElementById("addMenuItemBtn");
        const addItemForm = document.getElementById("addItemForm");
        const saveNewItem = document.getElementById("saveNewItem");
        const foodCategory = document.getElementById("foodCategory");
        const newCategory = document.getElementById("newCategory");

        const orderSearch = document.getElementById("orderSearch");
        const orderDateFilter = document.getElementById("orderDateFilter");
        const orderStatusFilter = document.getElementById("orderStatusFilter");
        const orderHistoryContainer = document.getElementById("orderHistoryContainer");
        const orderHistoryCount = document.getElementById("orderHistoryCount");
        const activeHistoryFilter = document.getElementById("activeHistoryFilter");

        const analyticsFilterButtons =
            document.querySelectorAll(".analytics-filter[data-period]");

        const startDateInput =
            document.getElementById("analyticsStartDate");

        const endDateInput =
            document.getElementById("analyticsEndDate");

        const toggleCustomDateButton =
            document.getElementById("toggleCustomDate");

        const customDatePanel =
            document.getElementById("customDatePanel");

        const clearCustomDateButton =
            document.getElementById("clearCustomDate");

        const applyCustomDateButton =
            document.getElementById("applyCustomDate");


        function loadRestaurantSettingsForm() {
            settingRestaurantName.value = restaurantSettings.restaurantName || "";
            settingBranchName.value = restaurantSettings.branchName || "";
            settingPhone.value = restaurantSettings.phone || "";
            settingWhatsApp.value = restaurantSettings.whatsapp || "";
            settingEmail.value = restaurantSettings.email || "";
            settingOpeningHours.value = restaurantSettings.openingHours || "";
            settingAddress.value = restaurantSettings.address || "";
            settingVatNumber.value = restaurantSettings.vatNumber || "";
            settingVatPercent.value = Number(restaurantSettings.vatPercent ?? 15);
            settingCurrency.value = restaurantSettings.currency || "SAR";
            settingLogoUrl.value = restaurantSettings.logoUrl || "";
            settingReceiptFooter.value = restaurantSettings.receiptFooter || "";
        }
        function applyRestaurantBranding() {
            const name = restaurantSettings.restaurantName || defaultRestaurantSettings.restaurantName;
            adminPageHeader.textContent = `⚙️ ${name} Admin`;
            document.title = `${name} Admin Panel`;
        }
        function saveRestaurantSettings() {
            const restaurantName = settingRestaurantName.value.trim();
            const vatPercent = Number(settingVatPercent.value);
            if (!restaurantName) { alert("Please enter the restaurant name."); settingRestaurantName.focus(); return; }
            if (Number.isNaN(vatPercent) || vatPercent < 0 || vatPercent > 100) { alert("Please enter a valid VAT percentage between 0 and 100."); settingVatPercent.focus(); return; }
            restaurantSettings = {
                restaurantName,
                branchName: settingBranchName.value.trim(),
                phone: settingPhone.value.trim(),
                whatsapp: settingWhatsApp.value.trim(),
                email: settingEmail.value.trim(),
                openingHours: settingOpeningHours.value.trim(),
                address: settingAddress.value.trim(),
                vatNumber: settingVatNumber.value.trim(),
                vatPercent,
                currency: settingCurrency.value,
                logoUrl: settingLogoUrl.value.trim(),
                receiptFooter: settingReceiptFooter.value.trim()
            };
            localStorage.setItem("tableTapSettings", JSON.stringify(restaurantSettings));
            applyRestaurantBranding();
            settingsSavedMessage.textContent = "Settings saved successfully.";
            window.setTimeout(() => { settingsSavedMessage.textContent = ""; }, 3000);
        }



        function getPaymentRecordDate(order) {
            const dateValue =
                order.paidAt ||
                order.completedAt ||
                order.createdAt;

            const parsedDate = new Date(dateValue);

            return Number.isNaN(parsedDate.getTime())
                ? null
                : parsedDate;
        }

        function getPaidOrders() {
            return orders.filter(function (order) {
                return (
                    order.paymentStatus === "Paid" ||
                    (
                        order.status === "Completed" &&
                        Boolean(order.paymentMethod)
                    )
                );
            });
        }

        function matchesPaymentDateFilter(order, filterValue) {
            if (filterValue === "all") {
                return true;
            }

            const orderDate = getPaymentRecordDate(order);

            if (!orderDate) {
                return false;
            }

            const now = new Date();
            const todayStart =
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                );

            const tomorrowStart =
                new Date(todayStart);

            tomorrowStart.setDate(
                tomorrowStart.getDate() + 1
            );

            if (filterValue === "today") {
                return (
                    orderDate >= todayStart &&
                    orderDate < tomorrowStart
                );
            }

            const yesterdayStart =
                new Date(todayStart);

            yesterdayStart.setDate(
                yesterdayStart.getDate() - 1
            );

            if (filterValue === "yesterday") {
                return (
                    orderDate >= yesterdayStart &&
                    orderDate < todayStart
                );
            }

            if (filterValue === "week") {
                const weekStart =
                    new Date(todayStart);

                weekStart.setDate(
                    weekStart.getDate() - 6
                );

                return (
                    orderDate >= weekStart &&
                    orderDate < tomorrowStart
                );
            }

            if (filterValue === "month") {
                return (
                    orderDate.getFullYear() ===
                        now.getFullYear() &&
                    orderDate.getMonth() ===
                        now.getMonth()
                );
            }

            return true;
        }

        function getFilteredPaymentRecords() {
            const searchValue =
                paymentRecordSearch.value
                    .trim()
                    .toLowerCase();

            const dateFilter =
                paymentRecordDateFilter.value;

            const methodFilter =
                paymentRecordMethodFilter.value;

            return getPaidOrders().filter(function (order) {
                const orderId =
                    String(order.id || "")
                        .toLowerCase();

                const customerName =
                    String(order.customer?.name || "")
                        .toLowerCase();

                const phone =
                    String(order.customer?.phone || "")
                        .toLowerCase();

                const table =
                    String(order.customer?.table || "")
                        .toLowerCase();

                const matchesSearch =
                    !searchValue ||
                    orderId.includes(searchValue) ||
                    customerName.includes(searchValue) ||
                    phone.includes(searchValue) ||
                    table.includes(searchValue);

                const matchesMethod =
                    methodFilter === "all" ||
                    order.paymentMethod === methodFilter;

                const matchesDate =
                    matchesPaymentDateFilter(
                        order,
                        dateFilter
                    );

                return (
                    matchesSearch &&
                    matchesMethod &&
                    matchesDate
                );
            });
        }

        function updatePaymentSummary(filteredOrders) {
            const currency = getCurrency();

            const totals =
                filteredOrders.reduce(
                    function (summary, order) {
                        const fallbackBill =
                            calculateBill(order);

                        summary.subtotal +=
                            Number(
                                order.billSubtotal ??
                                fallbackBill.subtotal
                            );

                        summary.vat +=
                            Number(
                                order.vatAmount ??
                                fallbackBill.vatAmount
                            );

                        summary.total +=
                            Number(
                                order.total ??
                                fallbackBill.grandTotal
                            );

                        return summary;
                    },
                    {
                        subtotal: 0,
                        vat: 0,
                        total: 0
                    }
                );

            paymentSummaryCount.textContent =
                filteredOrders.length;

            paymentSummaryCurrency1.textContent =
                currency;

            paymentSummaryCurrency2.textContent =
                currency;

            paymentSummaryCurrency3.textContent =
                currency;

            paymentSummarySubtotal.textContent =
                totals.subtotal.toFixed(2);

            paymentSummaryVat.textContent =
                totals.vat.toFixed(2);

            paymentSummaryTotal.textContent =
                totals.total.toFixed(2);
        }

        function renderPaymentRecords() {
            const filteredOrders =
                getFilteredPaymentRecords();

            paymentRecordsGrid.innerHTML = "";

            paymentRecordsCount.textContent =
                `${filteredOrders.length} payment${
                    filteredOrders.length === 1 ? "" : "s"
                }`;

            updatePaymentSummary(filteredOrders);

            if (filteredOrders.length === 0) {
                paymentRecordsEmpty.hidden = false;
                return;
            }

            paymentRecordsEmpty.hidden = true;

            filteredOrders
                .slice()
                .sort(function (first, second) {
                    const firstDate =
                        getPaymentRecordDate(first);

                    const secondDate =
                        getPaymentRecordDate(second);

                    return (
                        (secondDate?.getTime() || 0) -
                        (firstDate?.getTime() || 0)
                    );
                })
                .forEach(function (order) {
                    const fallbackBill =
                        calculateBill(order);

                    const currency =
                        getCurrency();

                    const subtotal =
                        Number(
                            order.billSubtotal ??
                            fallbackBill.subtotal
                        );

                    const vatAmount =
                        Number(
                            order.vatAmount ??
                            fallbackBill.vatAmount
                        );

                    const total =
                        Number(
                            order.total ??
                            fallbackBill.grandTotal
                        );

                    const paidDate =
                        getPaymentRecordDate(order);

                    const card =
                        document.createElement("article");

                    card.className =
                        "payment-record-card";

                    card.innerHTML = `
                        <div class="payment-record-header">
                            <div>
                                <h3>
                                    ${order.id || "Unknown Order"}
                                </h3>

                                <small>
                                    ${
                                        paidDate
                                            ? paidDate.toLocaleString()
                                            : "Payment date unavailable"
                                    }
                                </small>
                            </div>

                            <span class="payment-record-method">
                                ${order.paymentMethod || "Unknown"}
                            </span>
                        </div>

                        <div class="payment-record-meta">
                            <p>
                                <strong>Customer:</strong>
                                ${order.customer?.name || "Unknown"}
                            </p>

                            <p>
                                <strong>Phone:</strong>
                                ${order.customer?.phone || "Not provided"}
                            </p>

                            <p>
                                <strong>Table:</strong>
                                ${order.customer?.table || "—"}
                            </p>

                            <p>
                                <strong>Status:</strong>
                                ${order.paymentStatus || "Paid"}
                            </p>
                        </div>

                        <div class="payment-record-totals">
                            <div class="payment-record-line">
                                <span>Subtotal</span>
                                <strong>
                                    ${currency}
                                    ${subtotal.toFixed(2)}
                                </strong>
                            </div>

                            <div class="payment-record-line">
                                <span>VAT</span>
                                <strong>
                                    ${currency}
                                    ${vatAmount.toFixed(2)}
                                </strong>
                            </div>

                            <div class="payment-record-line total">
                                <span>Total</span>
                                <strong>
                                    ${currency}
                                    ${total.toFixed(2)}
                                </strong>
                            </div>
                        </div>

                        <div class="payment-record-actions">
                            <button
                                type="button"
                                onclick="openBill('${order.id}')"
                            >
                                Reprint Receipt
                            </button>
                        </div>
                    `;

                    paymentRecordsGrid.appendChild(card);
                });
        }

        
        
        function getCategories() {
            const categoryMap = new Map();

            menuItems.forEach(function (item) {
                const category = cleanCategory(item.category);
                const key = categoryKey(category);

                if (category && !categoryMap.has(key)) {
                    categoryMap.set(key, category);
                }
            });

            return Array.from(categoryMap.values());
        }

        function loadCategoryOptions() {
            foodCategory.innerHTML =
                '<option value="">Select Category</option>';

            getCategories().forEach(function (category) {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                foodCategory.appendChild(option);
            });
        }

      
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
                    const start = new Date(customStartDate + "T00:00:00");
                    const end = new Date(customEndDate + "T23:59:59.999");
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

        function loadStats() {
            const filteredOrders =
                filterOrdersByPeriod(selectedAnalyticsPeriod);

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
        }

        function renderMenuTable() {
            const tableBody =
                document.getElementById("menuTableBody");

            tableBody.innerHTML = "";

            menuItems.forEach(function (item) {
                const row = document.createElement("tr");

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

                    <td>${item.category}</td>
                    <td>SAR ${Number(item.price)}</td>

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
                                background:${item.available ? "#f0a500" : "#2e9d56"};
                                color:white;
                            "
                            onclick="toggleAvailability('${item.id}')"
                        >
                            ${item.available ? "Disable" : "Enable"}
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

        function getHistoryStatusClass(status) {
            return `history-status-${String(status || "New").toLowerCase()}`;
        }

        function getFilteredOrderHistory() {
            const searchText =
                orderSearch.value.trim().toLowerCase();

            const selectedDate =
                orderDateFilter.value;

            const selectedStatus =
                orderStatusFilter.value;

            const now = new Date();
            const todayStart = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

            const tomorrowStart = new Date(todayStart);
            tomorrowStart.setDate(tomorrowStart.getDate() + 1);

            const yesterdayStart = new Date(todayStart);
            yesterdayStart.setDate(yesterdayStart.getDate() - 1);

            const weekStart = new Date(todayStart);
            weekStart.setDate(weekStart.getDate() - 6);

            return orders.filter(function (order) {
                const orderId =
                    String(order.id || "").toLowerCase();

                const customerName =
                    String(order.customer?.name || "").toLowerCase();

                const phone =
                    String(order.customer?.phone || "").toLowerCase();

                const orderDate =
                    getOrderDate(order);

                const matchesSearch =
                    !searchText ||
                    orderId.includes(searchText) ||
                    customerName.includes(searchText) ||
                    phone.includes(searchText);

                const matchesStatus =
                    selectedStatus === "all" ||
                    order.status === selectedStatus;

                let matchesDate = true;

                if (selectedDate !== "all") {
                    if (!orderDate) {
                        matchesDate = false;
                    } else if (selectedDate === "today") {
                        matchesDate =
                            orderDate >= todayStart &&
                            orderDate < tomorrowStart;
                    } else if (selectedDate === "yesterday") {
                        matchesDate =
                            orderDate >= yesterdayStart &&
                            orderDate < todayStart;
                    } else if (selectedDate === "week") {
                        matchesDate =
                            orderDate >= weekStart &&
                            orderDate < tomorrowStart;
                    }
                }

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesDate
                );
            });
        }

        function updateOrderHistoryLabel() {
            const labels = {
                today: "Showing today’s orders",
                yesterday: "Showing yesterday’s orders",
                week: "Showing the last 7 days",
                all: "Showing all orders"
            };

            activeHistoryFilter.textContent =
                labels[orderDateFilter.value] ||
                "Showing filtered orders";
        }

        function renderOrderHistory() {
            updateOrderHistoryLabel();

            const filteredOrders =
                getFilteredOrderHistory();

            orderHistoryContainer.innerHTML = "";

            orderHistoryCount.textContent =
                `${filteredOrders.length} order${
                    filteredOrders.length === 1 ? "" : "s"
                } found`;

            if (filteredOrders.length === 0) {
                orderHistoryContainer.innerHTML = `
                    <div class="history-empty">
                        <h3>No orders found</h3>
                        <p>Try another search or status filter.</p>
                    </div>
                `;
                return;
            }

            filteredOrders
                .slice()
                .reverse()
                .forEach(function (order) {
                    const card =
                        document.createElement("article");

                    card.className = "history-order-card";

                    const itemsHtml =
                        (order.items || [])
                            .map(function (item) {
                                const quantity =
                                    Number(item.quantity || 0);

                                const lineTotal =
                                    Number(item.price || 0) * quantity;

                                return `
                                    <div class="history-order-item">
                                        <span>${item.name} × ${quantity}</span>
                                        <strong>SAR ${lineTotal}</strong>
                                    </div>
                                `;
                            })
                            .join("");

                    card.innerHTML = `
                        <h3>${order.id || "Unknown Order"}</h3>

                        <div class="history-order-meta">
                            <p><strong>Customer:</strong> ${order.customer?.name || "Unknown"}</p>
                            <p><strong>Phone:</strong> ${order.customer?.phone || "Not provided"}</p>
                            <p><strong>Table:</strong> ${order.customer?.table || "Not provided"}</p>
                            <p><strong>Date:</strong> ${order.createdAt || "Not available"}</p>
                        </div>

                        <div>
                            ${itemsHtml || "<p>No items available.</p>"}
                        </div>

                        <div class="history-order-footer">
                            <span class="history-status ${getHistoryStatusClass(order.status)}">
                                ${order.status || "New"}
                            </span>

                            <strong>
                                Total: SAR ${Number(order.total || 0)}
                            </strong>
                        </div>
                    `;

                    orderHistoryContainer.appendChild(card);
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
                menuItems.find(function (menuItem) {
                    return String(menuItem.id) === String(itemId);
                });

            if (!item) {
                return;
            }

            const newName =
                prompt("Enter item name:", item.name);

            const newPrice =
                prompt("Enter item price:", item.price);

            const newImage =
                prompt("Enter image URL:", item.image || "");

            if (!newName || !newPrice) {
                return;
            }

            item.name = newName.trim();
            item.price = Number(newPrice);
            item.image = newImage ? newImage.trim() : "";

            saveMenu();
        }

        function toggleAvailability(itemId) {
            const item =
                menuItems.find(function (menuItem) {
                    return String(menuItem.id) === String(itemId);
                });

            if (!item) {
                return;
            }

            item.available = !item.available;
            saveMenu();
        }

        function deleteItem(itemId) {
            const confirmed =
                confirm("Are you sure you want to delete this item?");

            if (!confirmed) {
                return;
            }

            menuItems =
                menuItems.filter(function (item) {
                    return String(item.id) !== String(itemId);
                });

            saveMenu();
        }


     
        openPaymentRecordsLink.addEventListener("click", function () {
            paymentRecordsSection.open = true;
        });

        paymentRecordSearch.addEventListener("input", renderPaymentRecords);
        paymentRecordDateFilter.addEventListener("change", renderPaymentRecords);
        paymentRecordMethodFilter.addEventListener("change", renderPaymentRecords);

    
        addMenuItemBtn.addEventListener("click", function () {
            const isHidden =
                addItemForm.style.display === "none";

            addItemForm.style.display =
                isHidden ? "block" : "none";

            addMenuItemBtn.textContent =
                isHidden
                    ? "Close Form"
                    : "+ Add New Menu Item";
        });

        saveNewItem.addEventListener("click", function () {
            const name =
                document.getElementById("foodName").value.trim();

            const selectedCategory =
                cleanCategory(foodCategory.value);

            const typedCategory =
                cleanCategory(newCategory.value);

            const price =
                Number(document.getElementById("foodPrice").value);

            const image =
                document.getElementById("foodImage").value.trim();

            if (!name || price <= 0) {
                alert("Please enter a valid food name and price.");
                return;
            }

            if (!selectedCategory && !typedCategory) {
                alert("Please select or create a category.");
                return;
            }

            const existingCategory =
                getCategories().find(function (category) {
                    return (
                        categoryKey(category) ===
                        categoryKey(typedCategory)
                    );
                });

            const finalCategory =
                typedCategory
                    ? existingCategory || typedCategory
                    : selectedCategory;

            menuItems.push({
                id: Date.now(),
                name: name,
                category: finalCategory,
                price: price,
                image: image,
                available: true
            });

            document.getElementById("foodName").value = "";
            document.getElementById("foodPrice").value = "";
            document.getElementById("foodImage").value = "";
            foodCategory.value = "";
            newCategory.value = "";

            addItemForm.style.display = "none";
            addMenuItemBtn.textContent =
                "+ Add New Menu Item";

            saveMenu();
            alert("Menu item added successfully.");
        });

        openMenuManagementLink.addEventListener("click", function () {
            menuManagementSection.open = true;
        });

        openRestaurantSettingsLink.addEventListener("click", function () {
            restaurantSettingsSection.open = true;
        });

        saveRestaurantSettingsButton.addEventListener("click", saveRestaurantSettings);

        analyticsFilterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                analyticsFilterButtons.forEach(function (currentButton) {
                    currentButton.classList.remove("active");
                });

                toggleCustomDateButton.classList.remove("active");
                customDatePanel.classList.remove("show");
                button.classList.add("active");

                selectedAnalyticsPeriod =
                    button.dataset.period;

                loadStats();
            });
        });

        toggleCustomDateButton.addEventListener("click", function () {
            customDatePanel.classList.toggle("show");
            toggleCustomDateButton.classList.toggle(
                "active",
                customDatePanel.classList.contains("show")
            );
        });

        clearCustomDateButton.addEventListener("click", function () {
            startDateInput.value = "";
            endDateInput.value = "";
            customStartDate = null;
            customEndDate = null;
            selectedAnalyticsPeriod = "today";

            customDatePanel.classList.remove("show");
            toggleCustomDateButton.classList.remove("active");

            analyticsFilterButtons.forEach(function (button) {
                button.classList.toggle(
                    "active",
                    button.dataset.period === "today"
                );
            });

            loadStats();
        });

        applyCustomDateButton.addEventListener("click", function () {
            if (!startDateInput.value || !endDateInput.value) {
                alert("Please select both start and end dates.");
                return;
            }

            if (startDateInput.value > endDateInput.value) {
                alert("Start date cannot be after end date.");
                return;
            }

            customStartDate = startDateInput.value;
            customEndDate = endDateInput.value;
            selectedAnalyticsPeriod = "custom";

            analyticsFilterButtons.forEach(function (button) {
                button.classList.remove("active");
            });

            toggleCustomDateButton.classList.add("active");
            customDatePanel.classList.remove("show");
            loadStats();
        });

        orderSearch.addEventListener("input", renderOrderHistory);
        orderDateFilter.addEventListener("change", renderOrderHistory);
        orderStatusFilter.addEventListener("change", renderOrderHistory);

        window.addEventListener("storage", function (event) {

            if (event.key === "tableTapSettings") {
                restaurantSettings = { ...defaultRestaurantSettings, ...(JSON.parse(event.newValue) || {}) };
                loadRestaurantSettingsForm();
                applyRestaurantBranding();
                renderBilling();
                renderPaymentRecords();
            }

            if (event.key === "tableTapOrders") {
                orders =
                    JSON.parse(event.newValue) || [];

                loadStats();
                renderOrderHistory();
                renderRestaurantFloor();
                renderBilling();
                renderPaymentRecords();
            }

            if (event.key === "tableTapTables") {
                tables = JSON.parse(event.newValue) || [];
                renderRestaurantFloor();
            }

            if (event.key === "tableTapMenu") {
                menuItems =
                    JSON.parse(event.newValue) || defaultMenuItems;

                menuItems = menuItems.map(function (item) {
                    return {
                        ...item,
                        available: item.available !== false
                    };
                });

                loadCategoryOptions();
                loadStats();
                renderMenuTable();
            }
        });

        orderDateFilter.value = "today";
        orderStatusFilter.value = "all";
        paymentRecordDateFilter.value = "today";
        paymentRecordMethodFilter.value = "all";
    
        initRestaurantFloorModule();
        initBillingModule();

        loadRestaurantSettingsForm();
        applyRestaurantBranding();
        loadCategoryOptions();
        loadStats();
        renderMenuTable();
        renderOrderHistory();
        renderRestaurantFloor();       
        renderBilling();
        renderPaymentRecords();