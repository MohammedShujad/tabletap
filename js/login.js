// =====================================
// TABLETAP LOGIN
// =====================================

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const username =
            document
                .getElementById("username")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value
                .trim();

        const user =
            TableTapAuth.login(
                username,
                password
            );

        if (!user) {

            loginMessage.textContent =
                "Invalid username or password.";

            return;

        }

        switch (user.role) {

            case "Owner":
            case "Manager":

                window.location.href =
                    "admin-v2.html";

                break;

            case "Kitchen":

                window.location.href =
                    "kitchen.html";

                break;

            case "Waiter":

                window.location.href =
                    "waiter.html";

                break;

            case "Cashier":

                window.location.href =
                    "billing.html";

                break;

            default:

                window.location.href =
                    "menu.html";

        }

    }
);