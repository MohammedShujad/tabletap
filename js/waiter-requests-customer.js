// =====================================
// TABLETAP - CUSTOMER SERVICE REQUESTS
// =====================================

const callWaiterButton =
    document.getElementById("callWaiterButton");

const serviceRequestOverlay =
    document.getElementById("serviceRequestOverlay");

const serviceRequestModal =
    document.getElementById("serviceRequestModal");

const closeServiceRequestButton =
    document.getElementById("closeServiceRequest");

const serviceRequestNotes =
    document.getElementById("serviceRequestNotes");

const serviceRequestMessage =
    document.getElementById("serviceRequestMessage");

const serviceRequestOptions =
    document.querySelectorAll(
        ".service-request-option"
    );

function getCustomerServiceDetails() {
    return (
        JSON.parse(
            localStorage.getItem("tableTapCustomer")
        ) || {}
    );
}

function getServiceRequests() {
    return (
        JSON.parse(
            localStorage.getItem("tableTapServiceRequests")
        ) || []
    );
}

function saveServiceRequests(requests) {
    localStorage.setItem(
        "tableTapServiceRequests",
        JSON.stringify(requests)
    );
}

function openServiceRequestModal() {
    serviceRequestModal.classList.add("show");
    serviceRequestOverlay.classList.add("show");

    serviceRequestModal.setAttribute(
        "aria-hidden",
        "false"
    );

    serviceRequestMessage.textContent = "";
}

function closeServiceRequestModal() {
    serviceRequestModal.classList.remove("show");
    serviceRequestOverlay.classList.remove("show");

    serviceRequestModal.setAttribute(
        "aria-hidden",
        "true"
    );

    serviceRequestNotes.value = "";
}

function createServiceRequest(type) {
    const customer =
        getCustomerServiceDetails();

    if (!customer.table) {
        serviceRequestMessage.textContent =
            "Please enter your table details before requesting assistance.";

        return;
    }

    const requests =
        getServiceRequests();

    const newRequest = {
        id: `SR${Date.now()}`,
        type: type,
        notes:
            serviceRequestNotes.value.trim(),
        table:
            customer.table,
        customerName:
            customer.name || "Guest",
        phone:
            customer.phone || "",
        status: "New",
        assignedTo: "",
        createdAt:
            new Date().toISOString(),
        acceptedAt: null,
        completedAt: null
    };

    requests.push(newRequest);

    saveServiceRequests(requests);

    serviceRequestMessage.textContent =
        `${type} request sent successfully.`;

    window.setTimeout(function () {
        closeServiceRequestModal();
    }, 1200);
}

callWaiterButton.addEventListener(
    "click",
    openServiceRequestModal
);

closeServiceRequestButton.addEventListener(
    "click",
    closeServiceRequestModal
);

serviceRequestOverlay.addEventListener(
    "click",
    closeServiceRequestModal
);

serviceRequestOptions.forEach(
    function (button) {
        button.addEventListener(
            "click",
            function () {
                createServiceRequest(
                    button.dataset.requestType
                );
            }
        );
    }
);