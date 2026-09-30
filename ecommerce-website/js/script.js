// ===== Product Data =====
const products = [
  { id: 1, name: "Classic Denim Jacket", category: "men", price: 79.99, oldPrice: 99.99, rating: 4.5, reviews: 128, badge: "Sale", seed: "denim-jacket", desc: "A timeless denim jacket crafted from premium cotton for everyday wear." },
  { id: 2, name: "Floral Summer Dress", category: "women", price: 54.99, oldPrice: null, rating: 4.8, reviews: 212, badge: "New", seed: "summer-dress", desc: "Lightweight floral dress perfect for warm days and casual outings." },
  { id: 3, name: "Leather Crossbody Bag", category: "accessories", price: 64.5, oldPrice: 89.0, rating: 4.3, reviews: 87, badge: "Sale", seed: "crossbody-bag", desc: "Genuine leather crossbody bag with adjustable strap and secure zip." },
  { id: 4, name: "Running Sneakers", category: "footwear", price: 89.99, oldPrice: null, rating: 4.7, reviews: 340, badge: null, seed: "running-sneakers", desc: "Breathable mesh sneakers engineered for comfort and performance." },
  { id: 5, name: "Slim Fit Chinos", category: "men", price: 45.0, oldPrice: null, rating: 4.2, reviews: 76, badge: null, seed: "chinos", desc: "Versatile slim fit chinos made from stretch cotton blend fabric." },
  { id: 6, name: "Silk Blouse", category: "women", price: 62.0, oldPrice: 78.0, rating: 4.6, reviews: 154, badge: "Sale", seed: "silk-blouse", desc: "Elegant silk blouse suitable for both office and evening wear." },
  { id: 7, name: "Aviator Sunglasses", category: "accessories", price: 39.99, oldPrice: null, rating: 4.4, reviews: 98, badge: "New", seed: "sunglasses", desc: "UV-protected aviator sunglasses with a polished metal frame." },
  { id: 8, name: "Leather Chelsea Boots", category: "footwear", price: 110.0, oldPrice: 140.0, rating: 4.9, reviews: 265, badge: "Sale", seed: "chelsea-boots", desc: "Handcrafted leather chelsea boots with durable rubber sole." },
  { id: 9, name: "Cotton Graphic Tee", category: "men", price: 24.99, oldPrice: null, rating: 4.1, reviews: 63, badge: null, seed: "graphic-tee", desc: "Soft cotton t-shirt featuring an exclusive urban graphic print." },
  { id: 10, name: "High-Waist Jeans", category: "women", price: 58.0, oldPrice: null, rating: 4.5, reviews: 189, badge: "New", seed: "high-waist-jeans", desc: "Flattering high-waist jeans with a comfortable stretch fit." },
  { id: 11, name: "Minimalist Watch", category: "accessories", price: 95.0, oldPrice: 120.0, rating: 4.8, reviews: 301, badge: "Sale", seed: "watch", desc: "Minimalist analog watch with genuine leather strap." },
  { id: 12, name: "Canvas Slip-Ons", category: "footwear", price: 34.99, oldPrice: null, rating: 4.0, reviews: 54, badge: null, seed: "slip-ons", desc: "Comfortable canvas slip-on shoes for casual everyday style." },
];

// ===== State (persisted) =====
let cart = JSON.parse(localStorage.getItem("urbanza-cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("urbanza-wishlist") || "[]");
let currentFilter = "all";
let currentSort = "default";
let currentSearch = "";

function persist() {
  localStorage.setItem("urbanza-cart", JSON.stringify(cart));
  localStorage.setItem("urbanza-wishlist", JSON.stringify(wishlist));
}

function productImage(seed) {
  return `https://picsum.photos/seed/urbanza-${seed}/400/400`;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ===== Rendering Products =====
function getVisibleProducts() {
  let list = products.filter((p) => currentFilter === "all" || p.category === currentFilter);
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  switch (currentSort) {
    case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
    case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
    case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
  }
  return list;
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  const noResults = document.getElementById("noResults");
  const list = getVisibleProducts();

  grid.innerHTML = "";
  noResults.hidden = list.length !== 0;

  list.forEach((p) => {
    const inWishlist = wishlist.includes(p.id);
    const stars = renderStars(p.rating);
    grid.innerHTML += `
      <div class="product-card" data-id="${p.id}">
        <div class="product-media">
          <img src="${productImage(p.seed)}" alt="${p.name}">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
          <div class="product-quick-actions">
            <button class="wishlist-toggle ${inWishlist ? "active" : ""}" data-id="${p.id}" title="Add to wishlist"><i class="fa-solid fa-heart"></i></button>
            <button class="quick-view-btn" data-id="${p.id}" title="Quick view"><i class="fa-solid fa-eye"></i></button>
          </div>
        </div>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-rating">${stars} <span>(${p.reviews})</span></div>
          <div class="product-footer">
            <div class="product-price">$${p.price.toFixed(2)}${p.oldPrice ? `<span class="old-price">$${p.oldPrice.toFixed(2)}</span>` : ""}</div>
            <button class="add-to-cart-btn" data-id="${p.id}" title="Add to cart"><i class="fa-solid fa-cart-plus"></i></button>
          </div>
        </div>
      </div>`;
  });

  grid.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });
  grid.querySelectorAll(".wishlist-toggle").forEach((btn) => {
    btn.addEventListener("click", () => toggleWishlist(Number(btn.dataset.id)));
  });
  grid.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", () => openQuickView(Number(btn.dataset.id)));
  });
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let html = "";
  for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
  if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
  for (let i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="fa-regular fa-star"></i>';
  return html;
}

// ===== Cart =====
function addToCart(id) {
  const existing = cart.find((c) => c.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  persist();
  renderCart();
  showToast("Added to cart");
}

function updateQty(id, delta) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((c) => c.id !== id);
  persist();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((c) => c.id !== id);
  persist();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, c) => {
    const p = products.find((prod) => prod.id === c.id);
    return sum + (p ? p.price * c.qty : 0);
  }, 0);
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const emptyEl = document.getElementById("cartEmpty");
  const countEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("cartSubtotal");

  countEl.textContent = cart.reduce((sum, c) => sum + c.qty, 0);
  emptyEl.classList.toggle("show", cart.length === 0);
  itemsEl.innerHTML = "";

  cart.forEach((c) => {
    const p = products.find((prod) => prod.id === c.id);
    if (!p) return;
    itemsEl.innerHTML += `
      <div class="cart-item">
        <img src="${productImage(p.seed)}" alt="${p.name}">
        <div class="cart-item-info">
          <strong>${p.name}</strong>
          <span>$${p.price.toFixed(2)}</span>
          <div class="qty-control">
            <button data-dec="${p.id}">-</button>
            <span>${c.qty}</span>
            <button data-inc="${p.id}">+</button>
          </div>
        </div>
        <button class="remove-item" data-remove="${p.id}"><i class="fa-solid fa-trash"></i></button>
      </div>`;
  });

  itemsEl.querySelectorAll("[data-inc]").forEach((b) => b.addEventListener("click", () => updateQty(Number(b.dataset.inc), 1)));
  itemsEl.querySelectorAll("[data-dec]").forEach((b) => b.addEventListener("click", () => updateQty(Number(b.dataset.dec), -1)));
  itemsEl.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => removeFromCart(Number(b.dataset.remove))));

  subtotalEl.textContent = `$${cartTotal().toFixed(2)}`;
}

// ===== Wishlist =====
function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter((w) => w !== id);
    showToast("Removed from wishlist");
  } else {
    wishlist.push(id);
    showToast("Added to wishlist");
  }
  persist();
  renderWishlist();
  renderProducts();
}

function renderWishlist() {
  const itemsEl = document.getElementById("wishlistItems");
  const emptyEl = document.getElementById("wishlistEmpty");
  const countEl = document.getElementById("wishlistCount");

  countEl.textContent = wishlist.length;
  emptyEl.classList.toggle("show", wishlist.length === 0);
  itemsEl.innerHTML = "";

  wishlist.forEach((id) => {
    const p = products.find((prod) => prod.id === id);
    if (!p) return;
    itemsEl.innerHTML += `
      <div class="cart-item">
        <img src="${productImage(p.seed)}" alt="${p.name}">
        <div class="cart-item-info">
          <strong>${p.name}</strong>
          <span>$${p.price.toFixed(2)}</span>
          <div class="wishlist-item-actions">
            <button class="primary" data-move="${p.id}">Add to Cart</button>
            <button data-remove-wish="${p.id}">Remove</button>
          </div>
        </div>
      </div>`;
  });

  itemsEl.querySelectorAll("[data-move]").forEach((b) => b.addEventListener("click", () => {
    addToCart(Number(b.dataset.move));
  }));
  itemsEl.querySelectorAll("[data-remove-wish]").forEach((b) => b.addEventListener("click", () => toggleWishlist(Number(b.dataset.removeWish))));
}

// ===== Quick View =====
function openQuickView(id) {
  const p = products.find((prod) => prod.id === id);
  if (!p) return;
  const inWishlist = wishlist.includes(p.id);
  document.getElementById("quickViewBody").innerHTML = `
    <div class="qv-image"><img src="${productImage(p.seed)}" alt="${p.name}"></div>
    <div class="qv-info">
      <span class="product-category">${p.category}</span>
      <h2>${p.name}</h2>
      <div class="product-rating">${renderStars(p.rating)} <span>(${p.reviews} reviews)</span></div>
      <p class="desc">${p.desc}</p>
      <div class="qv-price">$${p.price.toFixed(2)} ${p.oldPrice ? `<span class="old-price">$${p.oldPrice.toFixed(2)}</span>` : ""}</div>
      <div class="qv-actions">
        <button class="btn-primary" id="qvAddToCart"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
        <button class="btn-outline" id="qvWishlist"><i class="fa-solid fa-heart"></i> ${inWishlist ? "Wishlisted" : "Wishlist"}</button>
      </div>
    </div>`;
  document.getElementById("qvAddToCart").addEventListener("click", () => addToCart(p.id));
  document.getElementById("qvWishlist").addEventListener("click", () => { toggleWishlist(p.id); openQuickView(p.id); });
  document.getElementById("quickViewModal").classList.add("open");
}

// ===== Sidebars =====
function initSidebars() {
  const overlay = document.getElementById("overlay");
  const cartPanel = document.getElementById("cartPanel");
  const wishlistPanel = document.getElementById("wishlistPanel");
  const nav = document.getElementById("mainNav");
  const menuToggle = document.getElementById("menuToggle");
  let opener = null;

  function closeAll(restoreFocus = false) {
    cartPanel.classList.remove("open");
    wishlistPanel.classList.remove("open");
    nav.classList.remove("open");
    overlay.classList.remove("show");
    menuToggle.setAttribute("aria-expanded", "false");
    if (restoreFocus && opener) opener.focus();
  }
  function openPanel(panel, trigger) {
    closeAll();
    opener = trigger;
    panel.classList.add("open");
    overlay.classList.add("show");
  }
  document.getElementById("cartBtn").addEventListener("click", e => openPanel(cartPanel, e.currentTarget));
  document.getElementById("wishlistBtn").addEventListener("click", e => openPanel(wishlistPanel, e.currentTarget));
  document.getElementById("closeCart").addEventListener("click", () => closeAll(true));
  document.getElementById("closeWishlist").addEventListener("click", () => closeAll(true));
  document.getElementById("menuClose").addEventListener("click", () => closeAll(true));
  overlay.addEventListener("click", () => closeAll(true));
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeAll()));
  menuToggle.addEventListener("click", () => {
    if (nav.classList.contains("open")) return closeAll(true);
    openPanel(nav, menuToggle);
    menuToggle.setAttribute("aria-expanded", "true");
    document.getElementById("menuClose").focus();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.classList.contains("show")) closeAll(true);
  });
  window.matchMedia("(max-width: 1000px)").addEventListener("change", () => {
    if (nav.classList.contains("open")) closeAll();
  });
}

// ===== Modals =====
function initModals() {
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".modal").classList.remove("open"));
  });
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });
  });

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (cart.length === 0) { showToast("Your cart is empty"); return; }
    document.getElementById("checkoutTotal").textContent = `$${cartTotal().toFixed(2)}`;
    document.getElementById("cartPanel").classList.remove("open");
    document.getElementById("overlay").classList.remove("show");
    document.getElementById("checkoutModal").classList.add("open");
  });

  document.getElementById("checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    cart = [];
    persist();
    renderCart();
    e.target.reset();
    document.getElementById("checkoutModal").classList.remove("open");
    showToast("Order placed successfully!");
  });
}

// ===== Filters / Sorting / Search =====
function initFilters() {
  document.querySelectorAll(".nav-link[data-filter], .category-card[data-filter]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (el.classList.contains("nav-link")) e.preventDefault();
      setFilter(el.dataset.filter);
      document.getElementById("products").scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => setFilter(chip.dataset.filter));
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  document.getElementById("searchInput").addEventListener("input", (e) => {
    currentSearch = e.target.value;
    renderProducts();
  });
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.filter === filter));
  document.querySelectorAll(".nav-link[data-filter]").forEach((n) => n.classList.toggle("active", n.dataset.filter === filter));
  renderProducts();
}

// ===== Countdown =====
function initCountdown() {
  const end = Date.now() + 1000 * 60 * 60 * 26; // ~26 hours from load
  function update() {
    const diff = Math.max(0, end - Date.now());
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    document.getElementById("cd-hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("cd-minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("cd-seconds").textContent = String(seconds).padStart(2, "0");
  }
  update();
  setInterval(update, 1000);
}

// ===== Newsletter =====
function initNewsletter() {
  document.getElementById("newsletterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    showToast("Subscribed successfully!");
  });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  initSidebars();
  initModals();
  initFilters();
  initCountdown();
  initNewsletter();

  renderProducts();
  renderCart();
  renderWishlist();
});
