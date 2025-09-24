// =============================
// PlantShop - script.js
// =============================

// Cart data (stored in memory for demo)
let cart = [];

// Reference to cart count (header icon)
const cartCountEl = document.getElementById("cart-count");

// Utility: update cart count in header
function updateCartCount() {
  if (cartCountEl) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = totalItems;
  }
}

// Add to cart
function addToCart(id, name, price, img) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, name, price, img, quantity: 1 });
  }

  // Disable button after adding (on product page)
  const btn = document.getElementById(`add-${id}`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Added";
  }

  updateCartCount();
  saveCart();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
  const saved = localStorage.getItem("cart");
  if (saved) {
    cart = JSON.parse(saved);
  }
  updateCartCount();
}

// =============================
// CART PAGE FUNCTIONS
// =============================

function renderCartPage() {
  const cartContainer = document.getElementById("cart-container");
  const totalItemsEl = document.getElementById("total-items");
  const totalCostEl = document.getElementById("total-cost");

  if (!cartContainer) return; // not on cart.html

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty 🌱</p>";
    totalItemsEl.textContent = "0";
    totalCostEl.textContent = "$0";
    return;
  }

  cart.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    itemDiv.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-info">
        <h3>${item.name}</h3>
        <p>$${item.price}</p>
        <p>Quantity: ${item.quantity}</p>
        <div class="cart-actions">
          <button onclick="increaseItem('${item.id}')">+</button>
          <button onclick="decreaseItem('${item.id}')">-</button>
          <button onclick="removeItem('${item.id}')">Delete</button>
        </div>
      </div>
    `;

    cartContainer.appendChild(itemDiv);
  });

  // Update totals
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  totalItemsEl.textContent = totalItems;
  totalCostEl.textContent = `$${totalCost}`;
}

// Increase item
function increaseItem(id) {
  const item = cart.find(p => p.id === id);
  if (item) {
    item.quantity++;
    saveCart();
    renderCartPage();
    updateCartCount();
  }
}

// Decrease item
function decreaseItem(id) {
  const item = cart.find(p => p.id === id);
  if (item && item.quantity > 1) {
    item.quantity--;
  } else {
    cart = cart.filter(p => p.id !== id);
  }
  saveCart();
  renderCartPage();
  updateCartCount();
}

// Remove item
function removeItem(id) {
  cart = cart.filter(p => p.id !== id);
  saveCart();
  renderCartPage();
  updateCartCount();
}

// Checkout
function checkout() {
  alert("Checkout Coming Soon!");
}

// =============================
// INIT
// =============================
window.onload = () => {
  loadCart();

  // Render cart if on cart.html
  if (document.getElementById("cart-container")) {
    renderCartPage();
  }
};
