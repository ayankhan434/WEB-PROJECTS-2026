const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let DEMO_MODE = Object.values(FIREBASE_CONFIG).some(value => String(value).includes("YOUR_"));
let db, auth;

const DEMO_PRODUCTS = [
  {id:"d1",name:"SS Ton Elite English Willow Bat",brand:"SS",category:"bat",price:4999,oldPrice:6500,rating:4.8,reviews:234,badge:"bestseller",description:"Premium English willow bat, professional players ke liye."},
  {id:"d2",name:"SG HP X10 Kashmir Willow Bat",brand:"SG",category:"bat",price:1299,oldPrice:1800,rating:4.5,reviews:156,badge:"sale",description:"Best budget bat for beginners and practice."},
  {id:"d3",name:"MRF Virat Kohli Genius Grand Bat",brand:"MRF",category:"bat",price:7500,oldPrice:9000,rating:4.9,reviews:89,badge:"premium",description:"Virat Kohli ka official bat model."},
  {id:"d4",name:"Kookaburra Pro 3.0 Batting Gloves",brand:"Kookaburra",category:"glove",price:1650,oldPrice:2100,rating:4.6,reviews:112,badge:"sale",description:"Professional batting gloves with extra palm protection."},
  {id:"d5",name:"SG RP Prolite Batting Gloves",brand:"SG",category:"glove",price:950,oldPrice:1200,rating:4.4,reviews:203,badge:"new",description:"Lightweight gloves for junior and club players."},
  {id:"d6",name:"SG Club Red Cricket Ball Pack of 6",brand:"SG",category:"ball",price:840,oldPrice:1000,rating:4.4,reviews:320,badge:"bestseller",description:"Durable leather balls for practice and club matches."},
  {id:"d7",name:"Kookaburra Regulation White Ball",brand:"Kookaburra",category:"ball",price:580,oldPrice:720,rating:4.2,reviews:180,badge:"",description:"Official white ball for limited overs cricket."},
  {id:"d8",name:"GM Sparq DXM 404 English Willow",brand:"GM",category:"bat",price:8200,oldPrice:9500,rating:4.9,reviews:45,badge:"premium",description:"Thick edges and great pick-up."},
  {id:"d9",name:"SS Cricket Kit Bag Large",brand:"SS",category:"bag",price:2200,oldPrice:2800,rating:4.5,reviews:67,badge:"new",description:"Spacious kit bag with multiple compartments."},
  {id:"d10",name:"Adidas Batting Thigh Guard",brand:"Adidas",category:"accessory",price:450,oldPrice:600,rating:4.1,reviews:95,badge:"sale",description:"Lightweight thigh guard with firm padding."}
];

let localProducts = [...DEMO_PRODUCTS];
let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentUser = null;
let currentCategory = "all";
let currentPriceFilter = "all";
let currentSort = "default";
let currentSearch = "";
let currentBrand = "all";
let wishlist = new Set();

const CAT_ICONS = {bat:"🪵",glove:"🧤",ball:"🔴",bag:"🎒",accessory:"⭐"};
const CAT_NAMES = {bat:"Cricket Bats",glove:"Gloves",ball:"Balls",bag:"Kit Bags",accessory:"Accessories"};

function initFirebase(){
  if(DEMO_MODE || !window.firebase) return;
  try{
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    auth = firebase.auth();
  }catch(error){
    console.error(error);
    DEMO_MODE = true;
  }
}

function showToast(message, type="success", duration=3000){
  const wrap = document.getElementById("toast");
  const item = document.createElement("div");
  item.className = `toast-item ${type}`;
  item.innerHTML = `<span>${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>${message}`;
  wrap.appendChild(item);
  setTimeout(() => {
    item.style.animation = "slideOut .25s forwards";
    setTimeout(() => item.remove(), 250);
  }, duration);
}

function showSpinner(message="Loading..."){
  const overlay = document.getElementById("spinnerOverlay");
  overlay.querySelector("p").textContent = message;
  overlay.classList.remove("hidden");
}

function hideSpinner(){
  document.getElementById("spinnerOverlay").classList.add("hidden");
}

async function loadProducts(){
  showSpinner("Products load ho rahe hain...");
  try{
    if(DEMO_MODE){
      allProducts = [...localProducts];
    }else{
      const snap = await db.collection("products").orderBy("createdAt","desc").get();
      allProducts = snap.docs.map(doc => ({id: doc.id, ...doc.data()}));
      if(allProducts.length === 0) allProducts = [...localProducts];
    }
    applyFilters();
    updateCategoryCounts();
    updateStats();
  }catch(error){
    console.error(error);
    DEMO_MODE = true;
    allProducts = [...localProducts];
    applyFilters();
    updateCategoryCounts();
    updateStats();
    showToast("Demo mode mein chal raha hai", "info");
  }finally{
    hideSpinner();
  }
}

function applyFilters(){
  let result = [...allProducts];
  if(currentCategory !== "all") result = result.filter(p => p.category === currentCategory);
  if(currentBrand !== "all") result = result.filter(p => p.brand === currentBrand);
  if(currentPriceFilter === "under2k") result = result.filter(p => p.price < 2000);
  if(currentPriceFilter === "2k5k") result = result.filter(p => p.price >= 2000 && p.price <= 5000);
  if(currentPriceFilter === "above5k") result = result.filter(p => p.price > 5000);
  if(currentSearch.trim()){
    const q = currentSearch.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  if(currentSort === "price-asc") result.sort((a,b) => a.price - b.price);
  if(currentSort === "price-desc") result.sort((a,b) => b.price - a.price);
  if(currentSort === "rating") result.sort((a,b) => (b.rating || 0) - (a.rating || 0));
  if(currentSort === "newest") result.reverse();
  filteredProducts = result;
  renderProducts();
  document.getElementById("resultsCount").textContent = `${result.length} products mili`;
}

function setCategory(el, category){
  currentCategory = category;
  document.querySelectorAll(".cat-card").forEach(card => card.classList.remove("active"));
  el.classList.add("active");
  applyFilters();
}

function setPriceFilter(el, range){
  currentPriceFilter = range;
  document.querySelectorAll(".filter-pill").forEach(btn => btn.classList.remove("active"));
  el.classList.add("active");
  applyFilters();
}

function onSort(value){ currentSort = value; applyFilters(); }
function onSearch(value){ currentSearch = value; applyFilters(); }

function filterBrand(brand, el){
  currentBrand = brand;
  document.querySelectorAll(".brands-grid button").forEach(btn => btn.classList.remove("active"));
  el.classList.add("active");
  applyFilters();
}

function updateCategoryCounts(){
  document.getElementById("catAll").textContent = `${allProducts.length} products`;
  ["bat","glove","ball","bag","accessory"].forEach(category => {
    const id = "cat" + category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById(id).textContent = `${allProducts.filter(p => p.category === category).length} products`;
  });
}

function updateStats(){
  document.getElementById("productCount").textContent = allProducts.length + "+";
}

function renderProducts(){
  const grid = document.getElementById("productsGrid");
  if(filteredProducts.length === 0){
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🏏</div><h3>Koi product nahi mila</h3><p>Filter ya search change karein</p></div>`;
    return;
  }
  grid.innerHTML = filteredProducts.map(p => {
    const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const rating = Math.max(0, Math.min(5, Math.floor(p.rating || 4)));
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const badgeClass = p.badge === "sale" ? "badge-sale" : p.badge === "new" ? "badge-new" : p.badge === "premium" ? "badge-premium" : "badge-green";
    const wished = wishlist.has(p.id);
    return `<article class="product-card" onclick="openProductModal('${p.id}')">
      ${p.badge ? `<span class="badge ${badgeClass}">${p.badge.toUpperCase()}</span>` : ""}
      <button class="wishlist-btn ${wished ? "active" : ""}" onclick="toggleWishlist(event,'${p.id}')">${wished ? "❤️" : "🤍"}</button>
      <div class="product-img-wrap">${CAT_ICONS[p.category] || "🏏"}</div>
      <div class="product-body">
        <div class="product-brand-tag">${p.brand}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating"><span class="stars-row">${stars}</span><span class="stars-count">(${p.reviews || 0})</span></div>
        <div class="product-footer">
          <div><div class="price-main">₹${Number(p.price).toLocaleString("en-IN")}</div>${p.oldPrice ? `<div class="price-old">₹${Number(p.oldPrice).toLocaleString("en-IN")}</div>` : ""}${discount ? `<div class="discount-tag">${discount}% off</div>` : ""}</div>
          <button class="add-cart-btn" onclick="addToCart(event,'${p.id}')">+</button>
        </div>
      </div>
    </article>`;
  }).join("");
}

function toggleWishlist(event, id){
  event.stopPropagation();
  wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id);
  localStorage.setItem("cs_wishlist", JSON.stringify([...wishlist]));
  showToast(wishlist.has(id) ? "Wishlist mein add kiya" : "Wishlist se hataya", "info");
  renderProducts();
}

function openProductModal(id){
  const p = allProducts.find(item => item.id === id);
  if(!p) return;
  const rating = Math.max(0, Math.min(5, Math.floor(p.rating || 4)));
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  document.getElementById("productModalContent").innerHTML = `
    <div class="panel-header"><h3>${CAT_NAMES[p.category] || "Product"}</h3><button onclick="closeProductModal()">✕</button></div>
    <div class="product-modal-body">
      <div class="product-modal-img">${CAT_ICONS[p.category] || "🏏"}</div>
      <div class="product-modal-info">
        <div class="brand-tag">${p.brand}</div>
        <h2>${p.name}</h2>
        <div style="color:var(--gold)">${stars} <span style="color:var(--muted);font-size:12px">${p.reviews || 0} reviews</span></div>
        <div class="modal-price">₹${Number(p.price).toLocaleString("en-IN")}</div>
        ${p.oldPrice ? `<div class="modal-price-old">MRP ₹${Number(p.oldPrice).toLocaleString("en-IN")} ${discount ? `(${discount}% off)` : ""}</div>` : ""}
        <p>${p.description}</p>
        <button class="modal-add-btn" onclick="addToCart(event,'${p.id}');closeProductModal()">Cart Mein Daalo</button>
      </div>
    </div>`;
  openOverlay("productModal");
}

function closeProductModal(){ closeOverlay("productModal"); }

function addToCart(event, id){
  if(event) event.stopPropagation();
  const product = allProducts.find(p => p.id === id);
  if(!product) return;
  const existing = cart.find(item => item.id === id);
  existing ? existing.qty++ : cart.push({...product, qty:1});
  saveCart();
  updateCartUI();
  showToast("Cart mein add ho gaya");
}

function removeFromCart(id){
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) removeFromCart(id);
  saveCart();
  updateCartUI();
}

function updateCartUI(){
  const totalItems = cart.reduce((sum,item) => sum + item.qty, 0);
  const badge = document.getElementById("cartBadge");
  badge.textContent = totalItems;
  badge.classList.toggle("hidden", totalItems === 0);
  const cartItems = document.getElementById("cartItems");
  const footer = document.getElementById("cartFooter");
  if(cart.length === 0){
    cartItems.innerHTML = `<div class="cart-empty"><div class="empty-icon">🛒</div><p>Aapka cart khaali hai</p></div>`;
    footer.classList.add("hidden");
    return;
  }
  footer.classList.remove("hidden");
  cartItems.innerHTML = cart.map(item => `<div class="cart-item">
    <div class="cart-icon">${CAT_ICONS[item.category] || "🏏"}</div>
    <div><div class="cart-name">${item.name}</div><div class="cart-brand">${item.brand}</div><div class="cart-controls"><button onclick="changeQty('${item.id}',-1)">-</button><b>${item.qty}</b><button onclick="changeQty('${item.id}',1)">+</button></div></div>
    <div class="cart-price">₹${(item.price * item.qty).toLocaleString("en-IN")}</div>
    <button class="cart-remove" onclick="removeFromCart('${item.id}')">✕</button>
  </div>`).join("");
  const subtotal = cart.reduce((sum,item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  document.getElementById("cartSubtotal").textContent = "₹" + subtotal.toLocaleString("en-IN");
  document.getElementById("cartShipping").textContent = shipping ? "₹" + shipping : "FREE";
  document.getElementById("cartTotal").textContent = "₹" + (subtotal + shipping).toLocaleString("en-IN");
}

function saveCart(){ localStorage.setItem("cs_cart", JSON.stringify(cart)); }
function openCart(){ document.getElementById("cartOverlay").classList.add("open"); document.getElementById("cartSidebar").classList.add("open"); }
function closeCart(){ document.getElementById("cartOverlay").classList.remove("open"); document.getElementById("cartSidebar").classList.remove("open"); }

function checkout(){
  if(!currentUser){
    closeCart();
    showToast("Checkout ke liye pehle login karein", "info");
    setTimeout(openAuthModal, 400);
    return;
  }
  cart = [];
  saveCart();
  updateCartUI();
  closeCart();
  showToast("Order place ho gaya! Dhanyawad", "success");
}

function openOverlay(id){
  const modal = document.getElementById(id);
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.add("open"), 10);
}

function closeOverlay(id){
  const modal = document.getElementById(id);
  modal.classList.remove("open");
  setTimeout(() => modal.classList.add("hidden"), 250);
}

function openAuthModal(){ openOverlay("authModal"); }
function closeAuthModal(){ closeOverlay("authModal"); }

function switchAuthTab(tab){
  document.getElementById("loginForm").classList.toggle("hidden", tab !== "login");
  document.getElementById("registerForm").classList.toggle("hidden", tab !== "register");
  document.getElementById("tabLogin").classList.toggle("active", tab === "login");
  document.getElementById("tabRegister").classList.toggle("active", tab === "register");
}

function loginUser(){
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  if(!email || !password){ showToast("Email aur password dalein", "error"); return; }
  currentUser = {uid:"demo", email, displayName:email.split("@")[0]};
  onUserLoggedIn(currentUser);
  closeAuthModal();
  showToast("Login ho gaye");
}

function registerUser(){
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  if(!name || !email || password.length < 6){ showToast("Valid details bharen", "error"); return; }
  currentUser = {uid:"demo", email, displayName:name};
  onUserLoggedIn(currentUser);
  closeAuthModal();
  showToast("Account ban gaya");
}

function loginGoogle(){
  currentUser = {uid:"google_demo", email:"demo@gmail.com", displayName:"Demo User"};
  onUserLoggedIn(currentUser);
  closeAuthModal();
  showToast("Google demo login ho gaya");
}

function logoutUser(){
  currentUser = null;
  const btn = document.getElementById("authBtn");
  btn.textContent = "Login";
  btn.classList.remove("active");
  btn.onclick = openAuthModal;
  document.getElementById("adminSection").classList.add("hidden");
}

function onUserLoggedIn(user){
  const btn = document.getElementById("authBtn");
  btn.textContent = `👋 ${user.displayName || user.email}`;
  btn.classList.add("active");
  btn.onclick = logoutUser;
  if(["admin@cricketstore.com","your-admin@email.com"].includes(user.email)){
    document.getElementById("adminSection").classList.remove("hidden");
    loadAdminProducts();
  }
}

function subscribeNewsletter(){
  const email = document.getElementById("promoEmail").value.trim();
  if(!email.includes("@")){ showToast("Valid email dalein", "error"); return; }
  document.getElementById("promoEmail").value = "";
  showToast("Subscribe ho gaye! 10% off code email pe bheja gaya");
}

async function addProduct(){
  const name = document.getElementById("aName").value.trim();
  const brand = document.getElementById("aBrand").value.trim();
  const category = document.getElementById("aCat").value;
  const price = Number(document.getElementById("aPrice").value);
  if(!name || !brand || !price){ showToast("Name, brand aur price zaruri hain", "error"); return; }
  const product = {
    id:"local_" + Date.now(),
    name, brand, category, price,
    oldPrice:Number(document.getElementById("aOldPrice").value) || null,
    description:document.getElementById("aDesc").value.trim() || "Premium quality cricket equipment.",
    rating:Number(document.getElementById("aRating").value) || 4.5,
    badge:document.getElementById("aBadge").value,
    reviews:0
  };
  localProducts.unshift(product);
  allProducts = [...localProducts];
  ["aName","aBrand","aPrice","aOldPrice","aDesc","aRating"].forEach(id => document.getElementById(id).value = "");
  applyFilters();
  updateCategoryCounts();
  updateStats();
  loadAdminProducts();
  showToast("Product add ho gaya");
}

function deleteProduct(id){
  if(!confirm("Kya aap yeh product delete karna chahte hain?")) return;
  localProducts = localProducts.filter(p => p.id !== id);
  allProducts = [...localProducts];
  applyFilters();
  updateCategoryCounts();
  updateStats();
  loadAdminProducts();
}

function loadAdminProducts(){
  document.getElementById("adminProductCount").textContent = localProducts.length;
  document.getElementById("adminProductsList").innerHTML = localProducts.map(p => `<div class="admin-product-item">
    <div>${CAT_ICONS[p.category] || "🏏"}</div><div><b>${p.name}</b><small style="display:block;color:var(--muted)">${p.brand} • ${CAT_NAMES[p.category]}</small></div><div class="admin-product-price">₹${p.price.toLocaleString("en-IN")}</div><button class="admin-del-btn" onclick="deleteProduct('${p.id}')">✕</button>
  </div>`).join("");
}

function openSearch(){
  document.getElementById("searchBarWrap").scrollIntoView({behavior:"smooth"});
  setTimeout(() => document.getElementById("searchInput").focus(), 350);
}

function setNavActive(el){
  document.querySelectorAll(".nav-links a").forEach(a => a.classList.remove("active"));
  el.classList.add("active");
}

document.getElementById("productModal").addEventListener("click", event => {
  if(event.target.id === "productModal") closeProductModal();
});
document.getElementById("authModal").addEventListener("click", event => {
  if(event.target.id === "authModal") closeAuthModal();
});

function init(){
  initFirebase();
  try{ cart = JSON.parse(localStorage.getItem("cs_cart")) || []; }catch(error){ cart = []; }
  try{ wishlist = new Set(JSON.parse(localStorage.getItem("cs_wishlist")) || []); }catch(error){ wishlist = new Set(); }
  updateCartUI();
  loadProducts();
}

init();
