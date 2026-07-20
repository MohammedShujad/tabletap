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

let cartCount = 0;

const menuContainer = document.getElementById("menuContainer");
const categoryButtons = document.querySelectorAll(".category-list button");

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

    cartCount++;

    document.getElementById("cartCount").textContent = cartCount;

    console.log(selectedItem.name + " added to cart");
}

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