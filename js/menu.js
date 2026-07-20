const menuItems = [
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

let cart = JSON.parse(localStorage.getItem("tableTapCart")) || [];

const menuContainer = document.getElementById("menuContainer");
const categoryButtons = document.querySelectorAll(".category-list button");

const openCartButton = document.getElementById("openCart");
const closeCartButton = document.getElementById("closeCart");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");

function saveCart() {
    localStorage.setItem("tableTapCart", JSON.stringify(cart));
}

function displayMenu(category = "All") {
    menuContainer.innerHTML = "";

    const filteredItems =
        category === "All"
            ? menuItems
            : menuItems.filter(item => item.category === category);

    filteredItems.forEach(item => {
        const card = document.createElement("article");

        card.className = "menu-card";

        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.category}</p>

            <div class="menu-card-bottom">
                <strong>SAR ${item.price}</strong>

                <button onclick="addToCart(${item.id})">
                    Add
                </button>
            </div>
        `;

        menuContainer.appendChild(card);
    });
}

function addToCart(itemId) {
    const selectedItem = menuItems.find(item => item.id === itemId);
    const existingItem = cart.find(item => item.id === itemId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...selectedItem,
            quantity: 1
        });
    }

    saveCart();
    updateCart();
}

function updateCart() {
    const cartCount = cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);

    const cartTotal = cart.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    document.getElementById("cartCount").textContent = cartCount;
    document.getElementById("cartTotal").textContent = cartTotal;

    const cartItemsContainer = document.getElementById("cartItems");

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <p class="empty-cart">Your cart is empty.</p>
        `;

        return;
    }

    cartItemsContainer.innerHTML = "";

    cart.forEach(item => {
        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div>
                <h3>${item.name}</h3>
                <p>SAR ${item.price} × ${item.quantity}</p>
            </div>

            <div class="quantity-controls">
                <button onclick="decreaseQuantity(${item.id})">−</button>
                <span>${item.quantity}</span>
                <button onclick="increaseQuantity(${item.id})">+</button>
            </div>
        `;

        cartItemsContainer.appendChild(cartItem);
    });
}

function increaseQuantity(itemId) {
    const item = cart.find(item => item.id === itemId);

    if (item) {
        item.quantity++;
        saveCart();
        updateCart();
    }
}

function decreaseQuantity(itemId) {
    const item = cart.find(item => item.id === itemId);

    if (!item) {
        return;
    }

    item.quantity--;

    if (item.quantity <= 0) {
        cart = cart.filter(cartItem => cartItem.id !== itemId);
    }

    saveCart();
    updateCart();
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

categoryButtons.forEach(button => {
    button.addEventListener("click", function () {
        const selectedCategory = button.textContent.trim();

        categoryButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        displayMenu(selectedCategory);
    });
});

displayMenu();
updateCart();