// ===============================
// TABLETAP - SHARED CONFIGURATION
// ===============================

const defaultMenuItems = [
    { id: 1, name: "Chicken Biryani Full", category: "Traditional Dishes", price: 22, image: "", available: true },
    { id: 2, name: "Mutton Biryani Full", category: "Traditional Dishes", price: 25, image: "", available: true },
    { id: 3, name: "Chicken 65", category: "Starters", price: 20, image: "", available: true },
    { id: 4, name: "Fish Fry Boneless", category: "Starters", price: 25, image: "", available: true },
    { id: 5, name: "Chicken Fried Rice", category: "Fast Food", price: 17, image: "", available: true },
    { id: 6, name: "Chicken Handi", category: "Chicken Gravy", price: 19, image: "", available: true },
    { id: 7, name: "Mutton Handi", category: "Mutton Gravy", price: 20, image: "", available: true },
    { id: 8, name: "Paneer Butter Masala", category: "Vegetarian", price: 24, image: "", available: true }
];

const defaultRestaurantSettings = {
    restaurantName: "Green & Red Restaurant",
    branchName: "Main Branch",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    openingHours: "",
    vatNumber: "",
    vatPercent: 15,
    currency: "SAR",
    logoUrl: "",
    receiptFooter: "Thank you. Please visit again."
};

function normalizeTableValue(value) {
    return String(value || "").trim().toLowerCase();
}

function cleanCategory(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ");
}

function categoryKey(value) {
    return cleanCategory(value).toLowerCase();
}

function getOrderDate(order) {
    const dateValue = order.createdAt || order.completedAt;
    const parsedDate = new Date(dateValue);

    return Number.isNaN(parsedDate.getTime())
        ? null
        : parsedDate;
}

function isSameDay(firstDate, secondDate) {
    return (
        firstDate.getFullYear() === secondDate.getFullYear() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getDate() === secondDate.getDate()
    );
}