let cart = [];
let cartCount = 0;

function addToCart(name, price, button) {
    cart.push({name, price, quantity: 1});
    cartCount++;
    document.getElementById('cart-count').innerText = cartCount;
    button.disabled = true;
    updateCartPage();
}

function updateCartPage() {
    const cartDiv = document.getElementById('cart-items');
    if (!cartDiv) return;
    cartDiv.innerHTML = '';
    let totalQuantity = 0;
    let totalCost = 0;
    cart.forEach((item, index) => {
        totalQuantity += item.quantity;
        totalCost += item.price * item.quantity;
        const div = document.createElement('div');
        div.innerHTML = `
            <p>${item.name} - $${item.price} x ${item.quantity} 
            <button onclick="increment(${index})">+</button> 
            <button onclick="decrement(${index})">-</button> 
            <button onclick="removeItem(${index})">Delete</button></p>
        `;
        cartDiv.appendChild(div);
    });
    document.getElementById('total-quantity').innerText = totalQuantity;
    document.getElementById('total-cost').innerText = totalCost;
}

function increment(index) {
    cart[index].quantity++;
    updateCartPage();
}

function decrement(index) {
    if(cart[index].quantity > 1){
        cart[index].quantity--;
    }
    updateCartPage();
}

function removeItem(index) {
    cart.splice(index,1);
    cartCount--;
    document.getElementById('cart-count').innerText = cartCount;
    updateCartPage();
}

function checkout() {
    alert('Coming Soon!');
}
