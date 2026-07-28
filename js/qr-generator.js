// =====================================
// TABLETAP - QR GENERATOR
// =====================================

(function () {

    const TABLES_KEY = "tableTapTables";

    const qrTableGrid =
        document.getElementById("qrTableGrid");

    const qrTotalTables =
        document.getElementById("qrTotalTables");

    const qrGeneratedCount =
        document.getElementById("qrGeneratedCount");

    const generateAllQrButton =
        document.getElementById("generateAllQrButton");

    const qrModal =
        document.getElementById("qrModal");

    const qrModalOverlay =
        document.getElementById("qrModalOverlay");

    const closeQrModalButton =
        document.getElementById("closeQrModal");

    const qrCodeBox =
        document.getElementById("qrCodeBox");

    const qrRestaurantName =
        document.getElementById("qrRestaurantName");

    const qrTableName =
        document.getElementById("qrTableName");

    const qrTableCode =
        document.getElementById("qrTableCode");

    const qrMenuUrl =
        document.getElementById("qrMenuUrl");

    const downloadQrButton =
        document.getElementById("downloadQrButton");

    const printQrButton =
        document.getElementById("printQrButton");

    let activeQrTable = null;


    function getTables() {
        try {
            const savedTables =
                JSON.parse(
                    localStorage.getItem(TABLES_KEY)
                );

            return Array.isArray(savedTables)
                ? savedTables
                : [];
        } catch (error) {
            console.error(
                "Unable to load restaurant tables:",
                error
            );

            return [];
        }
    }


    function getRestaurantSettings() {
        try {
            return (
                JSON.parse(
                    localStorage.getItem(
                        "tableTapSettings"
                    )
                ) || {}
            );
        } catch (error) {
            console.error(
                "Unable to load restaurant settings:",
                error
            );

            return {};
        }
    }


    function buildTableMenuUrl(table) {
        const tableNumber =
            encodeURIComponent(
                table.number ||
                table.name ||
                table.id
            );

        return (
            window.location.origin +
            "/pages/menu.html?table=" +
            tableNumber
        );
    }


    function renderQrTables() {
        const tables = getTables();

        if (!qrTableGrid) {
            return;
        }

        qrTotalTables.textContent =
            String(tables.length);

        qrTableGrid.innerHTML = "";

        if (tables.length === 0) {
            qrTableGrid.innerHTML = `
                <div class="history-empty">
                    <h3>No tables found</h3>
                    <p>
                        Create tables in Restaurant Floor first.
                    </p>
                </div>
            `;

            return;
        }

        tables.forEach(function (table) {
            const card =
                document.createElement("article");

            card.className = "qr-table-card";

            card.innerHTML = `
                <div class="qr-table-card-header">
                    <div>
                        <small>
                            ${table.area || "Restaurant Table"}
                        </small>

                        <h3>
                            ${table.name || "Table " + table.number}
                        </h3>
                    </div>

                    <span class="qr-table-status">
                        ${
                            table.enabled === false
                                ? "Disabled"
                                : "Active"
                        }
                    </span>
                </div>

                <div class="qr-table-details">
                    <p>
                        <strong>Table Code:</strong>
                        ${table.number || table.id || "—"}
                    </p>

                    <p>
                        <strong>Capacity:</strong>
                        ${table.capacity || "—"}
                    </p>
                </div>

                <button
                    type="button"
                    class="primary-button qr-generate-button"
                    data-qr-table-id="${table.id}"
                    ${table.enabled === false ? "disabled" : ""}
                >
                    Generate QR
                </button>
            `;

            qrTableGrid.appendChild(card);
        });
    }


    function openQrModal(table) {
        if (!window.QRCode) {
            window.alert(
                "QR library did not load. Refresh the page and check your internet connection."
            );

            return;
        }

        if (!qrModal || !qrCodeBox) {
            console.error(
                "QR modal elements are missing from admin-v2.html."
            );

            return;
        }

        const settings =
            getRestaurantSettings();

        const restaurantName =
            settings.restaurantName ||
            "TableTap Restaurant";

        const menuUrl =
            buildTableMenuUrl(table);

        activeQrTable = table;

        qrRestaurantName.textContent =
            restaurantName;

        qrTableName.textContent =
            table.name ||
            "Table " + table.number;

        qrTableCode.textContent =
            "Table code: " +
            (
                table.number ||
                table.id ||
                "—"
            );

        qrMenuUrl.textContent =
            menuUrl;

        qrCodeBox.innerHTML = "";

        new QRCode(qrCodeBox, {
            text: menuUrl,
            width: 220,
            height: 220,
            correctLevel:
                QRCode.CorrectLevel.H
        });

        qrModal.classList.add("active");

        qrModal.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    function closeQrModal() {
        if (!qrModal) {
            return;
        }

        qrModal.classList.remove("active");

        qrModal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (qrCodeBox) {
            qrCodeBox.innerHTML = "";
        }

        activeQrTable = null;
    }


    function downloadQrCode() {
        if (!activeQrTable || !qrCodeBox) {
            return;
        }

        const canvas =
            qrCodeBox.querySelector("canvas");

        const image =
            qrCodeBox.querySelector("img");

        let imageUrl = "";

        if (canvas) {
            imageUrl =
                canvas.toDataURL("image/png");
        } else if (image) {
            imageUrl = image.src;
        }

        if (!imageUrl) {
            window.alert(
                "QR image is not ready yet."
            );

            return;
        }

        const safeTableName =
            String(
                activeQrTable.name ||
                activeQrTable.number ||
                "table"
            )
                .trim()
                .replace(/[^a-z0-9]+/gi, "-")
                .replace(/^-|-$/g, "")
                .toLowerCase();

        const link =
            document.createElement("a");

        link.href = imageUrl;

        link.download =
            "tabletap-" +
            safeTableName +
            "-qr.png";

        document.body.appendChild(link);
        link.click();
        link.remove();
    }


    function printQrCode() {
        if (!activeQrTable) {
            return;
        }

        const printCard =
            document.getElementById(
                "qrPrintCard"
            );

        if (!printCard) {
            return;
        }

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=700,height=800"
            );

        if (!printWindow) {
            window.alert(
                "Please allow popups to print the QR code."
            );

            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Table QR</title>

                <style>
                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 30px;
                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;
                        background: #ffffff;
                    }

                    .print-wrapper {
                        max-width: 440px;
                        margin: 0 auto;
                    }

                    .qr-print-card {
                        border: 2px solid #111827;
                        border-radius: 18px;
                        padding: 28px;
                        text-align: center;
                    }

                    .qr-print-brand {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 12px;
                        margin-bottom: 20px;
                    }

                    .qr-print-logo {
                        width: 48px;
                        height: 48px;
                        display: grid;
                        place-items: center;
                        border-radius: 12px;
                        background: #111827;
                        color: #ffffff;
                        font-weight: 800;
                    }

                    .qr-print-brand strong,
                    .qr-print-brand small {
                        display: block;
                    }

                    .qr-code-box {
                        display: grid;
                        place-items: center;
                        margin: 20px auto;
                    }

                    .qr-code-box canvas,
                    .qr-code-box img {
                        max-width: 240px;
                        height: auto;
                    }

                    .qr-table-information h3 {
                        margin: 8px 0;
                        font-size: 28px;
                    }

                    .qr-menu-url {
                        font-size: 10px;
                        overflow-wrap: anywhere;
                    }

                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>

            <body>
                <div class="print-wrapper">
                    ${printCard.outerHTML}
                </div>

                <script>
                    window.onload = function () {
                        window.print();
                    };
                <\/script>
            </body>
            </html>
        `);

        printWindow.document.close();
    }


    function handleQrTableClick(event) {
        const button =
            event.target.closest(
                "[data-qr-table-id]"
            );

        if (!button) {
            return;
        }

        const table =
            getTables().find(
                function (currentTable) {
                    return (
                        String(currentTable.id) ===
                        String(
                            button.dataset.qrTableId
                        )
                    );
                }
            );

        if (table) {
            openQrModal(table);
        }
    }


    function generateAllQrCodes() {
        const tables =
            getTables().filter(
                function (table) {
                    return table.enabled !== false;
                }
            );

        if (tables.length === 0) {
            window.alert(
                "No active restaurant tables found."
            );

            return;
        }

        qrGeneratedCount.textContent =
            String(tables.length);

        openQrModal(tables[0]);
    }


    if (qrTableGrid) {
        qrTableGrid.addEventListener(
            "click",
            handleQrTableClick
        );
    }

    if (generateAllQrButton) {
        generateAllQrButton.addEventListener(
            "click",
            generateAllQrCodes
        );
    }

    if (closeQrModalButton) {
        closeQrModalButton.addEventListener(
            "click",
            closeQrModal
        );
    }

    if (qrModalOverlay) {
        qrModalOverlay.addEventListener(
            "click",
            closeQrModal
        );
    }

    if (downloadQrButton) {
        downloadQrButton.addEventListener(
            "click",
            downloadQrCode
        );
    }

    if (printQrButton) {
        printQrButton.addEventListener(
            "click",
            printQrCode
        );
    }

    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Escape" &&
                qrModal &&
                qrModal.classList.contains(
                    "active"
                )
            ) {
                closeQrModal();
            }
        }
    );

    window.addEventListener(
        "storage",
        function (event) {
            if (event.key === TABLES_KEY) {
                renderQrTables();
            }
        }
    );

    renderQrTables();

})();