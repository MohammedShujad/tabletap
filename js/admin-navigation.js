// =====================================
// TABLETAP - ADMIN NAVIGATION MODULE
// =====================================

function initAdminNavigation() {
    const sidebar =
        document.getElementById("adminSidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const sidebarToggle =
        document.getElementById("sidebarToggle");

    const sidebarClose =
        document.getElementById("sidebarClose");

    const workspaceTitle =
        document.getElementById("workspaceTitle");

    const navigationButtons =
        document.querySelectorAll(
            "[data-admin-view]"
        );

    const workspaceViews =
        document.querySelectorAll(
            "[data-workspace-view]"
        );

    if (
        !sidebar ||
        !workspaceTitle ||
        navigationButtons.length === 0 ||
        workspaceViews.length === 0
    ) {
        console.warn(
            "TableTap navigation elements are not available yet."
        );

        return;
    }

    function closeMobileSidebar() {
        sidebar.classList.remove("open");

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove(
                "show"
            );
        }

        document.body.classList.remove(
            "sidebar-open"
        );
    }

    function openMobileSidebar() {
        sidebar.classList.add("open");

        if (sidebarOverlay) {
            sidebarOverlay.classList.add(
                "show"
            );
        }

        document.body.classList.add(
            "sidebar-open"
        );
    }

    function showWorkspace(viewName) {
        const selectedView =
            document.querySelector(
                `[data-workspace-view="${viewName}"]`
            );

        if (!selectedView) {
            console.warn(
                `Admin workspace "${viewName}" was not found.`
            );

            return;
        }

        workspaceViews.forEach(
            function (view) {
                const isSelected =
                    view === selectedView;

                view.hidden = !isSelected;

                view.classList.toggle(
                    "active",
                    isSelected
                );
            }
        );

        navigationButtons.forEach(
            function (button) {
                const isSelected =
                    button.dataset.adminView ===
                    viewName;

                button.classList.toggle(
                    "active",
                    isSelected
                );

                button.setAttribute(
                    "aria-current",
                    isSelected
                        ? "page"
                        : "false"
                );
            }
        );

        const activeButton =
            document.querySelector(
                `[data-admin-view="${viewName}"]`
            );

        const title =
            activeButton?.dataset.viewTitle ||
            activeButton?.textContent.trim() ||
            "Dashboard";

        workspaceTitle.textContent = title;

        document.title =
            `${title} | TableTap Admin`;

        localStorage.setItem(
            "tableTapAdminView",
            viewName
        );

        closeMobileSidebar();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    navigationButtons.forEach(
        function (button) {
            button.addEventListener(
                "click",
                function (event) {
                    const viewName =
                        button.dataset.adminView;

                    if (!viewName) {
                        return;
                    }

                    event.preventDefault();

                    showWorkspace(viewName);
                }
            );
        }
    );

    if (sidebarToggle) {
        sidebarToggle.addEventListener(
            "click",
            function () {
                if (
                    sidebar.classList.contains(
                        "open"
                    )
                ) {
                    closeMobileSidebar();
                } else {
                    openMobileSidebar();
                }
            }
        );
    }

    if (sidebarClose) {
        sidebarClose.addEventListener(
            "click",
            closeMobileSidebar
        );
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener(
            "click",
            closeMobileSidebar
        );
    }

    document.addEventListener(
        "keydown",
        function (event) {
            if (event.key === "Escape") {
                closeMobileSidebar();
            }
        }
    );

    window.addEventListener(
        "resize",
        function () {
            if (window.innerWidth > 900) {
                closeMobileSidebar();
            }
        }
    );

    const savedView =
        localStorage.getItem(
            "tableTapAdminView"
        );

    const initialViewExists =
        savedView &&
        document.querySelector(
            `[data-workspace-view="${savedView}"]`
        );

    showWorkspace(
        initialViewExists
            ? savedView
            : "dashboard"
    );
}