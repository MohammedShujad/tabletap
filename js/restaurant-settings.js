// =====================================
// TABLETAP - RESTAURANT SETTINGS MODULE V2
// =====================================

function getSettingsElement(id) {
    return document.getElementById(id);
}

function getRestaurantSettingsDefaults() {
    return {
        ...defaultRestaurantSettings,
        receiptPaper: "80mm",
        defaultOrderType: "Dine In",
        kitchenWarningMinutes: 5,
        kitchenUrgentMinutes: 15,
        completedOrderLimit: 8,
        kitchenSoundEnabled: true,
        autoOpenOrders: true,
        customerWelcomeMessage:
            "Welcome! Browse our menu and order from your table.",
        allowCustomerNotes: true,
        allowWaiterRequests: true,
        showUnavailableItems: true,
        showMenuImages: true
    };
}

function setSettingsValue(id, value) {
    const element = getSettingsElement(id);

    if (!element) {
        return;
    }

    if (element.type === "checkbox") {
        element.checked = Boolean(value);
        return;
    }

    element.value = value ?? "";
}

function loadRestaurantSettingsForm() {
    const settings = {
        ...getRestaurantSettingsDefaults(),
        ...restaurantSettings
    };

    setSettingsValue(
        "settingRestaurantName",
        settings.restaurantName
    );

    setSettingsValue(
        "settingBranchName",
        settings.branchName
    );

    setSettingsValue(
        "settingPhone",
        settings.phone
    );

    setSettingsValue(
        "settingWhatsApp",
        settings.whatsapp
    );

    setSettingsValue(
        "settingEmail",
        settings.email
    );

    setSettingsValue(
        "settingOpeningHours",
        settings.openingHours
    );

    setSettingsValue(
        "settingAddress",
        settings.address
    );

    setSettingsValue(
        "settingVatNumber",
        settings.vatNumber
    );

    setSettingsValue(
        "settingVatPercent",
        Number(settings.vatPercent ?? 15)
    );

    setSettingsValue(
        "settingCurrency",
        settings.currency || "SAR"
    );

    setSettingsValue(
        "settingLogoUrl",
        settings.logoUrl
    );

    setSettingsValue(
        "settingReceiptFooter",
        settings.receiptFooter
    );

    setSettingsValue(
        "settingReceiptPaper",
        settings.receiptPaper
    );

    setSettingsValue(
        "settingDefaultOrderType",
        settings.defaultOrderType
    );

    setSettingsValue(
        "settingKitchenWarningMinutes",
        settings.kitchenWarningMinutes
    );

    setSettingsValue(
        "settingKitchenUrgentMinutes",
        settings.kitchenUrgentMinutes
    );

    setSettingsValue(
        "settingCompletedOrderLimit",
        settings.completedOrderLimit
    );

    setSettingsValue(
        "settingKitchenSoundEnabled",
        settings.kitchenSoundEnabled
    );

    setSettingsValue(
        "settingAutoOpenOrders",
        settings.autoOpenOrders
    );

    setSettingsValue(
        "settingCustomerWelcomeMessage",
        settings.customerWelcomeMessage
    );

    setSettingsValue(
        "settingAllowCustomerNotes",
        settings.allowCustomerNotes
    );

    setSettingsValue(
        "settingAllowWaiterRequests",
        settings.allowWaiterRequests
    );

    setSettingsValue(
        "settingShowUnavailableItems",
        settings.showUnavailableItems
    );

    setSettingsValue(
        "settingShowMenuImages",
        settings.showMenuImages
    );

    updateRestaurantSettingsPreview();
}

function getSettingsFieldValue(id) {
    const element = getSettingsElement(id);

    if (!element) {
        return "";
    }

    if (element.type === "checkbox") {
        return element.checked;
    }

    return element.value.trim();
}

function updateRestaurantSettingsPreview() {
    const restaurantName =
        getSettingsFieldValue("settingRestaurantName") ||
        "Restaurant Name";

    const branchName =
        getSettingsFieldValue("settingBranchName") ||
        "Main Branch";

    const phone =
        getSettingsFieldValue("settingPhone") ||
        "Phone not added";

    const email =
        getSettingsFieldValue("settingEmail") ||
        "Email not added";

    const hours =
        getSettingsFieldValue("settingOpeningHours") ||
        "Hours not added";

    const logoUrl =
        getSettingsFieldValue("settingLogoUrl");

    const vat =
        getSettingsFieldValue("settingVatPercent") ||
        "0";

    const currency =
        getSettingsFieldValue("settingCurrency") ||
        "SAR";

    const footer =
        getSettingsFieldValue("settingReceiptFooter") ||
        "Thank you. Please visit again.";

    const previewValues = {
        settingsRestaurantPreview: restaurantName,
        settingsBranchPreview: branchName,
        settingsPhonePreview: phone,
        settingsEmailPreview: email,
        settingsHoursPreview: hours,
        settingsReceiptRestaurant: restaurantName,
        settingsReceiptBranch: branchName,
        settingsVatPreview: `${vat}%`,
        settingsCurrencyPreview: currency,
        settingsReceiptFooterPreview: footer
    };

    Object.entries(previewValues).forEach(
        function ([id, value]) {
            const element = getSettingsElement(id);

            if (element) {
                element.textContent = value;
            }
        }
    );

    const logoPreview =
        getSettingsElement("settingsLogoPreview");

    if (logoPreview) {
        if (logoUrl) {
            logoPreview.innerHTML = `
                <img
                    src="${escapeSettingsHtml(logoUrl)}"
                    alt="${escapeSettingsHtml(restaurantName)}"
                >
            `;
        } else {
            logoPreview.textContent = "TT";
        }
    }
}

function escapeSettingsHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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

function showSettingsMessage(message, type) {
    const messageElement =
        getSettingsElement("settingsSavedMessage");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.className =
        `settings-message ${type || "success"}`;

    window.clearTimeout(showSettingsMessage.timeout);

    showSettingsMessage.timeout =
        window.setTimeout(function () {
            messageElement.textContent = "";
            messageElement.className =
                "settings-message";
        }, 3200);
}

function saveRestaurantSettings() {
    const restaurantName =
        getSettingsFieldValue("settingRestaurantName");

    const vatPercent =
        Number(
            getSettingsFieldValue("settingVatPercent")
        );

    const warningMinutes =
        Number(
            getSettingsFieldValue(
                "settingKitchenWarningMinutes"
            )
        );

    const urgentMinutes =
        Number(
            getSettingsFieldValue(
                "settingKitchenUrgentMinutes"
            )
        );

    const completedOrderLimit =
        Number(
            getSettingsFieldValue(
                "settingCompletedOrderLimit"
            )
        );

    if (!restaurantName) {
        alert("Please enter the restaurant name.");
        getSettingsElement(
            "settingRestaurantName"
        )?.focus();
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
        getSettingsElement(
            "settingVatPercent"
        )?.focus();
        return;
    }

    if (
        !Number.isFinite(warningMinutes) ||
        warningMinutes < 1
    ) {
        alert(
            "Kitchen warning time must be at least 1 minute."
        );
        return;
    }

    if (
        !Number.isFinite(urgentMinutes) ||
        urgentMinutes <= warningMinutes
    ) {
        alert(
            "Kitchen urgent time must be higher than the warning time."
        );
        return;
    }

    if (
        !Number.isFinite(completedOrderLimit) ||
        completedOrderLimit < 1 ||
        completedOrderLimit > 50
    ) {
        alert(
            "Completed order limit must be between 1 and 50."
        );
        return;
    }

    restaurantSettings = {
        restaurantName,
        branchName:
            getSettingsFieldValue("settingBranchName"),
        phone:
            getSettingsFieldValue("settingPhone"),
        whatsapp:
            getSettingsFieldValue("settingWhatsApp"),
        email:
            getSettingsFieldValue("settingEmail"),
        openingHours:
            getSettingsFieldValue("settingOpeningHours"),
        address:
            getSettingsFieldValue("settingAddress"),
        vatNumber:
            getSettingsFieldValue("settingVatNumber"),
        vatPercent,
        currency:
            getSettingsFieldValue("settingCurrency"),
        logoUrl:
            getSettingsFieldValue("settingLogoUrl"),
        receiptFooter:
            getSettingsFieldValue("settingReceiptFooter"),
        receiptPaper:
            getSettingsFieldValue("settingReceiptPaper"),
        defaultOrderType:
            getSettingsFieldValue(
                "settingDefaultOrderType"
            ),
        kitchenWarningMinutes: warningMinutes,
        kitchenUrgentMinutes: urgentMinutes,
        completedOrderLimit,
        kitchenSoundEnabled:
            getSettingsFieldValue(
                "settingKitchenSoundEnabled"
            ),
        autoOpenOrders:
            getSettingsFieldValue(
                "settingAutoOpenOrders"
            ),
        customerWelcomeMessage:
            getSettingsFieldValue(
                "settingCustomerWelcomeMessage"
            ),
        allowCustomerNotes:
            getSettingsFieldValue(
                "settingAllowCustomerNotes"
            ),
        allowWaiterRequests:
            getSettingsFieldValue(
                "settingAllowWaiterRequests"
            ),
        showUnavailableItems:
            getSettingsFieldValue(
                "settingShowUnavailableItems"
            ),
        showMenuImages:
            getSettingsFieldValue(
                "settingShowMenuImages"
            )
    };

    localStorage.setItem(
        "tableTapSettings",
        JSON.stringify(restaurantSettings)
    );

    applyRestaurantBranding();
    updateRestaurantSettingsPreview();

    if (typeof loadStats === "function") {
        loadStats();
    }

    if (typeof renderBilling === "function") {
        renderBilling();
    }

    showSettingsMessage(
        "Settings saved successfully.",
        "success"
    );
}

function activateSettingsTab(tabName) {
    document
        .querySelectorAll("[data-settings-tab]")
        .forEach(function (button) {
            button.classList.toggle(
                "active",
                button.dataset.settingsTab === tabName
            );
        });

    document
        .querySelectorAll("[data-settings-panel]")
        .forEach(function (panel) {
            const isActive =
                panel.dataset.settingsPanel === tabName;

            panel.classList.toggle(
                "active",
                isActive
            );

            panel.hidden = !isActive;
        });
}

function exportTableTapData() {
    const exportData = {
        exportedAt: new Date().toISOString(),
        version: 1,
        settings:
            JSON.parse(
                localStorage.getItem("tableTapSettings")
            ) || {},
        orders:
            JSON.parse(
                localStorage.getItem("tableTapOrders")
            ) || [],
        menu:
            JSON.parse(
                localStorage.getItem("tableTapMenu")
            ) || [],
        tables:
            JSON.parse(
                localStorage.getItem("tableTapTables")
            ) || []
    };

    const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
        `tabletap-backup-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showSettingsMessage(
        "Backup exported successfully.",
        "success"
    );
}

function importTableTapData(file) {
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        try {
            const data = JSON.parse(reader.result);

            if (data.settings) {
                localStorage.setItem(
                    "tableTapSettings",
                    JSON.stringify(data.settings)
                );
            }

            if (Array.isArray(data.orders)) {
                localStorage.setItem(
                    "tableTapOrders",
                    JSON.stringify(data.orders)
                );
            }

            if (Array.isArray(data.menu)) {
                localStorage.setItem(
                    "tableTapMenu",
                    JSON.stringify(data.menu)
                );
            }

            if (Array.isArray(data.tables)) {
                localStorage.setItem(
                    "tableTapTables",
                    JSON.stringify(data.tables)
                );
            }

            alert(
                "Backup imported successfully. The page will now reload."
            );

            window.location.reload();
        } catch (error) {
            alert(
                "This backup file is invalid or damaged."
            );
        }
    };

    reader.readAsText(file);
}

function clearTableTapDemoData() {
    const confirmed = confirm(
        "Clear all orders and payment history? Restaurant settings, menu and tables will be kept."
    );

    if (!confirmed) {
        return;
    }

    localStorage.setItem(
        "tableTapOrders",
        JSON.stringify([])
    );

    localStorage.removeItem(
        "tableTapLatestOrder"
    );

    alert(
        "Demo orders cleared. The page will now reload."
    );

    window.location.reload();
}

function restoreDefaultRestaurantSettings() {
    const confirmed = confirm(
        "Restore all restaurant settings to their default values?"
    );

    if (!confirmed) {
        return;
    }

    restaurantSettings =
        getRestaurantSettingsDefaults();

    localStorage.setItem(
        "tableTapSettings",
        JSON.stringify(restaurantSettings)
    );

    loadRestaurantSettingsForm();
    applyRestaurantBranding();

    showSettingsMessage(
        "Default settings restored.",
        "success"
    );
}

function initRestaurantSettingsModule() {
    if (openRestaurantSettingsLink) {
        openRestaurantSettingsLink.addEventListener(
            "click",
            function () {
                restaurantSettingsSection.open = true;
            }
        );
    }

    saveRestaurantSettingsButton.addEventListener(
        "click",
        saveRestaurantSettings
    );

    document
        .querySelectorAll("[data-settings-tab]")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    activateSettingsTab(
                        button.dataset.settingsTab
                    );
                }
            );
        });

    [
        "settingRestaurantName",
        "settingBranchName",
        "settingPhone",
        "settingEmail",
        "settingOpeningHours",
        "settingLogoUrl",
        "settingVatPercent",
        "settingCurrency",
        "settingReceiptFooter"
    ].forEach(function (id) {
        getSettingsElement(id)?.addEventListener(
            "input",
            updateRestaurantSettingsPreview
        );

        getSettingsElement(id)?.addEventListener(
            "change",
            updateRestaurantSettingsPreview
        );
    });

    getSettingsElement(
        "exportTableTapData"
    )?.addEventListener(
        "click",
        exportTableTapData
    );

    getSettingsElement(
        "importTableTapDataButton"
    )?.addEventListener(
        "click",
        function () {
            getSettingsElement(
                "importTableTapDataFile"
            )?.click();
        }
    );

    getSettingsElement(
        "importTableTapDataFile"
    )?.addEventListener(
        "change",
        function (event) {
            importTableTapData(
                event.target.files?.[0]
            );

            event.target.value = "";
        }
    );

    getSettingsElement(
        "clearTableTapDemoData"
    )?.addEventListener(
        "click",
        clearTableTapDemoData
    );

    getSettingsElement(
        "restoreDefaultRestaurantSettings"
    )?.addEventListener(
        "click",
        restoreDefaultRestaurantSettings
    );

    activateSettingsTab("profile");
    updateRestaurantSettingsPreview();
}