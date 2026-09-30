// ===== Sample Data =====
const doctors = [
  { name: "Dr. Sarah Lee", specialty: "Cardiology", status: "On Duty", seed: "Sarah Lee" },
  { name: "Dr. James Park", specialty: "Pediatrics", status: "On Duty", seed: "James Park" },
  { name: "Dr. Amina Yusuf", specialty: "Dermatology", status: "Busy", seed: "Amina Yusuf" },
  { name: "Dr. Ben Carter", specialty: "Orthopedics", status: "On Duty", seed: "Ben Carter" },
  { name: "Dr. Lucia Wang", specialty: "Neurology", status: "Off Duty", seed: "Lucia Wang" },
  { name: "Dr. Omar Faruk", specialty: "General Medicine", status: "On Duty", seed: "Omar Faruk" },
];

const patients = [
  { name: "John Carter", age: 34, gender: "Male", condition: "Hypertension", phone: "+1 555 234 1123" },
  { name: "Maria Gomez", age: 28, gender: "Female", condition: "Routine Checkup", phone: "+1 555 934 7788" },
  { name: "Ken Watanabe", age: 45, gender: "Male", condition: "Diabetes Type 2", phone: "+1 555 122 9081" },
  { name: "Emily Stone", age: 19, gender: "Female", condition: "Allergy", phone: "+1 555 776 4432" },
  { name: "David Kim", age: 52, gender: "Male", condition: "Back Pain", phone: "+1 555 340 2210" },
  { name: "Nadia Hussain", age: 31, gender: "Female", condition: "Migraine", phone: "+1 555 883 5567" },
  { name: "Liam Turner", age: 8, gender: "Male", condition: "Fever", phone: "+1 555 220 9987" },
  { name: "Sofia Rossi", age: 60, gender: "Female", condition: "Arthritis", phone: "+1 555 665 1120" },
];

let appointments = [
  { patient: "John Carter", doctor: "Dr. Sarah Lee", date: "2026-09-29", time: "09:00", status: "Confirmed" },
  { patient: "Maria Gomez", doctor: "Dr. James Park", date: "2026-09-29", time: "10:30", status: "Pending" },
  { patient: "Ken Watanabe", doctor: "Dr. Omar Faruk", date: "2026-09-29", time: "11:15", status: "Confirmed" },
  { patient: "Emily Stone", doctor: "Dr. Amina Yusuf", date: "2026-09-29", time: "13:00", status: "Cancelled" },
  { patient: "David Kim", doctor: "Dr. Ben Carter", date: "2026-09-30", time: "14:20", status: "Confirmed" },
  { patient: "Nadia Hussain", doctor: "Dr. Lucia Wang", date: "2026-09-30", time: "15:45", status: "Pending" },
];

const pharmacyStock = [
  { name: "Paracetamol 500mg", category: "Painkiller", stock: 420, price: "$0.10", status: "InStock" },
  { name: "Amoxicillin 250mg", category: "Antibiotic", stock: 35, price: "$0.45", status: "Low" },
  { name: "Cetirizine 10mg", category: "Antihistamine", stock: 0, price: "$0.20", status: "Out" },
  { name: "Metformin 500mg", category: "Diabetes", stock: 210, price: "$0.15", status: "InStock" },
  { name: "Ibuprofen 400mg", category: "Painkiller", stock: 58, price: "$0.12", status: "Low" },
];

const billingRecords = [
  { id: "INV-1042", patient: "John Carter", amount: "$120.00", date: "2026-09-25", status: "Paid" },
  { id: "INV-1043", patient: "Maria Gomez", amount: "$85.00", date: "2026-09-26", status: "Unpaid" },
  { id: "INV-1044", patient: "Ken Watanabe", amount: "$230.00", date: "2026-09-27", status: "Paid" },
  { id: "INV-1045", patient: "Emily Stone", amount: "$60.00", date: "2026-09-28", status: "Unpaid" },
];

// ===== Utility =====
function avatarUrl(seed) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=2563eb,7c3aed,16a34a,ea580c`;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===== Sidebar / Navigation =====
function initNavigation() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  document.getElementById("sidebarOpen").addEventListener("click", () => {
    sidebar.classList.add("open");
    document.getElementById("sidebarOpen").setAttribute("aria-expanded", "true");
    overlay.classList.add("show");
  });
  document.getElementById("sidebarClose").addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      closeSidebar();
      document.getElementById("sidebarOpen").focus();
    }
  });
  window.matchMedia("(max-width: 900px)").addEventListener("change", closeSidebar);
  function closeSidebar() {
    sidebar.classList.remove("open");
    document.getElementById("sidebarOpen").setAttribute("aria-expanded", "false");
    overlay.classList.remove("show");
  }

  document.querySelectorAll(".nav-item, [data-section].link").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      if (!section) return;
      document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
      const navMatch = document.querySelector(`.nav-item[data-section="${section}"]`);
      if (navMatch) navMatch.classList.add("active");
      document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
      document.getElementById(section).classList.add("active");
      closeSidebar();
    });
  });
}

// ===== Clock =====
function initClock() {
  const el = document.getElementById("datetime");
  function update() {
    const now = new Date();
    el.textContent = now.toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }
  update();
  setInterval(update, 1000 * 30);
}

// ===== Theme =====
function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const switchEl = document.getElementById("darkModeSwitch");
  const saved = localStorage.getItem("clinic-theme") || "light";
  applyTheme(saved);

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    toggle.innerHTML = theme === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    switchEl.checked = theme === "dark";
    localStorage.setItem("clinic-theme", theme);
  }

  toggle.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });
  switchEl.addEventListener("change", () => {
    applyTheme(switchEl.checked ? "dark" : "light");
  });
}

// ===== Stats =====
function animateCount(el, target, prefix = "") {
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = prefix + current.toLocaleString();
  }, 25);
}

function initStats() {
  animateCount(document.getElementById("statPatients"), patients.length * 47);
  animateCount(document.getElementById("statAppointments"), appointments.filter(a => a.date === "2026-09-29").length + 12);
  animateCount(document.getElementById("statDoctors"), doctors.filter(d => d.status !== "Off Duty").length);
  animateCount(document.getElementById("statRevenue"), 48250, "$");
}

// ===== Charts =====
function initCharts() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  Chart.defaults.color = textColor;
  Chart.defaults.font.family = "Poppins";

  new Chart(document.getElementById("visitsChart"), {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Visits",
        data: [32, 45, 38, 52, 48, 61, 40],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.12)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: gridColor }, beginAtZero: true },
        x: { grid: { display: false } }
      }
    }
  });

  new Chart(document.getElementById("deptChart"), {
    type: "doughnut",
    data: {
      labels: ["Cardiology", "Pediatrics", "Dermatology", "Orthopedics", "Neurology"],
      datasets: [{
        data: [28, 22, 15, 20, 15],
        backgroundColor: ["#2563eb", "#16a34a", "#7c3aed", "#ea580c", "#dc2626"],
        borderWidth: 0,
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
      cutout: "65%",
    }
  });
}

// ===== Renderers =====
function renderUpcoming() {
  const tbody = document.querySelector("#upcomingTable tbody");
  tbody.innerHTML = "";
  appointments.slice(0, 5).forEach((a) => {
    tbody.innerHTML += `
      <tr>
        <td>${a.patient}</td>
        <td>${a.doctor}</td>
        <td>${a.time}</td>
        <td><span class="status-pill ${a.status}">${a.status}</span></td>
      </tr>`;
  });
}

function renderDoctorsOnDuty() {
  const list = document.getElementById("doctorsOnDuty");
  list.innerHTML = "";
  doctors.forEach((d) => {
    list.innerHTML += `
      <li>
        <img src="${avatarUrl(d.seed)}" alt="${d.name}">
        <div class="doc-info">
          <strong>${d.name}</strong>
          <small>${d.specialty}</small>
        </div>
        <span class="dot ${d.status === "Busy" ? "busy" : ""}" title="${d.status}"></span>
      </li>`;
  });
}

function renderAppointmentsTable(filterText = "", filterStatus = "all") {
  const tbody = document.querySelector("#appointmentsTable tbody");
  tbody.innerHTML = "";
  appointments
    .filter((a) => {
      const matchesText = (a.patient + a.doctor).toLowerCase().includes(filterText.toLowerCase());
      const matchesStatus = filterStatus === "all" || a.status === filterStatus;
      return matchesText && matchesStatus;
    })
    .forEach((a, i) => {
      tbody.innerHTML += `
        <tr>
          <td>${a.patient}</td>
          <td>${a.doctor}</td>
          <td>${a.date}</td>
          <td>${a.time}</td>
          <td><span class="status-pill ${a.status}">${a.status}</span></td>
          <td><button class="action-btn" data-remove="${i}" title="Cancel"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    });

  tbody.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.remove);
      appointments.splice(idx, 1);
      renderAppointmentsTable(document.getElementById("apptSearch").value, document.getElementById("apptStatusFilter").value);
      renderUpcoming();
      showToast("Appointment removed");
    });
  });
}

function renderPatientsGrid(filterText = "") {
  const grid = document.getElementById("patientsGrid");
  grid.innerHTML = "";
  patients
    .filter((p) => p.name.toLowerCase().includes(filterText.toLowerCase()))
    .forEach((p) => {
      grid.innerHTML += `
        <div class="patient-card">
          <img src="${avatarUrl(p.name)}" alt="${p.name}">
          <h4>${p.name}</h4>
          <p>${p.age} yrs &middot; ${p.gender}</p>
          <p>${p.condition}</p>
          <p><i class="fa-solid fa-phone"></i> ${p.phone}</p>
        </div>`;
    });
}

function renderDoctorsGrid() {
  const grid = document.getElementById("doctorsGrid");
  grid.innerHTML = "";
  doctors.forEach((d) => {
    grid.innerHTML += `
      <div class="doctor-card">
        <img src="${avatarUrl(d.seed)}" alt="${d.name}">
        <h4>${d.name}</h4>
        <p>${d.status}</p>
        <div class="specialty">${d.specialty}</div>
      </div>`;
  });
}

function renderPharmacy() {
  const tbody = document.querySelector("#pharmacyTable tbody");
  tbody.innerHTML = "";
  pharmacyStock.forEach((m) => {
    const label = m.status === "InStock" ? "In Stock" : m.status === "Low" ? "Low Stock" : "Out of Stock";
    tbody.innerHTML += `
      <tr>
        <td>${m.name}</td>
        <td>${m.category}</td>
        <td>${m.stock}</td>
        <td>${m.price}</td>
        <td><span class="status-pill ${m.status}">${label}</span></td>
      </tr>`;
  });
}

function renderBilling() {
  const tbody = document.querySelector("#billingTable tbody");
  tbody.innerHTML = "";
  billingRecords.forEach((b) => {
    tbody.innerHTML += `
      <tr>
        <td>${b.id}</td>
        <td>${b.patient}</td>
        <td>${b.amount}</td>
        <td>${b.date}</td>
        <td><span class="status-pill ${b.status}">${b.status}</span></td>
      </tr>`;
  });
}

function populateDoctorSelect() {
  const select = document.getElementById("apptDoctorSelect");
  select.innerHTML = doctors.map((d) => `<option value="${d.name}">${d.name}</option>`).join("");
}

// ===== Modals =====
function initModals() {
  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById(btn.dataset.openModal).classList.add("open");
    });
  });
  document.getElementById("newAppointmentBtn").addEventListener("click", () => {
    document.getElementById("appointmentModal").classList.add("open");
  });
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".modal").classList.remove("open"));
  });
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  });

  document.getElementById("appointmentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    appointments.unshift({
      patient: form.get("patient"),
      doctor: form.get("doctor"),
      date: form.get("date"),
      time: form.get("time"),
      status: form.get("status"),
    });
    renderAppointmentsTable();
    renderUpcoming();
    e.target.reset();
    document.getElementById("appointmentModal").classList.remove("open");
    showToast("Appointment added successfully");
  });

  document.getElementById("patientForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    patients.unshift({
      name: form.get("name"),
      age: form.get("age"),
      gender: form.get("gender"),
      condition: form.get("condition") || "General",
      phone: form.get("phone") || "N/A",
    });
    renderPatientsGrid();
    e.target.reset();
    document.getElementById("patientModal").classList.remove("open");
    showToast("Patient added successfully");
  });
}

// ===== Search & Filters =====
function initFilters() {
  document.getElementById("apptSearch").addEventListener("input", (e) => {
    renderAppointmentsTable(e.target.value, document.getElementById("apptStatusFilter").value);
  });
  document.getElementById("apptStatusFilter").addEventListener("change", (e) => {
    renderAppointmentsTable(document.getElementById("apptSearch").value, e.target.value);
  });
  document.getElementById("patientSearch").addEventListener("input", (e) => {
    renderPatientsGrid(e.target.value);
  });
  document.getElementById("searchInput").addEventListener("input", (e) => {
    const q = e.target.value.trim();
    if (!q) return;
    // Global search jumps to patients tab and filters
    document.querySelector('.nav-item[data-section="patients"]').click();
    document.getElementById("patientSearch").value = q;
    renderPatientsGrid(q);
  });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initClock();
  initTheme();
  initModals();
  initFilters();

  initStats();
  renderUpcoming();
  renderDoctorsOnDuty();
  renderAppointmentsTable();
  renderPatientsGrid();
  renderDoctorsGrid();
  renderPharmacy();
  renderBilling();
  populateDoctorSelect();

  // Chart.js loaded with defer; wait a tick to ensure availability
  if (typeof Chart !== "undefined") {
    initCharts();
  } else {
    window.addEventListener("load", initCharts);
  }
});
