// =====================================
// TABLETAP - STAFF MANAGEMENT
// =====================================

(function () {

    const STAFF_KEY = "tableTapStaff";

    const staffModal =
        document.getElementById("staffModal");

    const addStaffButton =
        document.getElementById("addStaffButton");

    const closeStaffModalButton =
        document.getElementById("closeStaffModal");

    const staffModalOverlay =
        document.getElementById("staffModalOverlay");

    const cancelStaffButton =
        document.getElementById("cancelStaffButton");

    const staffForm =
        document.getElementById("staffForm");

    const staffEditingId =
        document.getElementById("staffEditingId");

    const staffName =
        document.getElementById("staffName");

    const staffPhone =
        document.getElementById("staffPhone");

    const staffUsername =
        document.getElementById("staffUsername");

    const staffPassword =
        document.getElementById("staffPassword");

    const staffRole =
        document.getElementById("staffRole");

    const staffActive =
        document.getElementById("staffActive");

    const staffFormMessage =
        document.getElementById("staffFormMessage");

    const staffTableBody =
        document.getElementById("staffTableBody");

    const staffSearch =
        document.getElementById("staffSearch");

    const staffRoleFilter =
        document.getElementById("staffRoleFilter");

    const staffTotalCount =
        document.getElementById("staffTotalCount");

    const staffActiveCount =
        document.getElementById("staffActiveCount");

    const staffManagerCount =
        document.getElementById("staffManagerCount");

    const staffKitchenCount =
        document.getElementById("staffKitchenCount");


    function getStaff() {
        try {
            const savedStaff =
                JSON.parse(
                    localStorage.getItem(STAFF_KEY)
                );

            return Array.isArray(savedStaff)
                ? savedStaff
                : [];
        } catch (error) {
            console.error(
                "Unable to read staff:",
                error
            );

            return [];
        }
    }


    function saveStaff(staff) {
        localStorage.setItem(
            STAFF_KEY,
            JSON.stringify(staff)
        );
    }


    function openStaffModal(staffMember = null) {
        if (!staffModal) {
            return;
        }

        staffForm.reset();
        staffFormMessage.textContent = "";
        staffEditingId.value = "";
        staffActive.checked = true;

        if (staffMember) {
            staffEditingId.value =
                staffMember.id;

            staffName.value =
                staffMember.name || "";

            staffPhone.value =
                staffMember.phone || "";

            staffUsername.value =
                staffMember.username || "";

            staffPassword.value =
                staffMember.password || "";

            staffRole.value =
                staffMember.role || "";

            staffActive.checked =
                staffMember.active !== false;

            document.getElementById(
                "staffModalTitle"
            ).textContent = "Edit Staff";
        } else {
            document.getElementById(
                "staffModalTitle"
            ).textContent = "Add Staff";
        }

        staffModal.setAttribute(
            "aria-hidden",
            "false"
        );

        staffModal.classList.add("active");
    }


    function closeStaffModal() {
        if (!staffModal) {
            return;
        }

        staffModal.setAttribute(
            "aria-hidden",
            "true"
        );

        staffModal.classList.remove("active");

        staffForm.reset();
        staffEditingId.value = "";
        staffFormMessage.textContent = "";
    }


    function updateSummary(staff) {
        staffTotalCount.textContent =
            staff.length;

        staffActiveCount.textContent =
            staff.filter(function (member) {
                return member.active;
            }).length;

        staffManagerCount.textContent =
            staff.filter(function (member) {
                return member.role === "Manager";
            }).length;

        staffKitchenCount.textContent =
            staff.filter(function (member) {
                return member.role === "Kitchen";
            }).length;
    }


    function getFilteredStaff() {
        const searchValue =
            staffSearch.value
                .trim()
                .toLowerCase();

        const roleValue =
            staffRoleFilter.value;

        return getStaff().filter(
            function (member) {
                const matchesSearch =
                    !searchValue ||
                    member.name
                        .toLowerCase()
                        .includes(searchValue) ||
                    member.username
                        .toLowerCase()
                        .includes(searchValue) ||
                    String(member.phone || "")
                        .toLowerCase()
                        .includes(searchValue);

                const matchesRole =
                    roleValue === "all" ||
                    member.role === roleValue;

                return (
                    matchesSearch &&
                    matchesRole
                );
            }
        );
    }


    function renderStaff() {
        const allStaff =
            getStaff();

        const filteredStaff =
            getFilteredStaff();

        updateSummary(allStaff);

        staffTableBody.innerHTML = "";

        if (filteredStaff.length === 0) {
            staffTableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No staff members found.
                    </td>
                </tr>
            `;

            return;
        }

        filteredStaff.forEach(
            function (member) {
                const row =
                    document.createElement("tr");

                row.innerHTML = `
                    <td>
                        <strong>${member.name}</strong>
                        <br>
                        <small>@${member.username}</small>
                    </td>

                    <td>
                        ${member.role}
                    </td>

                    <td>
                        ${member.phone || "—"}
                    </td>

                    <td>
                        <span class="${
                            member.active
                                ? "staff-status-active"
                                : "staff-status-inactive"
                        }">
                            ${
                                member.active
                                    ? "Active"
                                    : "Inactive"
                            }
                        </span>
                    </td>

                    <td>
                        <button
                            type="button"
                            class="staff-edit-button"
                            data-staff-edit="${member.id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="staff-delete-button"
                            data-staff-delete="${member.id}"
                        >
                            Delete
                        </button>
                    </td>
                `;

                staffTableBody.appendChild(row);
            }
        );
    }


    function handleStaffSubmit(event) {
        event.preventDefault();

        const nameValue =
            staffName.value.trim();

        const phoneValue =
            staffPhone.value.trim();

        const usernameValue =
            staffUsername.value
                .trim()
                .toLowerCase();

        const passwordValue =
            staffPassword.value.trim();

        const roleValue =
            staffRole.value;

        const editingId =
            staffEditingId.value;

        if (
            !nameValue ||
            !usernameValue ||
            !passwordValue ||
            !roleValue
        ) {
            staffFormMessage.textContent =
                "Please complete all required fields.";

            return;
        }

        if (passwordValue.length < 4) {
            staffFormMessage.textContent =
                "Password must contain at least 4 characters.";

            return;
        }

        const staff =
            getStaff();

        const duplicateUsername =
            staff.some(function (member) {
                return (
                    member.username ===
                        usernameValue &&
                    String(member.id) !==
                        String(editingId)
                );
            });

        if (duplicateUsername) {
            staffFormMessage.textContent =
                "This username is already in use.";

            return;
        }

        if (editingId) {
            const existingMember =
                staff.find(function (member) {
                    return (
                        String(member.id) ===
                        String(editingId)
                    );
                });

            if (!existingMember) {
                staffFormMessage.textContent =
                    "Staff member was not found.";

                return;
            }

            existingMember.name =
                nameValue;

            existingMember.phone =
                phoneValue;

            existingMember.username =
                usernameValue;

            existingMember.password =
                passwordValue;

            existingMember.role =
                roleValue;

            existingMember.active =
                staffActive.checked;

            existingMember.updatedAt =
                new Date().toISOString();
        } else {
            staff.push({
                id:
                    "STF" + Date.now(),
                name:
                    nameValue,
                phone:
                    phoneValue,
                username:
                    usernameValue,
                password:
                    passwordValue,
                role:
                    roleValue,
                active:
                    staffActive.checked,
                createdAt:
                    new Date().toISOString(),
                updatedAt:
                    new Date().toISOString()
            });
        }

        saveStaff(staff);
        renderStaff();
        closeStaffModal();
    }


    function handleTableClick(event) {
        const editButton =
            event.target.closest(
                "[data-staff-edit]"
            );

        const deleteButton =
            event.target.closest(
                "[data-staff-delete]"
            );

        if (editButton) {
            const staffMember =
                getStaff().find(
                    function (member) {
                        return (
                            String(member.id) ===
                            String(
                                editButton.dataset.staffEdit
                            )
                        );
                    }
                );

            if (staffMember) {
                openStaffModal(staffMember);
            }

            return;
        }

        if (deleteButton) {
            const staffId =
                deleteButton.dataset.staffDelete;

            const confirmed =
                window.confirm(
                    "Delete this staff member?"
                );

            if (!confirmed) {
                return;
            }

            const nextStaff =
                getStaff().filter(
                    function (member) {
                        return (
                            String(member.id) !==
                            String(staffId)
                        );
                    }
                );

            saveStaff(nextStaff);
            renderStaff();
        }
    }


    if (addStaffButton) {
        addStaffButton.addEventListener(
            "click",
            function () {
                openStaffModal();
            }
        );
    }

    if (closeStaffModalButton) {
        closeStaffModalButton.addEventListener(
            "click",
            closeStaffModal
        );
    }

    if (staffModalOverlay) {
        staffModalOverlay.addEventListener(
            "click",
            closeStaffModal
        );
    }

    if (cancelStaffButton) {
        cancelStaffButton.addEventListener(
            "click",
            closeStaffModal
        );
    }

    if (staffForm) {
        staffForm.addEventListener(
            "submit",
            handleStaffSubmit
        );
    }

    if (staffTableBody) {
        staffTableBody.addEventListener(
            "click",
            handleTableClick
        );
    }

    if (staffSearch) {
        staffSearch.addEventListener(
            "input",
            renderStaff
        );
    }

    if (staffRoleFilter) {
        staffRoleFilter.addEventListener(
            "change",
            renderStaff
        );
    }

    renderStaff();

})();