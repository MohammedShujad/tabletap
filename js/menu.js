const defaultMenuItems = [
    {
        id: 1,
        name: "Chicken Biryani Full",
        category: "Traditional Dishes",
        price: 22
    },
    {
        id: 2,
        name: "Mutton Biryani Full",
        category: "Traditional Dishes",
        price: 25
    },
    {
        id: 3,
        name: "Chicken 65",
        category: "Starters",
        price: 20
    },
    {
        id: 4,
        name: "Fish Fry Boneless",
        category: "Starters",
        price: 25
    },
    {
        id: 5,
        name: "Chicken Fried Rice",
        category: "Fast Food",
        price: 17
    },
    {
        id: 6,
        name: "Chicken Handi",
        category: "Chicken Gravy",
        price: 19
    },
    {
        id: 7,
        name: "Mutton Handi",
        category: "Mutton Gravy",
        price: 20
    },
    {
        id: 8,
        name: "Paneer Butter Masala",
        category: "Vegetarian",
        price: 24
    }
];

function cleanCategory(category) {
    return String(category || "")
        .trim()
        .replace(/\s+/g, " ");
}

function categoryKey(category) {
    return cleanCategory(category).toLowerCase();
}

const savedMenu = JSON.parse(
    localStorage.getItem("tableTapMenu")
);

const menuItems =
    Array.isArray(savedMenu)
        ? savedMenu
        : defaultMenuItems;

let cart =
    JSON.parse(localStorage.getItem("tableTapCart")) || [];

const menuContainer =
    document.getElementById("menuContainer");

const categoryList =
    document.getElementById("categoryList");

const openCartButton =
    document.getElementById("openCart");

const closeCartButton =
    document.getElementById("closeCart");

const cartPanel =
    document.getElementById("cartPanel");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartItemsContainer =
    document.getElementById("cartItems");

const cartCountElement =
    document.getElementById("cartCount");

const cartTotalElement =
    document.getElementById("cartTotal");

function saveCart() {
    localStorage.setItem(
        "tableTapCart",
        JSON.stringify(cart)
    );
}

function getCategories() {
    const categoryMap = new Map();

    menuItems.forEach(function (item) {
        const category = cleanCategory(item.category);
        const key = categoryKey(category);

        if (category && !categoryMap.has(key)) {
            categoryMap.set(key, category);
        }
    });

    return Array.from(categoryMap.values());
}

function displayCategories() {
    categoryList.innerHTML = "";

    const categories = ["All", ...getCategories()];

    categories.forEach(function (category, index) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = category;

        if (index === 0) {
            button.classList.add("active");
        }

        button.addEventListener("click", function () {
            const buttons =
                categoryList.querySelectorAll("button");

            buttons.forEach(function (currentButton) {
                currentButton.classList.remove("active");
            });

            button.classList.add("active");
            displayMenu(category);
        });

        categoryList.appendChild(button);
    });
}

function displayMenu(selectedCategory = "All") {
    menuContainer.innerHTML = "";

    const filteredItems =
        selectedCategory === "All"
            ? menuItems
            : menuItems.filter(function (item) {
                return (
                    categoryKey(item.category) ===
                    categoryKey(selectedCategory)
                );
            });

    if (filteredItems.length === 0) {
        menuContainer.innerHTML = `
            <p>No menu items found.</p>
        `;
        return;
    }

    filteredItems.forEach(function (item) {
        const card = document.createElement("article");

        card.className = "menu-card";

        card.innerHTML = `
            <h3>${item.name}</h3>

            <p>${cleanCategory(item.category)}</p>

            <div class="menu-card-bottom">
                <strong>SAR ${Number(item.price)}</strong>

                <button type="button" data-item-id="${item.id}">
                    Add
                </button>
            </div>
        `;

        const addButton = card.querySelector("button");

        addButton.addEventListener("click", function () {
            addToCart(item.id);
        });

        menuContainer.appendChild(card);
    });
}

function addToCart(itemId) {
    const selectedItem =
        menuItems.find(function (item) {
            return String(item.id) === String(itemId);
        });

    if (!selectedItem) {
        return;
    }

    const existingItem =
        cart.find(function (item) {
            return String(item.id) === String(itemId);
        });

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...selectedItem,
            price: Number(selectedItem.price),
            quantity: 1
        });
    }

    saveCart();
    updateCart();
}

function increaseQuantity(itemId) {
    const item =
        cart.find(function (cartItem) {
            return String(cartItem.id) === String(itemId);
        });

    if (!item) {
        return;
    }

    item.quantity += 1;

    saveCart();
    updateCart();
}

function decreaseQuantity(itemId) {
    const item =
        cart.find(function (cartItem) {
            return String(cartItem.id) === String(itemId);
        });

    if (!item) {
        return;
    }

    item.quantity -= 1;

    if (item.quantity <= 0) {
        cart = cart.filter(function (cartItem) {
            return String(cartItem.id) !== String(itemId);
        });
    }

    saveCart();
    updateCart();
}

function updateCart() {
    const cartCount =
        cart.reduce(function (total, item) {
            return total + Number(item.quantity);
        }, 0);

    const cartTotal =
        cart.reduce(function (total, item) {
            return (
                total +
                Number(item.price) * Number(item.quantity)
            );
        }, 0);

    cartCountElement.textContent = cartCount;
    cartTotalElement.textContent = cartTotal;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <p class="empty-cart">Your cart is empty.</p>
        `;
        return;
    }

    cart.forEach(function (item) {
        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div>
                <h3>${item.name}</h3>
                <p>SAR ${item.price} × ${item.quantity}</p>
            </div>

            <div class="quantity-controls">
                <button type="button" class="minus-button">−</button>
                <span>${item.quantity}</span>
                <button type="button" class="plus-button">+</button>
            </div>
        `;

        cartItem
            .querySelector(".minus-button")
            .addEventListener("click", function () {
                decreaseQuantity(item.id);
            });

        cartItem
            .querySelector(".plus-button")
            .addEventListener("click", function () {
                increaseQuantity(item.id);
            });

        cartItemsContainer.appendChild(cartItem);
    });
}

function openCart() {
    cartPanel.classList.add("open");
    cartOverlay.classList.add("show");
}

function closeCart() {
    cartPanel.classList.remove("open");
    cartOverlay.classList.remove("show");
}

openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

displayCategories();
displayMenu("All");
updateCart();