const grid = document.getElementById("product-grid");
const cartPanel = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const toast = document.getElementById("toast");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* ---------- UI HELPERS ---------- */
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ---------- PRODUCT RENDER ---------- */
function renderProducts() {
    grid.innerHTML = "";

    let filtered = [...products];

    // Search
    const q = searchInput.value.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q));

    // Category
    if (categoryFilter.value !== "all") {
        filtered = filtered.filter(p => p.category === categoryFilter.value);
    }

    // Sort
    if (sortPrice.value === "low") {
        filtered.sort((a,b) => a.price - b.price);
    }
    if (sortPrice.value === "high") {
        filtered.sort((a,b) => b.price - a.price);
    }

    if (!filtered.length) {
        grid.innerHTML = `<p class="empty">No products found</p>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        const sizes = p.sizes
            ? `<select>
                <option value="">Select size</option>
                ${Object.keys(p.sizes).map(s =>
                    `<option ${p.sizes[s] === 0 ? "disabled" : ""}>${s}</option>`
                ).join("")}
               </select>`
            : "";

        card.innerHTML = `
            <button class="wish" aria-label="Wishlist"
                onclick="toggleWishlist(${p.id})">
                ${wishlist.includes(p.id) ? "♥" : "♡"}
            </button>

            <img src="${p.image}">
            <div class="card-content">
                <h3>${p.name}</h3>
                <div class="price">$${p.price}</div>
                ${sizes}
                <button data-id="${p.id}">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);
    });
}


/* ---------- EVENTS ---------- */
document.getElementById("cart-toggle").onclick = () =>
    cartPanel.classList.toggle("active");

grid.addEventListener("click", e => {
    if (!e.target.matches("button")) return;

    const card = e.target.closest(".card");
    const id = +e.target.dataset.id;
    const product = products.find(p => p.id === id);
    const select = card.querySelector("select");
    const size = select ? select.value : null;

    if (product.sizes && !size) {
        showToast("Select a size");
        return;
    }

    if (product.sizes && product.sizes[size] === 0) {
        showToast("Size out of stock");
        return;
    }

    addToCart(product, size);
});

/* ---------- CART ---------- */
function addToCart(product, size) {
    const item = cart.find(i => i.id === product.id && i.size === size);

    if (item) item.qty++;
    else cart.push({ id: product.id, name: product.name, price: product.price, size, qty: 1 });

    if (product.sizes) product.sizes[size]--;

    saveCart();
    showToast("Added to cart");
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    cartItems.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach((item, i) => {
        total += item.price * item.qty;
        count += item.qty;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div>
                ${item.name}<br>
                ${item.size ? `Size: ${item.size}` : ""}
            </div>
            <div>
                <button data-i="${i}" data-d="-1">−</button>
                ${item.qty}
                <button data-i="${i}" data-d="1">+</button>
            </div>
        `;
        cartItems.appendChild(div);
    });

    cartTotal.textContent = `Total: $${total}`;
    cartCount.textContent = count;
}

cartItems.addEventListener("click", e => {
    if (!e.target.dataset.i) return;

    const i = +e.target.dataset.i;
    const delta = +e.target.dataset.d;
    cart[i].qty += delta;

    if (cart[i].qty <= 0) cart.splice(i, 1);
    saveCart();
});

/* ---------- CHECKOUT ---------- */
document.getElementById("checkout-btn").onclick = () => {
    document.getElementById("checkout-modal").classList.add("active");
    document.getElementById("checkout-summary").innerHTML =
        cart.map(i => `${i.name} (${i.size || "One Size"}) x${i.qty}`).join("<br>");
};

document.getElementById("place-order").onclick = () => {
    cart = [];
    saveCart();
    showToast("Order placed successfully");
    document.getElementById("checkout-modal").classList.remove("active");
};

document.querySelector(".close-modal").onclick = () =>
    document.getElementById("checkout-modal").classList.remove("active");

renderCart();
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

function toggleWishlist(id) {
    wishlist.includes(id)
        ? wishlist = wishlist.filter(x => x !== id)
        : wishlist.push(id);

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    renderProducts();
}

const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("category-filter");
const sortPrice = document.getElementById("sort-price");

[searchInput, categoryFilter, sortPrice].forEach(el =>
    el.addEventListener("input", renderProducts)
);
