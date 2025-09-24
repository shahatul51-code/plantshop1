/* app.js - small Redux-like store + product data + cart logic
   Place in root and include from products.html and cart.html
*/

/* -------------------------------
   Tiny Store (Redux-like)
   - state shape: { cart: { items: { [id]: qty } } }
---------------------------------*/
const createStore = (reducer, initialState) => {
  let state = initialState;
  const listeners = [];
  return {
    dispatch(action){
      state = reducer(state, action);
      listeners.forEach(l => l());
      // persist
      try { localStorage.setItem('plantshop_state', JSON.stringify(state)); } catch(e){}
      return action;
    },
    getState(){ return state; },
    subscribe(listener){ listeners.push(listener); return () => {
      const i = listeners.indexOf(listener); if(i>=0) listeners.splice(i,1);
    }}
  }
}

/* reducer */
const initialState = (() => {
  try {
    const s = JSON.parse(localStorage.getItem('plantshop_state'));
    return s || { cart: { items: {} } };
  } catch(e){ return { cart: { items: {} } }; }
})();

function rootReducer(state, action){
  state = state || { cart: { items: {} } };
  const items = {...(state.cart.items||{})};
  switch(action.type){
    case 'ADD':
      if(!items[action.id]) items[action.id] = 0;
      items[action.id] += 1;
      return {...state, cart:{...state.cart, items}};
    case 'SET':
      items[action.id] = action.qty;
      if(items[action.id] <= 0) delete items[action.id];
      return {...state, cart:{...state.cart, items}};
    case 'REMOVE':
      delete items[action.id];
      return {...state, cart:{...state.cart, items}};
    case 'CLEAR':
      return {...state, cart:{items:{}}};
    default:
      return state;
  }
}

const store = createStore(rootReducer, initialState);

/* -------------------------------
   Product data: 6 houseplants
---------------------------------*/
const PRODUCTS = [
  { id: 'p1', name:'Fiddle Leaf Fig', price:25, category:'Living Room', img:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=60' },
  { id: 'p2', name:'Snake Plant', price:20, category:'Low Light', img:'https://images.unsplash.com/photo-1598136495111-5dcd1c6e6f19?auto=format&fit=crop&w=900&q=60' },
  { id: 'p3', name:'Monstera', price:30, category:'Tropical', img:'https://images.unsplash.com/photo-1576402187878-1f299a3e2062?auto=format&fit=crop&w=900&q=60' },
  { id: 'p4', name:'Aloe Vera', price:15, category:'Medicinal', img:'https://images.unsplash.com/photo-1582738416928-593a6bb47f68?auto=format&fit=crop&w=900&q=60' },
  { id: 'p5', name:'ZZ Plant', price:22, category:'Low Light', img:'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=60' },
  { id: 'p6', name:'Pothos', price:18, category:'Hanging', img:'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=60' }
];

/* Helper functions */
function getCartCount(){
  const items = store.getState().cart.items || {};
  return Object.values(items).reduce((s,n)=>s+n,0);
}
function getCartItemsDetailed(){
  const items = store.getState().cart.items || {};
  return Object.keys(items).map(id=>{
    const prod = PRODUCTS.find(p=>p.id === id);
    return { ...prod, qty: items[id] };
  });
}
function getCartTotal(){
  return getCartItemsDetailed().reduce((s,it)=>s + it.price * it.qty, 0);
}

/* Header update function - can be used by pages */
function renderHeaderCartBadge(containerSelector){
  const el = document.querySelector(containerSelector);
  if(!el) return;
  const count = getCartCount();
  el.textContent = count;
}

/* Products page: render and wire add buttons */
function renderProductsPage(){
  const container = document.getElementById('products-root');
  if(!container) return;
  // group by category
  const groups = PRODUCTS.reduce((acc,p)=>{
    (acc[p.category] = acc[p.category]||[]).push(p);
    return acc;
  }, {});
  container.innerHTML = '';
  Object.keys(groups).forEach(category=>{
    const section = document.createElement('section');
    section.className = 'category';
    const h = document.createElement('h3'); h.textContent = category;
    section.appendChild(h);
    const grid = document.createElement('div'); grid.className = 'grid';
    groups[category].forEach(p=>{
      const card = document.createElement('article'); card.className='card';
      card.innerHTML = `
        <img src="${p.img}" alt="${p.name}">
        <div class="body">
          <h3>${p.name}</h3>
          <p>Nice plant for your ${category.toLowerCase()}.</p>
          <div style="margin-top:auto; display:flex; align-items:center; justify-content:space-between">
            <div class="price">$${p.price.toFixed(2)}</div>
            <div>
              <button class="btn add-to" data-id="${p.id}">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    section.appendChild(grid);
    container.appendChild(section);
  });

  // disable add buttons for items already in cart
  const itemsInCart = store.getState().cart.items || {};
  document.querySelectorAll('.add-to').forEach(b=>{
    const id = b.dataset.id;
    if(itemsInCart[id]){ b.disabled = true; b.textContent = 'Added'; b.style.opacity=0.7; }
    b.addEventListener('click', ()=>{
      b.disabled = true; b.textContent = 'Added'; b.style.opacity=0.7;
      store.dispatch({type:'ADD', id});
      renderHeaderCartBadge('#cart-badge');
    });
  });
}

/* Cart page render & controls */
function renderCartPage(){
  const listEl = document.getElementById('cart-list');
  const totalCountEl = document.getElementById('cart-total-count');
  const totalCostEl = document.getElementById('cart-total-cost');
  if(!listEl) return;
  listEl.innerHTML = '';
  const items = getCartItemsDetailed();
  if(items.length === 0){
    listEl.innerHTML = `<div style="padding:18px;background:#fff;border-radius:10px;text-align:center">Your cart is empty. <a href="products.html" class="btn" style="margin-left:8px">Shop Products</a></div>`;
  } else {
    items.forEach(it=>{
      const row = document.createElement('div'); row.className='cart-row';
      row.innerHTML = `
        <img src="${it.img}" alt="${it.name}">
        <div class="meta">
          <h4>${it.name}</h4>
          <div>Unit: $${it.price.toFixed(2)}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <div class="qty-controls">
            <button class="dec" data-id="${it.id}">−</button>
            <div style="padding:6px 12px;border-radius:6px;border:1px solid #eee;">${it.qty}</div>
            <button class="inc" data-id="${it.id}">+</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="font-weight:700">$${(it.price * it.qty).toFixed(2)}</div>
            <button class="del" data-id="${it.id}" title="Remove">Delete</button>
          </div>
        </div>
      `;
      listEl.appendChild(row);
    });
  }

  // totals
  totalCountEl.textContent = getCartCount();
  totalCostEl.textContent = '$' + getCartTotal().toFixed(2);

  // wire controls
  listEl.querySelectorAll('.inc').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.id;
      const cur = store.getState().cart.items[id] || 0;
      store.dispatch({type:'SET', id, qty: cur + 1});
      renderCartPage(); renderHeaderCartBadge('#cart-badge');
    });
  });
  listEl.querySelectorAll('.dec').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.id;
      const cur = store.getState().cart.items[id] || 0;
      const newQty = Math.max(0, cur - 1);
      if(newQty <= 0) store.dispatch({type:'REMOVE', id});
      else store.dispatch({type:'SET', id, qty: newQty});
      renderCartPage(); renderHeaderCartBadge('#cart-badge');
    });
  });
  listEl.querySelectorAll('.del').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.id;
      store.dispatch({type:'REMOVE', id});
      renderCartPage(); renderHeaderCartBadge('#cart-badge');
    });
  });
}

/* Utility to wire nav/cart badge on any page */
function wireHeader(){
  const badge = document.querySelector('#cart-badge');
  if(badge) renderHeaderCartBadge('#cart-badge');
  // Subscribe to store changes so badge updates across interactions
  store.subscribe(()=>{ renderHeaderCartBadge('#cart-badge'); });
}

/* Expose functions for pages */
window.PlantShop = {
  PRODUCTS,
  store,
  renderProductsPage,
  renderCartPage,
  wireHeader,
  getCartCount,
  getCartTotal
};
