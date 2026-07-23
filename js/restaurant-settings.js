// =====================================
// TABLETAP - RESTAURANT SETTINGS MODULE
// =====================================

function loadRestaurantSettingsForm() {
    settingRestaurantName.value =
        restaurantSettings.restaurantName || "";

    settingBranchName.value =
        restaurantSettings.branchName || "";

    settingPhone.value =
        restaurantSettings.phone || "";

    settingWhatsApp.value =
        restaurantSettings.whatsapp || "";

    settingEmail.value =
        restaurantSettings.email || "";

    settingOpeningHours.value =
        restaurantSettings.openingHours || "";

    settingAddress.value =
        restaurantSettings.address || "";

    settingVatNumber.value =
        restaurantSettings.vatNumber || "";

    settingVatPercent.value =
        Number(
            restaurantSettings.vatPercent ?? 15
        );

    settingCurrency.value =
        restaurantSettings.currency || "SAR";

    settingLogoUrl.value =
        restaurantSettings.logoUrl || "";

    settingReceiptFooter.value =
        restaurantSettings.receiptFooter || "";
}

function applyRestaurantBranding() {
    const name =
        restaurantSettings.restaurantName ||
        defaultRestaurantSettings.restaurantName;

    adminPageHeader.textContent =
        `⚙️ ${name} Admin`;

    document.title =
        `${name} Admin Panel`;
}

function saveRestaurantSettings() {
    const restaurantName =
        settingRestaurantName.value.trim();

    const vatPercent =
        Number(settingVatPercent.value);

    if (!restaurantName) {
        alert(
            "Please enter the restaurant name."
        );

        settingRestaurantName.focus();
        return;
    }

    if (
        Number.isNaN(vatPercent) ||
        vatPercent < 0 ||
        vatPercent > 100
    ) {
        alert(
            "Please enter a valid VAT percentage between 0 and 100."
        );

        settingVatPercent.focus();
        return;
    }

    restaurantSettings = {
        restaurantName: restaurantName,
        branchName:
            settingBranchName.value.trim(),
        phone:
            settingPhone.value.trim(),
        whatsapp:
            settingWhatsApp.value.trim(),
        email:
            settingEmail.value.trim(),
        openingHours:
            settingOpeningHours.value.trim(),
        address:
            settingAddress.value.trim(),
        vatNumber:
            settingVatNumber.value.trim(),
        vatPercent: vatPercent,
        currency:
            settingCurrency.value,
        logoUrl:
            settingLogoUrl.value.trim(),
        receiptFooter:
            settingReceiptFooter.value.trim()
    };

    localStorage.setItem(
        "tableTapSettings",
        JSON.stringify(restaurantSettings)
    );

    applyRestaurantBranding();

    settingsSavedMessage.textContent =
        "Settings saved successfully.";

    window.setTimeout(function () {
        settingsSavedMessage.textContent = "";
    }, 3000);
}

function initRestaurantSettingsModule() {
    openRestaurantSettingsLink.addEventListener(
        "click",
        function () {
            restaurantSettingsSection.open = true;
        }
    );

    saveRestaurantSettingsButton.addEventListener(
        "click",
        saveRestaurantSettings
    );
}