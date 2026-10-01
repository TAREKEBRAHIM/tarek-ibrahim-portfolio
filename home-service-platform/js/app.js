'use strict';

const storageKey = 'khedma-demo-requests-v1';
const today = new Date();
const dateOffset = days => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const technicians = [
  { name: 'محمود حسن', initial: 'م', trade: 'تكييف وأجهزة', rating: '4.9', jobs: 128, available: true },
  { name: 'كريم فتحي', initial: 'ك', trade: 'سباكة', rating: '4.8', jobs: 96, available: false },
  { name: 'أحمد نبيل', initial: 'أ', trade: 'كهرباء', rating: '4.9', jobs: 114, available: true },
  { name: 'يوسف عادل', initial: 'ي', trade: 'تنظيف وصيانة', rating: '4.7', jobs: 83, available: true },
  { name: 'شريف مجدي', initial: 'ش', trade: 'تكييف', rating: '4.8', jobs: 72, available: false },
  { name: 'هاني سعيد', initial: 'ه', trade: 'سباكة وأجهزة', rating: '4.9', jobs: 101, available: true }
];

const seedRequests = [
  { id: 'KD-2408', customer: 'منى إبراهيم', service: 'صيانة تكييف', area: 'المعادي', technician: 'محمود حسن', date: dateOffset(0), price: 850, status: 'progress' },
  { id: 'KD-2407', customer: 'ياسر فؤاد', service: 'سباكة', area: 'مدينة نصر', technician: 'كريم فتحي', date: dateOffset(0), price: 420, status: 'new' },
  { id: 'KD-2406', customer: 'سارة محمود', service: 'كهرباء', area: 'مصر الجديدة', technician: 'أحمد نبيل', date: dateOffset(0), price: 600, status: 'progress' },
  { id: 'KD-2405', customer: 'علي منصور', service: 'تنظيف منزل', area: 'الزمالك', technician: 'يوسف عادل', date: dateOffset(1), price: 1200, status: 'done' },
  { id: 'KD-2404', customer: 'هدى مصطفى', service: 'صيانة أجهزة', area: 'التجمع الخامس', technician: 'شريف مجدي', date: dateOffset(1), price: 750, status: 'new' },
  { id: 'KD-2403', customer: 'زياد سامح', service: 'صيانة تكييف', area: 'الدقي', technician: 'محمود حسن', date: dateOffset(-1), price: 950, status: 'done' },
  { id: 'KD-2402', customer: 'نورهان عادل', service: 'سباكة', area: 'المهندسين', technician: 'كريم فتحي', date: dateOffset(-1), price: 500, status: 'progress' },
  { id: 'KD-2401', customer: 'طارق أمين', service: 'كهرباء', area: 'شيراتون', technician: 'أحمد نبيل', date: dateOffset(-2), price: 380, status: 'done' }
];

let requests;
try {
  const savedRequests = JSON.parse(localStorage.getItem(storageKey));
  requests = Array.isArray(savedRequests) ? savedRequests : seedRequests;
} catch {
  requests = seedRequests;
}
let activeFilter = 'all';
let toastTimer;

const statusLabels = { new: 'جديد', progress: 'قيد التنفيذ', done: 'مكتمل', cancelled: 'ملغي' };
const serviceIcons = { 'صيانة تكييف': '❄', 'سباكة': '⌁', 'كهرباء': 'ϟ', 'تنظيف منزل': '✳', 'صيانة أجهزة': '◈' };
const serviceClasses = { 'سباكة': 'plumbing', 'كهرباء': 'electric', 'تنظيف منزل': 'cleaning' };
const formatPrice = price => `${Number(price || 0).toLocaleString('ar-EG')} ج.م`;
const formatDate = value => new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const persist = () => localStorage.setItem(storageKey, JSON.stringify(requests));

function serviceMarkup(request) {
  const icon = serviceIcons[request.service] || '⌂';
  const serviceClass = serviceClasses[request.service] || '';
  return `<div class="request-name"><span class="service-icon ${serviceClass}" aria-hidden="true">${icon}</span><span><strong>${escapeHtml(request.id)}</strong><small>${escapeHtml(request.customer)}</small></span></div>`;
}

function statusMarkup(status) {
  return `<span class="status-badge status-${status}">${statusLabels[status] || 'جديد'}</span>`;
}

function nextAction(request) {
  if (request.status === 'new') return ['progress', 'بدء التنفيذ', '↗'];
  if (request.status === 'progress') return ['done', 'إكمال الطلب', '✓'];
  return ['new', 'إعادة فتح الطلب', '↻'];
}

function requestRow(request, wide = false) {
  const [nextStatus, label, icon] = nextAction(request);
  const action = `<button class="row-action" data-action="advance" data-id="${escapeHtml(request.id)}" aria-label="${label} ${escapeHtml(request.id)}" title="${label}">${icon}</button>`;
  if (wide) return `<tr><td>${serviceMarkup(request)}</td><td>${escapeHtml(request.service)}</td><td>${escapeHtml(request.customer)}</td><td class="table-muted">${escapeHtml(request.area)}</td><td class="table-muted">${escapeHtml(request.technician || 'غير مسند')}</td><td class="table-muted">${formatDate(request.date)}</td><td>${formatPrice(request.price)}</td><td>${statusMarkup(request.status)}</td><td>${action}</td></tr>`;
  return `<tr><td>${serviceMarkup(request)}</td><td>${escapeHtml(request.service)}</td><td class="table-muted">${escapeHtml(request.area)}</td><td class="table-muted">${escapeHtml(request.technician || 'غير مسند')}</td><td>${statusMarkup(request.status)}</td><td>${action}</td></tr>`;
}

function renderStats() {
  const todaysRequests = requests.filter(request => request.date === dateOffset(0)).length;
  const activeRequests = requests.filter(request => request.status === 'progress').length;
  const doneRequests = requests.filter(request => request.status === 'done').length;
  const revenue = requests.filter(request => request.status === 'done').reduce((sum, request) => sum + Number(request.price || 0), 0);
  const stats = [
    ['طلبات اليوم', todaysRequests, 'طلب مسجل اليوم', '▤', ''],
    ['قيد التنفيذ', activeRequests, 'تحتاج متابعة', '◷', 'orange'],
    ['طلبات مكتملة', doneRequests, 'من إجمالي الطلبات', '✓', 'blue'],
    ['إيرادات مكتملة', formatPrice(revenue), 'قيمة الطلبات المنفذة', 'ج.م', 'pink']
  ];
  document.querySelector('#stats-grid').innerHTML = stats.map(([label, value, note, icon, color]) => `<article class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon ${color}" aria-hidden="true">${icon}</span></div><div class="stat-value"><strong>${value}</strong></div><div class="stat-foot">${note}</div></article>`).join('');
  document.querySelector('#nav-count').textContent = requests.length.toLocaleString('ar-EG');
  document.querySelector('#filter-count-all').textContent = requests.length.toLocaleString('ar-EG');
}

function renderRequests() {
  const query = document.querySelector('#request-search').value.trim().toLocaleLowerCase('ar');
  const filtered = requests.filter(request => {
    const matchesFilter = activeFilter === 'all' || (activeFilter === 'progress' ? request.status === 'progress' : request.status === activeFilter);
    const searchable = `${request.id} ${request.customer} ${request.service} ${request.area} ${request.technician}`.toLocaleLowerCase('ar');
    return matchesFilter && searchable.includes(query);
  });
  document.querySelector('#all-requests').innerHTML = filtered.map(request => requestRow(request, true)).join('');
  document.querySelector('#empty-requests').hidden = filtered.length > 0;
  document.querySelector('#results-count').textContent = `عرض ${filtered.length.toLocaleString('ar-EG')} من ${requests.length.toLocaleString('ar-EG')} طلب`;
  document.querySelectorAll('.filter-tab').forEach(button => button.classList.toggle('active', button.dataset.filter === activeFilter));
}

function renderTechnicians() {
  const initials = ['alt-0', 'alt-1', 'alt-2', 'alt-3'];
  const available = technicians.filter(person => person.available);
  document.querySelector('#available-technicians').innerHTML = available.slice(0, 4).map((person, index) => `<div class="tech-person"><span class="tech-avatar ${initials[index % initials.length]}">${person.initial}</span><span class="tech-copy"><strong>${person.name}</strong><small><i class="online-dot"></i>متاح · ${person.trade}</small></span></div>`).join('');
  document.querySelector('#technician-cards').innerHTML = technicians.map((person, index) => {
    const assigned = requests.filter(request => request.technician === person.name && request.status === 'progress').length;
    const isAvailable = person.available && assigned === 0;
    return `<article class="technician-card"><div class="technician-card-top"><span class="tech-avatar ${initials[index % initials.length]}">${person.initial}</span><span class="tech-copy"><strong>${person.name}</strong><small>${person.trade}</small></span><span class="tech-status ${isAvailable ? '' : 'busy'}">${isAvailable ? 'متاح' : 'مشغول'}</span></div><div class="technician-meta"><span>التقييم<strong>★ ${person.rating}</strong></span><span>طلبات قيد التنفيذ<strong>${assigned.toLocaleString('ar-EG')}</strong></span><span>طلبات مكتملة<strong>${person.jobs.toLocaleString('ar-EG')}</strong></span><span>المنطقة<strong>القاهرة الكبرى</strong></span></div></article>`;
  }).join('');
  const options = technicians.map(person => `<option value="${person.name}">${person.name} · ${person.trade}</option>`).join('');
  document.querySelector('#technician-select').innerHTML = `<option value="">يُحدد لاحقًا</option>${options}`;
}

function renderChart() {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    const dateKey = date.toISOString().slice(0, 10);
    const total = requests.filter(request => request.date === dateKey).length;
    const done = requests.filter(request => request.date === dateKey && request.status === 'done').length;
    return { label: new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(date), total: Math.max(total, index < 4 ? [3, 5, 2, 4][index] : total), done };
  });
  const max = Math.max(5, ...days.map(day => day.total));
  document.querySelector('#weekly-total').textContent = days.reduce((sum, day) => sum + day.total, 0).toLocaleString('ar-EG');
  document.querySelector('#bar-chart').innerHTML = days.map(day => {
    const doneHeight = Math.max(day.done / max * 100, day.done ? 7 : 0);
    const newHeight = Math.max((day.total - day.done) / max * 100, day.total > day.done ? 7 : 0);
    return `<div class="bar-column" aria-label="${day.label}: ${day.total} طلب"><i class="bar completed" style="height:${doneHeight}%"></i><i class="bar" style="height:${newHeight}%"></i><small>${day.label}</small></div>`;
  }).join('');
}

function render() {
  renderStats();
  renderRequests();
  document.querySelector('#recent-requests').innerHTML = requests.slice(0, 5).map(request => requestRow(request)).join('');
  renderTechnicians();
  renderChart();
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function setView(viewName) {
  document.querySelectorAll('.view').forEach(view => {
    const active = view.id === `view-${viewName}`;
    view.hidden = !active;
    view.classList.toggle('active', active);
  });
  document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.view === viewName));
  document.querySelector('#page-crumb').textContent = { overview: 'نظرة عامة', requests: 'الطلبات', technicians: 'الفنيون' }[viewName];
  document.querySelector('#sidebar').classList.remove('open');
  document.querySelector('#mobile-menu').setAttribute('aria-expanded', 'false');
}

function openModal() {
  const modal = document.querySelector('#request-modal');
  const form = document.querySelector('#request-form');
  form.reset();
  form.elements.date.value = dateOffset(0);
  modal.hidden = false;
  form.elements.customer.focus();
}

function closeModal() {
  document.querySelector('#request-modal').hidden = true;
}

document.addEventListener('click', event => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) setView(viewButton.dataset.view);
  if (event.target.closest('[data-open-modal]')) openModal();
  if (event.target.closest('.modal-close,.modal-cancel') || event.target.id === 'request-modal') closeModal();
  const actionButton = event.target.closest('[data-action="advance"]');
  if (actionButton) {
    const request = requests.find(item => item.id === actionButton.dataset.id);
    if (request) {
      const [nextStatus] = nextAction(request);
      request.status = nextStatus;
      persist();
      render();
      showToast(`تم تحديث الطلب ${request.id} إلى: ${statusLabels[nextStatus]}`);
    }
  }
});

document.querySelector('#request-search').addEventListener('input', renderRequests);
document.querySelectorAll('.filter-tab').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  renderRequests();
}));
document.querySelector('#request-form').addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const customer = String(formData.get('customer')).trim();
  if (!customer) return;
  const nextNumber = Math.max(2400, ...requests.map(request => Number(request.id.slice(3)) || 0)) + 1;
  requests.unshift({
    id: `KD-${nextNumber}`,
    customer,
    service: formData.get('service'),
    area: String(formData.get('area')).trim(),
    technician: formData.get('technician') || 'غير مسند',
    date: formData.get('date'),
    price: Number(formData.get('price')) || 0,
    status: 'new'
  });
  persist();
  render();
  closeModal();
  showToast('اتسجل الطلب الجديد بنجاح');
});
document.querySelector('#mobile-menu').addEventListener('click', event => {
  const sidebar = document.querySelector('#sidebar');
  const open = sidebar.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
});

document.querySelector('#today-label').textContent = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(today);
render();