let cart = JSON.parse(localStorage.getItem("cart")) || [];
function updateCartCount() {
  const el = document.getElementById("cart-count");
  if(el) el.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}
updateCartCount();

// Add to Cart buttons
document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = parseFloat(button.dataset.price);
    let existing = cart.find(item => item.id === id);
    if(!existing) cart.push({id, name, price, quantity: 1});
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    button.disabled = true;
    button.textContent = "Added ✅";
  });
});

// Cart Page Functions
function renderCartPage() {
  const container = document.getElementById("cart-container");
  const totalItemsEl = document.getElementById("total-items");
  const totalCostEl = document.getElementById("total-cost");
  if(!container) return;
  container.innerHTML = "";
  if(cart.length === 0){
    container.innerHTML = "<p>Your cart is empty 🌱</p>";
    totalItemsEl.textContent = "0";
    totalCostEl.textContent = "$0";
    return;
  }
  cart.forEach(item=>{
    const div = document.createElement("div");
    div.className="cart-item";
    div.innerHTML = `
      <img src="images/${item.name.toLowerCase().replace(' ','-')}.jpg" width="80">
      <div>
        <h3>${item.name}</h3>
        <p>$${item.price}</p>
        <p>Qty: ${item.quantity}</p>
        <button onclick="increaseItem('${item.id}')">+</button>
        <button onclick="decreaseItem('${item.id}')">-</button>
        <button onclick="removeItem('${item.id}')">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
  const totalItems = cart.reduce((sum,i)=>sum+i.quantity,0);
  const totalCost = cart.reduce((sum,i)=>sum+i.price*i.quantity,0);
  totalItemsEl.textContent = totalItems;
  totalCostEl.textContent = `$${totalCost}`;
}

function increaseItem(id){
  const item = cart.find(i=>i.id===id);
  if(item){ item.quantity++; saveCart(); renderCartPage(); updateCartCount(); }
}
function decreaseItem(id){
  const item = cart.find(i=>i.id===id);
  if(item){
    item.quantity>1? item.quantity-- : cart=cart.filter(i=>i.id!==id);
    saveCart(); renderCartPage(); updateCartCount();
  }
}
function removeItem(id){
  cart=cart.filter(i=>i.id!==id);
  saveCart(); renderCartPage(); updateCartCount();
}
function saveCart(){ localStorage.setItem("cart",JSON.stringify(cart)); }
function checkout(){ alert("Checkout Coming Soon!"); }

window.onload = ()=>{ renderCartPage(); updateCartCount(); };
