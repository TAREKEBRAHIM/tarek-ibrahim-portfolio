let currentUser = null;
let customersCache = [];
let invoicesCache = [];
let usersCache = [];
let revenueChartInstance = null;
let planChartInstance = null;

function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2500);
}

function avatarUrl(seed) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=4f46e5`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// ===== Auth Guard & Profile =====
async function loadProfile() {
  const data = await api.get("/auth/me");
  currentUser = data.user;
  document.getElementById("profileName").textContent = currentUser.name;
  document.getElementById("profileEmail").textContent = currentUser.email;
  document.getElementById("profileAvatar").src = avatarUrl(currentUser.seed || currentUser.name);
  document.getElementById("rolePill").textContent = currentUser.role;

  document.getElementById("settingsName").textContent = currentUser.name;
  document.getElementById("settingsEmail").textContent = currentUser.email;
  document.getElementById("settingsRole").textContent = currentUser.role;
  document.getElementById("settingsJoined").textContent = formatDate(currentUser.createdAt);

  if (currentUser.role === "admin") {
    document.getElementById("teamNavLabel").hidden = false;
    document.getElementById("teamNavItem").hidden = false;
  }
}

// ===== Navigation =====
function initNavigation() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  document.getElementById("sidebarOpen").addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  });
  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }
  document.getElementById("sidebarClose").addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
      item.classList.add("active");
      document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
      document.getElementById(section).classList.add("active");
      document.getElementById("pageTitle").textContent = item.querySelector("span").textContent;
      closeSidebar();
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearSession();
    window.location.href = "/login.html";
  });
}

// ===== Overview =====
async function loadOverview() {
  const stats = await api.get("/stats/overview");
  document.getElementById("statCustomers").textContent = stats.totalCustomers;
  document.getElementById("statActive").textContent = stats.activeSubscriptions;
  document.getElementById("statMrr").textContent = `$${stats.mrr.toLocaleString()}`;
  document.getElementById("statChurn").textContent = `${stats.churnRate}%`;
  renderCharts(stats);
}

function renderCharts(stats) {
  const ctxRevenue = document.getElementById("revenueChart");
  const ctxPlan = document.getElementById("planChart");
  if (revenueChartInstance) revenueChartInstance.destroy();
  if (planChartInstance) planChartInstance.destroy();

  revenueChartInstance = new Chart(ctxRevenue, {
    type: "bar",
    data: {
      labels: stats.revenueTrend.map((r) => r.label),
      datasets: [{
        label: "Revenue",
        data: stats.revenueTrend.map((r) => r.total),
        backgroundColor: "#4f46e5",
        borderRadius: 6,
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { color: "#e5e7eb" } }, x: { grid: { display: false } } },
    },
  });

  planChartInstance = new Chart(ctxPlan, {
    type: "doughnut",
    data: {
      labels: stats.plansBreakdown.map((p) => p.plan),
      datasets: [{
        data: stats.plansBreakdown.map((p) => p.count),
        backgroundColor: ["#4f46e5", "#9333ea", "#16a34a", "#ea580c"],
        borderWidth: 0,
      }],
    },
    options: {
      plugins: { legend: { position: "bottom", labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
      cutout: "65%",
    },
  });
}

// ===== Activity =====
function activityItemHtml(a) {
  const time = new Date(a.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return `<li><span class="activity-dot ${a.type}"></span><div><div>${a.message}</div><small>${time}</small></div></li>`;
}

async function loadActivity() {
  const data = await api.get("/activity");
  document.getElementById("activityPreview").innerHTML = data.activity.slice(0, 5).map(activityItemHtml).join("");
  document.getElementById("activityFull").innerHTML = data.activity.map(activityItemHtml).join("");
}

// ===== Customers =====
async function loadCustomers() {
  const data = await api.get("/customers");
  customersCache = data.customers;
  renderCustomersTable();
  populateInvoiceCustomerSelect();
}

function renderCustomersTable() {
  const search = document.getElementById("customerSearch").value.toLowerCase();
  const statusFilter = document.getElementById("customerStatusFilter").value;
  const tbody = document.querySelector("#customersTable tbody");
  tbody.innerHTML = "";

  customersCache
    .filter((c) => (c.name + c.company + c.email).toLowerCase().includes(search))
    .filter((c) => statusFilter === "all" || c.status === statusFilter)
    .forEach((c) => {
      tbody.innerHTML += `
        <tr>
          <td>${c.name}</td>
          <td>${c.company}</td>
          <td>${c.plan}</td>
          <td>$${c.mrr}</td>
          <td><span class="status-pill ${c.status}">${c.status}</span></td>
          <td>${formatDate(c.joinedAt)}</td>
          <td class="row-actions">
            <button class="action-btn" data-edit-customer="${c.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn danger" data-delete-customer="${c.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`;
    });

  tbody.querySelectorAll("[data-edit-customer]").forEach((b) => b.addEventListener("click", () => openCustomerModal(Number(b.dataset.editCustomer))));
  tbody.querySelectorAll("[data-delete-customer]").forEach((b) => b.addEventListener("click", () => deleteCustomer(Number(b.dataset.deleteCustomer))));
}

function openCustomerModal(id) {
  const form = document.getElementById("customerForm");
  form.reset();
  document.getElementById("customerModalTitle").textContent = id ? "Edit Customer" : "Add Customer";
  form.elements.id.value = id || "";

  if (id) {
    const c = customersCache.find((cust) => cust.id === id);
    form.elements.name.value = c.name;
    form.elements.email.value = c.email;
    form.elements.company.value = c.company;
    form.elements.plan.value = c.plan;
    form.elements.status.value = c.status;
    form.elements.mrr.value = c.mrr;
  }
  document.getElementById("customerModal").classList.add("open");
}

async function deleteCustomer(id) {
  try {
    await api.delete(`/customers/${id}`);
    showToast("Customer deleted");
    await loadCustomers();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ===== Invoices =====
function populateInvoiceCustomerSelect() {
  const select = document.getElementById("invoiceCustomerSelect");
  select.innerHTML = customersCache.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

async function loadInvoices() {
  const data = await api.get("/invoices");
  invoicesCache = data.invoices;
  renderInvoicesTable();
}

function renderInvoicesTable() {
  const tbody = document.querySelector("#invoicesTable tbody");
  tbody.innerHTML = "";
  invoicesCache.forEach((inv) => {
    tbody.innerHTML += `
      <tr>
        <td>#INV-${String(inv.id).padStart(4, "0")}</td>
        <td>${inv.customerName}</td>
        <td>$${inv.amount}</td>
        <td>${formatDate(inv.date)}</td>
        <td><span class="status-pill ${inv.status}">${inv.status}</span></td>
        <td class="row-actions">
          <button class="action-btn danger" data-delete-invoice="${inv.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`;
  });
  tbody.querySelectorAll("[data-delete-invoice]").forEach((b) => b.addEventListener("click", () => deleteInvoice(Number(b.dataset.deleteInvoice))));
}

async function deleteInvoice(id) {
  try {
    await api.delete(`/invoices/${id}`);
    showToast("Invoice deleted");
    await loadInvoices();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ===== Team / Users (admin) =====
async function loadUsers() {
  if (currentUser.role !== "admin") return;
  const data = await api.get("/users");
  usersCache = data.users;
  renderUsersTable();
}

function renderUsersTable() {
  const tbody = document.querySelector("#usersTable tbody");
  tbody.innerHTML = "";
  usersCache.forEach((u) => {
    tbody.innerHTML += `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><span class="status-pill ${u.role}">${u.role}</span></td>
        <td>${formatDate(u.createdAt)}</td>
        <td class="row-actions">
          <button class="action-btn danger" data-delete-user="${u.id}" title="Remove"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`;
  });
  tbody.querySelectorAll("[data-delete-user]").forEach((b) => b.addEventListener("click", () => deleteUser(Number(b.dataset.deleteUser))));
}

async function deleteUser(id) {
  try {
    await api.delete(`/users/${id}`);
    showToast("Team member removed");
    await loadUsers();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ===== Modals & Forms =====
function initModals() {
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".modal").classList.remove("open"));
  });
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });
  });

  document.getElementById("addCustomerBtn").addEventListener("click", () => openCustomerModal(null));
  document.getElementById("addInvoiceBtn").addEventListener("click", () => document.getElementById("invoiceModal").classList.add("open"));
  document.getElementById("addUserBtn").addEventListener("click", () => document.getElementById("userModal").classList.add("open"));

  document.getElementById("customerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const id = form.get("id");
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      company: form.get("company"),
      plan: form.get("plan"),
      status: form.get("status"),
      mrr: form.get("mrr"),
    };
    try {
      if (id) await api.put(`/customers/${id}`, payload);
      else await api.post("/customers", payload);
      document.getElementById("customerModal").classList.remove("open");
      showToast(id ? "Customer updated" : "Customer added");
      await loadCustomers();
      await loadOverview();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  document.getElementById("invoiceForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      await api.post("/invoices", {
        customerId: form.get("customerId"),
        amount: form.get("amount"),
        status: form.get("status"),
      });
      document.getElementById("invoiceModal").classList.remove("open");
      e.target.reset();
      showToast("Invoice created");
      await loadInvoices();
      await loadOverview();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      await api.post("/users", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role"),
      });
      document.getElementById("userModal").classList.remove("open");
      e.target.reset();
      showToast("Team member added");
      await loadUsers();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

function initFilters() {
  document.getElementById("customerSearch").addEventListener("input", renderCustomersTable);
  document.getElementById("customerStatusFilter").addEventListener("change", renderCustomersTable);
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", async () => {
  if (!getToken()) {
    window.location.href = "/login.html";
    return;
  }

  initNavigation();
  initModals();
  initFilters();

  try {
    await loadProfile();
    await Promise.all([loadOverview(), loadActivity(), loadCustomers(), loadInvoices()]);
    await loadUsers();
  } catch (err) {
    showToast(err.message, true);
  }
});
