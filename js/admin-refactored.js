// =====================================
// TABLETAP - ADMIN STARTUP CONTROLLER
// =====================================

// -------------------------------
// APPLICATION DATA
// -------------------------------

let menuItems =
    JSON.parse(
        localStorage.getItem("tableTapMenu")
    ) || defaultMenuItems;

menuItems = menuItems.map(function (item) {
    return {
        ...item,
        available: item.available !== false
    };
});

let orders =
    JSON.parse(
        localStorage.getItem("tableTapOrders")
    ) || [];

let tables =
    JSON.parse(
        localStorage.getItem("tableTapTables")
    ) || [];

let restaurantSettings = {
    ...defaultRestaurantSettings,
    ...(
        JSON.parse(
            localStorage.getItem(
                "tableTapSettings"
            )
        ) || {}
    )
};

let selectedAnalyticsPeriod = "today";
let customStartDate = null;
let customEndDate = null;

let selectedBillingOrderId = null;

// -------------------------------
// RESTAURANT SETTINGS ELEMENTS
// -------------------------------

const adminPageHeader =
    document.getElementById(
        "adminPageHeader"
    );

const settingRestaurantName =
    document.getElementById(
        "settingRestaurantName"
    );

const settingBranchName =
    document.getElementById(
        "settingBranchName"
    );

const settingPhone =
    document.getElementById(
        "settingPhone"
    );

const settingWhatsApp =
    document.getElementById(
        "settingWhatsApp"
    );

const settingEmail =
    document.getElementById(
        "settingEmail"
    );

const settingOpeningHours =
    document.getElementById(
        "settingOpeningHours"
    );

const settingAddress =
    document.getElementById(
        "settingAddress"
    );

const settingVatNumber =
    document.getElementById(
        "settingVatNumber"
    );

const settingVatPercent =
    document.getElementById(
        "settingVatPercent"
    );

const settingCurrency =
    document.getElementById(
        "settingCurrency"
    );

const settingLogoUrl =
    document.getElementById(
        "settingLogoUrl"
    );

const settingReceiptFooter =
    document.getElementById(
        "settingReceiptFooter"
    );

const saveRestaurantSettingsButton =
    document.getElementById(
        "saveRestaurantSettings"
    );

const settingsSavedMessage =
    document.getElementById(
        "settingsSavedMessage"
    );

const restaurantSettingsSection =
    document.getElementById(
        "restaurantSettings"
    );

const openRestaurantSettingsLink =
    document.getElementById(
        "openRestaurantSettingsLink"
    );

// -------------------------------
// MENU MANAGEMENT ELEMENTS
// -------------------------------

const menuManagementSection =
    document.getElementById(
        "menuManagement"
    );

const openMenuManagementLink =
    document.getElementById(
        "openMenuManagementLink"
    );

const addMenuItemBtn =
    document.getElementById(
        "addMenuItemBtn"
    );

const addItemForm =
    document.getElementById(
        "addItemForm"
    );

const saveNewItem =
    document.getElementById(
        "saveNewItem"
    );

const foodCategory =
    document.getElementById(
        "foodCategory"
    );

const newCategory =
    document.getElementById(
        "newCategory"
    );

// -------------------------------
// RESTAURANT FLOOR ELEMENTS
// -------------------------------

const restaurantFloorSection =
    document.getElementById(
        "restaurantFloor"
    );

const openRestaurantFloorLink =
    document.getElementById(
        "openRestaurantFloorLink"
    );

const toggleAddTableForm =
    document.getElementById(
        "toggleAddTableForm"
    );

const addTableForm =
    document.getElementById(
        "addTableForm"
    );

const cancelAddTable =
    document.getElementById(
        "cancelAddTable"
    );

const tableNameInput =
    document.getElementById(
        "tableName"
    );

const tableNumberInput =
    document.getElementById(
        "tableNumber"
    );

const tableCapacityInput =
    document.getElementById(
        "tableCapacity"
    );

const tableAreaInput =
    document.getElementById(
        "tableArea"
    );

const tableEnabledInput =
    document.getElementById(
        "tableEnabled"
    );

const restaurantFloorGrid =
    document.getElementById(
        "restaurantFloorGrid"
    );

const restaurantFloorEmpty =
    document.getElementById(
        "restaurantFloorEmpty"
    );

const availableTableCount =
    document.getElementById(
        "availableTableCount"
    );

const activeTableCount =
    document.getElementById(
        "activeTableCount"
    );

const readyTableCount =
    document.getElementById(
        "readyTableCount"
    );

const disabledTableCount =
    document.getElementById(
        "disabledTableCount"
    );

// -------------------------------
// BILLING ELEMENTS
// -------------------------------

const billingSection =
    document.getElementById(
        "billingSection"
    );

const openBillingLink =
    document.getElementById(
        "openBillingLink"
    );

const billingOrdersGrid =
    document.getElementById(
        "billingOrdersGrid"
    );

const billingEmptyState =
    document.getElementById(
        "billingEmptyState"
    );

const billingOrderCount =
    document.getElementById(
        "billingOrderCount"
    );

const billModal =
    document.getElementById(
        "billModal"
    );

const billModalOverlay =
    document.getElementById(
        "billModalOverlay"
    );

const closeBillModalButton =
    document.getElementById(
        "closeBillModal"
    );

const billModalSubtitle =
    document.getElementById(
        "billModalSubtitle"
    );

const printableBill =
    document.getElementById(
        "printableBill"
    );

const printBillButton =
    document.getElementById(
        "printBillButton"
    );

const modalMarkPaidButton =
    document.getElementById(
        "modalMarkPaidButton"
    );

// -------------------------------
// PAYMENT RECORD ELEMENTS
// -------------------------------

const paymentRecordsSection =
    document.getElementById(
        "paymentRecordsSection"
    );

const openPaymentRecordsLink =
    document.getElementById(
        "openPaymentRecordsLink"
    );

const paymentRecordsCount =
    document.getElementById(
        "paymentRecordsCount"
    );

const paymentSummaryCount =
    document.getElementById(
        "paymentSummaryCount"
    );

const paymentSummaryCurrency1 =
    document.getElementById(
        "paymentSummaryCurrency1"
    );

const paymentSummaryCurrency2 =
    document.getElementById(
        "paymentSummaryCurrency2"
    );

const paymentSummaryCurrency3 =
    document.getElementById(
        "paymentSummaryCurrency3"
    );

const paymentSummarySubtotal =
    document.getElementById(
        "paymentSummarySubtotal"
    );

const paymentSummaryVat =
    document.getElementById(
        "paymentSummaryVat"
    );

const paymentSummaryTotal =
    document.getElementById(
        "paymentSummaryTotal"
    );

const paymentRecordSearch =
    document.getElementById(
        "paymentRecordSearch"
    );

const paymentRecordDateFilter =
    document.getElementById(
        "paymentRecordDateFilter"
    );

const paymentRecordMethodFilter =
    document.getElementById(
        "paymentRecordMethodFilter"
    );

const paymentRecordsGrid =
    document.getElementById(
        "paymentRecordsGrid"
    );

const paymentRecordsEmpty =
    document.getElementById(
        "paymentRecordsEmpty"
    );

// -------------------------------
// ORDER HISTORY ELEMENTS
// -------------------------------

const orderSearch =
    document.getElementById(
        "orderSearch"
    );

const orderDateFilter =
    document.getElementById(
        "orderDateFilter"
    );

const orderStatusFilter =
    document.getElementById(
        "orderStatusFilter"
    );

const orderHistoryContainer =
    document.getElementById(
        "orderHistoryContainer"
    );

const orderHistoryCount =
    document.getElementById(
        "orderHistoryCount"
    );

const activeHistoryFilter =
    document.getElementById(
        "activeHistoryFilter"
    );

// -------------------------------
// ANALYTICS ELEMENTS
// -------------------------------

const analyticsFilterButtons =
    document.querySelectorAll(
        ".analytics-filter[data-period]"
    );

const startDateInput =
    document.getElementById(
        "analyticsStartDate"
    );

const endDateInput =
    document.getElementById(
        "analyticsEndDate"
    );

const toggleCustomDateButton =
    document.getElementById(
        "toggleCustomDate"
    );

const customDatePanel =
    document.getElementById(
        "customDatePanel"
    );

const clearCustomDateButton =
    document.getElementById(
        "clearCustomDate"
    );

const applyCustomDateButton =
    document.getElementById(
        "applyCustomDate"
    );

// -------------------------------
// STARTUP
// -------------------------------

function initializeAdminDashboard() {
    orderDateFilter.value = "today";
    orderStatusFilter.value = "all";

    paymentRecordDateFilter.value =
        "today";

    paymentRecordMethodFilter.value =
        "all";

    initRestaurantSettingsModule();
    initRestaurantFloorModule();
    initBillingModule();
    initPaymentRecordsModule();
    initAnalyticsModule();
    initOrderHistoryModule();
    initMenuManagementModule();

    loadRestaurantSettingsForm();
    applyRestaurantBranding();

    loadCategoryOptions();
    loadStats();
    renderMenuTable();
    renderOrderHistory();
    renderRestaurantFloor();
    renderBilling();
    renderPaymentRecords();
}

// -------------------------------
// CROSS-TAB DATA UPDATES
// -------------------------------

window.addEventListener(
    "storage",
    function (event) {
        if (
            event.key ===
            "tableTapSettings"
        ) {
            restaurantSettings = {
                ...defaultRestaurantSettings,
                ...(
                    JSON.parse(
                        event.newValue
                    ) || {}
                )
            };

            loadRestaurantSettingsForm();
            applyRestaurantBranding();
            renderBilling();
            renderPaymentRecords();
        }

        if (
            event.key ===
            "tableTapOrders"
        ) {
            orders =
                JSON.parse(
                    event.newValue
                ) || [];

            loadStats();
            renderOrderHistory();
            renderRestaurantFloor();
            renderBilling();
            renderPaymentRecords();
        }

        if (
            event.key ===
            "tableTapTables"
        ) {
            tables =
                JSON.parse(
                    event.newValue
                ) || [];

            renderRestaurantFloor();
        }

        if (
            event.key ===
            "tableTapMenu"
        ) {
            menuItems =
                JSON.parse(
                    event.newValue
                ) ||
                defaultMenuItems;

            menuItems =
                menuItems.map(
                    function (item) {
                        return {
                            ...item,
                            available:
                                item.available !==
                                false
                        };
                    }
                );

            loadCategoryOptions();
            loadStats();
            renderMenuTable();
        }
    }
);

initializeAdminDashboard();