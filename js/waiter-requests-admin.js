// =====================================
// TABLETAP - ADMIN SERVICE REQUESTS
// =====================================

let adminServiceRequests = [];

function getStoredServiceRequests() {
    const savedRequests = JSON.parse(
        localStorage.getItem("tableTapServiceRequests")
    );

    return Array.isArray(savedRequests)
        ? savedRequests
        : [];
}

function saveAdminServiceRequests() {
    localStorage.setItem(
        "tableTapServiceRequests",
        JSON.stringify(adminServiceRequests)
    );
}

function escapeServiceRequestHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getServiceRequestDate(request) {
    if (!request.createdAt) {
        return null;
    }

    const requestDate = new Date(request.createdAt);

    return Number.isNaN(requestDate.getTime())
        ? null
        : requestDate;
}

function getServiceRequestMinutes(request) {
    const createdDate = getServiceRequestDate(request);

    if (!createdDate) {
        return 0;
    }

    const endDate =
        request.status === "Completed" &&
        request.completedAt
            ? new Date(request.completedAt)
            : new Date();

    return Math.max(
        0,
        Math.floor(
            (
                endDate.getTime() -
                createdDate.getTime()
            ) / 60000
        )
    );
}

function getServiceRequestIcon(type) {
    const icons = {
        Waiter: "👨‍🍳",
        Water: "💧",
        Bill: "💳",
        Cleaning: "🧹",
        Other: "✍️"
    };

    return icons[type] || "🔔";
}

function getServiceRequestLabel(type) {
    const labels = {
        Waiter: "Call Waiter",
        Water: "Water",
        Bill: "Request Bill",
        Cleaning: "Clean Table",
        Other: "Other Help"
    };

    return labels[type] || type || "Assistance";
}

function getServiceRequestStatus(request) {
    return request.status || "New";
}

function getFilteredAdminServiceRequests() {
    const searchInput =
        document.getElementById(
            "serviceRequestSearch"
        );

    const statusFilter =
        document.getElementById(
            "serviceRequestStatusFilter"
        );

    const typeFilter =
        document.getElementById(
            "serviceRequestTypeFilter"
        );

    const sortSelect =
        document.getElementById(
            "serviceRequestSort"
        );

    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";

    const selectedType =
        typeFilter
            ? typeFilter.value
            : "all";

    const selectedSort =
        sortSelect
            ? sortSelect.value
            : "oldest";

    const filteredRequests =
        adminServiceRequests.filter(
            function (request) {
                const searchableText = [
                    request.id,
                    request.type,
                    request.table,
                    request.customerName,
                    request.phone,
                    request.notes
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    !searchText ||
                    searchableText.includes(
                        searchText
                    );

                const matchesStatus =
                    selectedStatus === "all" ||
                    getServiceRequestStatus(
                        request
                    ) === selectedStatus;

                const matchesType =
                    selectedType === "all" ||
                    request.type === selectedType;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType
                );
            }
        );

    filteredRequests.sort(
        function (first, second) {
            const firstTime =
                getServiceRequestDate(
                    first
                )?.getTime() || 0;

            const secondTime =
                getServiceRequestDate(
                    second
                )?.getTime() || 0;

            if (selectedSort === "newest") {
                return secondTime - firstTime;
            }

            if (selectedSort === "urgent") {
                return (
                    getServiceRequestMinutes(
                        second
                    ) -
                    getServiceRequestMinutes(
                        first
                    )
                );
            }

            return firstTime - secondTime;
        }
    );

    return filteredRequests;
}

function buildServiceRequestCard(request) {
    const status =
        getServiceRequestStatus(request);

    const minutes =
        getServiceRequestMinutes(request);

    const requestDate =
        getServiceRequestDate(request);

    const card =
        document.createElement("article");

    card.className =
        `service-request-card service-request-card-${status.toLowerCase()}`;

    card.innerHTML = `
        <div class="service-request-card-header">
            <div class="service-request-type">
                <span>
                    ${getServiceRequestIcon(request.type)}
                </span>

                <div>
                    <small>Request</small>

                    <h3>
                        ${escapeServiceRequestHtml(
                            getServiceRequestLabel(
                                request.type
                            )
                        )}
                    </h3>
                </div>
            </div>

            <span class="service-request-wait-time">
                ${minutes} min
            </span>
        </div>

        <div class="service-request-table">
            <small>Table</small>

            <strong>
                ${escapeServiceRequestHtml(
                    request.table || "Unknown"
                )}
            </strong>
        </div>

        <div class="service-request-customer">
            <div>
                <small>Customer</small>

                <strong>
                    ${escapeServiceRequestHtml(
                        request.customerName ||
                        "Guest"
                    )}
                </strong>
            </div>

            <div>
                <small>Phone</small>

                <strong>
                    ${escapeServiceRequestHtml(
                        request.phone ||
                        "Not provided"
                    )}
                </strong>
            </div>
        </div>

        ${
            request.notes
                ? `
                    <div class="service-request-note">
                        <small>Extra details</small>

                        <p>
                            ${escapeServiceRequestHtml(
                                request.notes
                            )}
                        </p>
                    </div>
                `
                : ""
        }

        <div class="service-request-card-footer">
            <small>
                Received:
                ${
                    requestDate
                        ? requestDate.toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )
                        : "Unknown"
                }
            </small>

            <div class="service-request-actions">
                ${
                    status === "New"
                        ? `
                            <button
                                class="service-request-accept"
                                type="button"
                                onclick="acceptServiceRequest(
                                    '${escapeServiceRequestHtml(
                                        request.id
                                    )}'
                                )"
                            >
                                Accept
                            </button>

                            <button
                                class="service-request-cancel"
                                type="button"
                                onclick="cancelServiceRequest(
                                    '${escapeServiceRequestHtml(
                                        request.id
                                    )}'
                                )"
                            >
                                Cancel
                            </button>
                        `
                        : ""
                }

                ${
                    status === "Accepted"
                        ? `
                            <button
                                class="service-request-complete"
                                type="button"
                                onclick="completeServiceRequest(
                                    '${escapeServiceRequestHtml(
                                        request.id
                                    )}'
                                )"
                            >
                                Complete
                            </button>

                            <button
                                class="service-request-cancel"
                                type="button"
                                onclick="cancelServiceRequest(
                                    '${escapeServiceRequestHtml(
                                        request.id
                                    )}'
                                )"
                            >
                                Cancel
                            </button>
                        `
                        : ""
                }

                ${
                    status === "Completed"
                        ? `
                            <span class="service-request-finished">
                                ✓ Completed
                            </span>
                        `
                        : ""
                }

                ${
                    status === "Cancelled"
                        ? `
                            <span class="service-request-cancelled">
                                Cancelled
                            </span>
                        `
                        : ""
                }
            </div>
        </div>
    `;

    return card;
}

function renderServiceRequestColumn(
    containerId,
    requests
) {
    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (requests.length === 0) {
        container.innerHTML = `
            <div class="service-request-column-empty">
                <span>✓</span>

                <strong>
                    No requests
                </strong>

                <small>
                    This queue is clear.
                </small>
            </div>
        `;

        return;
    }

    requests.forEach(function (request) {
        container.appendChild(
            buildServiceRequestCard(
                request
            )
        );
    });
}

function updateServiceRequestSummary(
    visibleRequests
) {
    const allNewRequests =
        adminServiceRequests.filter(
            function (request) {
                return (
                    getServiceRequestStatus(
                        request
                    ) === "New"
                );
            }
        );

    const allAcceptedRequests =
        adminServiceRequests.filter(
            function (request) {
                return (
                    getServiceRequestStatus(
                        request
                    ) === "Accepted"
                );
            }
        );

    const today =
        new Date().toDateString();

    const completedToday =
        adminServiceRequests.filter(
            function (request) {
                if (
                    getServiceRequestStatus(
                        request
                    ) !== "Completed" ||
                    !request.completedAt
                ) {
                    return false;
                }

                return (
                    new Date(
                        request.completedAt
                    ).toDateString() === today
                );
            }
        );

    const acceptedWithTime =
        adminServiceRequests.filter(
            function (request) {
                return (
                    request.acceptedAt &&
                    request.createdAt
                );
            }
        );

    const averageResponse =
        acceptedWithTime.length > 0
            ? Math.round(
                acceptedWithTime.reduce(
                    function (
                        total,
                        request
                    ) {
                        const accepted =
                            new Date(
                                request.acceptedAt
                            );

                        const created =
                            new Date(
                                request.createdAt
                            );

                        return (
                            total +
                            Math.max(
                                0,
                                (
                                    accepted.getTime() -
                                    created.getTime()
                                ) / 60000
                            )
                        );
                    },
                    0
                ) /
                acceptedWithTime.length
            )
            : 0;

    const values = {
        serviceRequestsNewCount:
            allNewRequests.length,

        serviceRequestsAcceptedCount:
            allAcceptedRequests.length,

        serviceRequestsCompletedCount:
            completedToday.length,

        serviceRequestsAverageTime:
            `${averageResponse} min`,

        serviceRequestNavCount:
            allNewRequests.length,

        serviceRequestVisibleCount:
            `${visibleRequests.length} request${
                visibleRequests.length === 1
                    ? ""
                    : "s"
            }`
    };

    Object.entries(values).forEach(
        function ([id, value]) {
            const element =
                document.getElementById(id);

            if (element) {
                element.textContent =
                    String(value);
            }
        }
    );
}

function renderAdminServiceRequests() {
    const filteredRequests =
        getFilteredAdminServiceRequests();

    const newRequests =
        filteredRequests.filter(
            function (request) {
                return (
                    getServiceRequestStatus(
                        request
                    ) === "New"
                );
            }
        );

    const acceptedRequests =
        filteredRequests.filter(
            function (request) {
                return (
                    getServiceRequestStatus(
                        request
                    ) === "Accepted"
                );
            }
        );

    const completedRequests =
        filteredRequests
            .filter(
                function (request) {
                    return (
                        getServiceRequestStatus(
                            request
                        ) === "Completed"
                    );
                }
            )
            .slice()
            .reverse()
            .slice(0, 20);

    renderServiceRequestColumn(
        "serviceRequestNewList",
        newRequests
    );

    renderServiceRequestColumn(
        "serviceRequestAcceptedList",
        acceptedRequests
    );

    renderServiceRequestColumn(
        "serviceRequestCompletedList",
        completedRequests
    );

    const columnCounts = {
        serviceRequestNewColumnCount:
            newRequests.length,

        serviceRequestAcceptedColumnCount:
            acceptedRequests.length,

        serviceRequestCompletedColumnCount:
            completedRequests.length
    };

    Object.entries(columnCounts).forEach(
        function ([id, value]) {
            const element =
                document.getElementById(id);

            if (element) {
                element.textContent =
                    String(value);
            }
        }
    );

    updateServiceRequestSummary(
        filteredRequests
    );

    const emptyState =
        document.getElementById(
            "serviceRequestsEmpty"
        );

    const board =
        document.getElementById(
            "serviceRequestBoard"
        );

    if (emptyState && board) {
        const isEmpty =
            filteredRequests.length === 0;

        emptyState.hidden = !isEmpty;
        board.hidden = isEmpty;
    }
}

function updateServiceRequest(
    requestId,
    updates
) {
    const request =
        adminServiceRequests.find(
            function (currentRequest) {
                return (
                    String(
                        currentRequest.id
                    ) ===
                    String(requestId)
                );
            }
        );

    if (!request) {
        return;
    }

    Object.assign(
        request,
        updates,
        {
            updatedAt:
                new Date().toISOString()
        }
    );

    saveAdminServiceRequests();
    renderAdminServiceRequests();
}

function acceptServiceRequest(
    requestId
) {
    const staffName =
        window.prompt(
            "Enter staff or waiter name:",
            "Available Staff"
        );

    if (staffName === null) {
        return;
    }

    updateServiceRequest(
        requestId,
        {
            status: "Accepted",
            assignedTo:
                staffName.trim() ||
                "Available Staff",
            acceptedAt:
                new Date().toISOString()
        }
    );
}

function completeServiceRequest(
    requestId
) {
    updateServiceRequest(
        requestId,
        {
            status: "Completed",
            completedAt:
                new Date().toISOString()
        }
    );
}

function cancelServiceRequest(
    requestId
) {
    const confirmed =
        window.confirm(
            "Cancel this service request?"
        );

    if (!confirmed) {
        return;
    }

    updateServiceRequest(
        requestId,
        {
            status: "Cancelled",
            cancelledAt:
                new Date().toISOString()
        }
    );
}

function initAdminServiceRequests() {
    adminServiceRequests =
        getStoredServiceRequests();

    const search =
        document.getElementById(
            "serviceRequestSearch"
        );

    const status =
        document.getElementById(
            "serviceRequestStatusFilter"
        );

    const type =
        document.getElementById(
            "serviceRequestTypeFilter"
        );

    const sort =
        document.getElementById(
            "serviceRequestSort"
        );

    search?.addEventListener(
        "input",
        renderAdminServiceRequests
    );

    status?.addEventListener(
        "change",
        renderAdminServiceRequests
    );

    type?.addEventListener(
        "change",
        renderAdminServiceRequests
    );

    sort?.addEventListener(
        "change",
        renderAdminServiceRequests
    );

    window.addEventListener(
        "storage",
        function (event) {
            if (
                event.key !==
                "tableTapServiceRequests"
            ) {
                return;
            }

            adminServiceRequests =
                JSON.parse(
                    event.newValue
                ) || [];

            renderAdminServiceRequests();
        }
    );

    renderAdminServiceRequests();
}

window.acceptServiceRequest =
    acceptServiceRequest;

window.completeServiceRequest =
    completeServiceRequest;

window.cancelServiceRequest =
    cancelServiceRequest;

document.addEventListener(
    "DOMContentLoaded",
    initAdminServiceRequests
);