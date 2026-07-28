// =====================================
// TABLETAP AUTH SYSTEM
// =====================================

(function () {

    const STAFF_KEY = "tableTapStaff";
    const SESSION_KEY = "tableTapSession";

    function initializeDefaultUsers() {

        if (localStorage.getItem(STAFF_KEY)) {
            return;
        }

        const users = [

            {
                id: "OWNER001",
                name: "Restaurant Owner",
                username: "owner",
                password: "1234",
                role: "Owner",
                active: true
            },

            {
                id: "MGR001",
                name: "Manager",
                username: "manager",
                password: "1234",
                role: "Manager",
                active: true
            },

            {
                id: "KIT001",
                name: "Kitchen",
                username: "kitchen",
                password: "1234",
                role: "Kitchen",
                active: true
            },

            {
                id: "WTR001",
                name: "Ahmed",
                username: "waiter",
                password: "1234",
                role: "Waiter",
                active: true
            },

            {
                id: "CSH001",
                name: "Cashier",
                username: "cashier",
                password: "1234",
                role: "Cashier",
                active: true
            }

        ];

        localStorage.setItem(
            STAFF_KEY,
            JSON.stringify(users)
        );
    }

    function getUsers() {

        return JSON.parse(
            localStorage.getItem(STAFF_KEY)
        ) || [];

    }

    function login(username, password) {

        const users = getUsers();

        const user = users.find(function (u) {

            return (
                u.username === username &&
                u.password === password &&
                u.active
            );

        });

        if (!user) {
            return false;
        }

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify(user)
        );

        return user;

    }

    function logout() {

        localStorage.removeItem(
            SESSION_KEY
        );

        window.location.href = "login.html";

    }

    function getCurrentUser() {

        return JSON.parse(
            localStorage.getItem(SESSION_KEY)
        );

    }

    function isLoggedIn() {

        return !!getCurrentUser();

    }

    initializeDefaultUsers();
    function requireLogin() {

    if (!isLoggedIn()) {

        window.location.href = "login.html";

    }

}

function requireRole(roles) {

    const user = getCurrentUser();

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    if (!roles.includes(user.role)) {

        redirectAfterLogin(user);

    }

}

function redirectAfterLogin(user) {

    switch (user.role) {

        case "Owner":
        case "Manager":

            window.location.href = "admin-v2.html";

            break;

        case "Kitchen":

            window.location.href = "kitchen.html";

            break;

        case "Waiter":

            window.location.href = "waiter.html";

            break;

        case "Cashier":

            window.location.href = "billing.html";

            break;

        default:

            window.location.href = "login.html";

    }

}

function redirectIfAuthenticated() {

    if (isLoggedIn()) {

        redirectAfterLogin(getCurrentUser());

    }

}
  window.TableTapAuth = {

    login,
    logout,
    getCurrentUser,
    isLoggedIn,
    getUsers,

    requireLogin,

    requireRole,

    redirectAfterLogin,

    redirectIfAuthenticated

};

})();