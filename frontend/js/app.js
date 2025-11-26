// =========================
// DEFINICIONES GLOBALES
// =========================
const API_URL = "http://localhost:8080/api"; // Gateway

console.log("✅ app.js cargado");
console.log("🌐 API_URL:", API_URL);

// Definiciones de Regex para validacion
const REGEX_EMAIL = /^\S+@\S+\.\S+$/;
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,16}$/;

// Definicion de las rutas/secciones de la app
const APP_ROUTES = {
  DASHBOARD: { title: "Dashboard de Actividades", icon: "bi-table", loader: loadActivitiesDashboard },
  
  // --- SECCIONES PRINCIPALES ---
  EXCHANGES: { title: "Intercambios", icon: "bi-arrow-left-right", loader: loadExchangePage },
  TU_APORTE: { title: "Tu Aporte", icon: "bi-heart-half", loader: loadDonationCardsPage }, // RENOMBRADO (Sprint 4)
  
  // --- SECCIONES DE GESTIÓN (Admin/Coord) ---
  ACTIVITY_MANAGEMENT: { title: "Gestión de Actividades", icon: "bi-pencil-square", loader: loadActivitiesDashboard },
  USER_MANAGEMENT: { title: "Gestión de Usuarios", icon: "bi-person-video3", loader: loadComingSoon },
  DONATIONS_MANAGEMENT: { title: "Administrar Donaciones", icon: "bi-inboxes-fill", loader: fetchDonations },
  REPORTS: { title: "Reportes", icon: "bi-clipboard-data-fill", loader: loadComingSoon },
  
  // --- UTILIDADES ---
  MY_ACTIVITIES: { title: "Mis Actividades", icon: "bi-calendar-check-fill", loader: loadComingSoon },
  FAQS: { title: "Preguntas Frecuentes", icon: "bi-question-circle-fill", loader: loadFaqPage },
  ABOUT: { title: "Acerca de HugNet", icon: "bi-info-circle-fill", loader: loadAboutPage },
  CONTACT: { title: "Contacto", icon: "bi-envelope-fill", loader: loadContactPage },
  PROFILE: { title: "Mi Perfil", icon: "bi-person-fill", loader: loadComingSoon },
};

// Rutas de utilidad que van al final del sidebar
const UTILITY_ROUTE_TITLES = [APP_ROUTES.FAQS.title, APP_ROUTES.ABOUT.title, APP_ROUTES.CONTACT.title, APP_ROUTES.PROFILE.title];

// Definicion de los menus por ROL
const ROLE_MENUS = {
  // Admin ve todo
  ADMINISTRADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.ACTIVITY_MANAGEMENT, APP_ROUTES.EXCHANGES, APP_ROUTES.TU_APORTE, APP_ROUTES.USER_MANAGEMENT, APP_ROUTES.DONATIONS_MANAGEMENT, APP_ROUTES.REPORTS, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE],
  
  COORDINADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.EXCHANGES, APP_ROUTES.REPORTS, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE],
  
  DONATION_MANAGER: [APP_ROUTES.DONATIONS_MANAGEMENT, APP_ROUTES.DASHBOARD, APP_ROUTES.EXCHANGES, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE],
  
  // Usuario ahora tiene TU_APORTE
  USUARIO: [APP_ROUTES.DASHBOARD, APP_ROUTES.TU_APORTE, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.EXCHANGES, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE],
  
  PRESTADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.EXCHANGES, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE]
};

// =========================
// FUNCIONES AUXILIARES
// =========================

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      title: 'Sesión Expirada',
      text: 'Tu sesión ha expirado. Serás redirigido al login.',
      icon: 'warning',
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      window.location.href = "index.html";
    });
    return null;
  }
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

function handleLogout() {
  console.log("🔓 Logout ejecutado");
  localStorage.clear();
  window.location.href = "index.html";
}

function setupPasswordToggle(inputId, buttonId) {
  const passwordInput = document.getElementById(inputId);
  const toggleButton = document.getElementById(buttonId);
  if (!passwordInput || !toggleButton) return;
  const icon = toggleButton.querySelector("i");
  toggleButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      if (icon) icon.className = "bi bi-eye-fill";
      toggleButton.classList.add("active");
    } else {
      passwordInput.type = "password";
      if (icon) icon.className = "bi bi-eye-slash-fill";
      toggleButton.classList.remove("active");
    }
  });
}

function initializePopovers() {
  try {
    const list = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    list.map(el => new bootstrap.Popover(el));
  } catch (error) { console.warn("⚠️ Error popovers:", error); }
}

// =========================
// ENRUTADOR PRINCIPAL
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const isProtectedPage = ["menu.html", "dashboard.html"].includes(currentPage);
  if (isProtectedPage && !localStorage.getItem("token")) {
    window.location.href = "index.html";
    return;
  }
  switch (currentPage) {
    case "index.html": case "": initLoginPage(); break;
    case "register.html": initRegisterPage(); break;
    case "menu.html": initMenuPage(); break;
    case "dashboard.html": initDashboardPage(); break;
  }
});

// =========================
// LOGICA DE PAGINAS
// =========================

function initLoginPage() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("loginMessage");
  if (!form) return;
  setupPasswordToggle("password", "togglePassword");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userRol", data.rol);
        localStorage.setItem("userId", data.userId);
        window.location.href = "menu.html";
      } else {
        const err = await response.json();
        message.textContent = err.message || "Credenciales incorrectas.";
      }
    } catch (error) { message.textContent = "Error de conexión."; }
  });
}

function initRegisterPage() {
  const form = document.getElementById("registerForm");
  const message = document.getElementById("registerMessage");
  const nombreInput = document.getElementById("nombre");
  const apellidoInput = document.getElementById("apellido");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const termsCheck = document.getElementById("termsCheck");
  if (!form) return;
  setupPasswordToggle("password", "togglePassword");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";
    if (!termsCheck.checked) { termsCheck.classList.add('is-invalid'); return; }

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreInput.value, apellido: apellidoInput.value,
          email: emailInput.value, password: passwordInput.value
        })
      });
      if (response.ok) {
        Swal.fire({ title: '¡Registro Exitoso!', icon: 'success', timer: 2000, showConfirmButton: false })
            .then(() => window.location.href = "index.html");
      } else {
        const err = await response.json();
        message.textContent = err.message || "Error en registro.";
      }
    } catch (error) { message.textContent = "Error de conexión."; }
  });
}

function initMenuPage() {
  const userRol = localStorage.getItem("userRol");
  const userName = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  if (userName) userName.textContent = localStorage.getItem("userEmail");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  const container = document.getElementById("menu-options");
  if (!container) return;

  const items = ROLE_MENUS[userRol];
  if (!items) { container.innerHTML = '<p class="alert alert-warning">Rol no reconocido.</p>'; return; }

  container.innerHTML = "";
  items.forEach((item, index) => {
    const btn = document.createElement("a");
    btn.href = `dashboard.html?view=${encodeURIComponent(item.title)}`;
    btn.className = `btn btn-lg ${index === 0 ? 'btn-primary' : 'btn-outline-primary'}`;
    btn.innerHTML = `<i class="bi ${item.icon} me-2"></i> ${item.title}`;
    container.appendChild(btn);
  });
}

// =========================
// DASHBOARD LOGIC
// =========================

function initDashboardPage() {
  const userRol = localStorage.getItem("userRol");
  const userName = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  if (userName) userName.textContent = localStorage.getItem("userEmail");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  const nav = document.getElementById("sidebar-nav");
  const utilNav = document.getElementById("sidebar-utility-nav");
  if (!nav) return;
  nav.innerHTML = ""; if (utilNav) utilNav.innerHTML = "";

  const items = ROLE_MENUS[userRol] || [];
  const createLi = (item) => {
    const li = document.createElement("li"); li.className = "nav-item";
    const a = document.createElement("a");
    a.href = `?view=${encodeURIComponent(item.title)}`;
    a.className = "nav-link text-white";
    a.innerHTML = `<i class="bi ${item.icon} me-2"></i> ${item.title}`;
    a.onclick = async (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
      a.classList.add("active");
      await item.loader(item.title);
      window.history.pushState(null, '', `dashboard.html?view=${encodeURIComponent(item.title)}`);
    };
    li.appendChild(a); return li;
  };

  items.forEach(item => {
    if (UTILITY_ROUTE_TITLES.includes(item.title)) {
       if (utilNav) { const li = createLi(item); li.querySelector('a').classList.add('small'); utilNav.appendChild(li); }
    } else { nav.appendChild(createLi(item)); }
  });

  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  let viewToLoad = items[0];
  if (viewParam) { const found = items.find(i => i.title === viewParam); if (found) viewToLoad = found; }

  if (viewToLoad) {
    viewToLoad.loader(viewToLoad.title);
    setTimeout(() => {
        const active = document.querySelector(`a[href="?view=${encodeURIComponent(viewToLoad.title)}"]`);
        if (active) active.classList.add("active");
    }, 100);
  }
  setupMobileSidebarToggle();
}

function setupMobileSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const openBtn = document.getElementById('openSidebarBtn');
  const closeBtn = document.getElementById('closeSidebarBtn');
  const main = document.getElementById('main-content');
  if (openBtn) openBtn.addEventListener('click', () => sidebar.classList.add('show'));
  if (closeBtn) closeBtn.addEventListener('click', () => sidebar.classList.remove('show'));
  if (main) main.addEventListener('click', () => { if (window.innerWidth <= 768) sidebar.classList.remove('show'); });
  document.querySelectorAll('#sidebar-nav a').forEach(l => {
      l.addEventListener('click', () => { if (window.innerWidth <= 768) sidebar.classList.remove('show'); });
  });
}

// =========================
// LOADERS
// =========================

async function loadPartial(url, cb) {
  const area = document.getElementById("content-area");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error vista");
    area.innerHTML = await res.text();
    if (cb) cb();
  } catch (e) { area.innerHTML = `<div class="alert alert-danger">${e.message}</div>`; }
}

async function loadFaqPage(title) {
  document.getElementById("content-title").textContent = title;
  await loadPartial('partials/faq.html', () => {
      document.querySelectorAll('.accordion-collapse').forEach(el => new bootstrap.Collapse(el, { toggle: false }));
  });
}
async function loadAboutPage(title) {
  document.getElementById("content-title").textContent = title;
  await loadPartial('partials/about.html');
}
async function loadContactPage(title) {
  document.getElementById("content-title").textContent = title;
  await loadPartial('partials/contact.html');
}
function loadComingSoon(title) {
  document.getElementById("content-title").textContent = title;
  document.getElementById("content-area").innerHTML = `
    <div class="card-body p-5 text-center">
      <h3 class="text-muted">Próximamente...</h3>
      <p>La sección <strong>${title}</strong> estará disponible pronto.</p>
    </div>`;
}

// --- ACTIVIDADES ---
async function loadActivitiesDashboard(title) {
  document.getElementById("content-title").textContent = title;
  document.getElementById("content-area").innerHTML = `
    <div class="card-body p-4">
      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle text-center">
          <thead class="table-primary"><tr><th>ID</th><th>Título</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody id="activityTableBody"><tr><td colspan="6">Cargando...</td></tr></tbody>
        </table>
      </div>
    </div>`;
  await fetchActivities(document.getElementById("activityTableBody"));
}

async function fetchActivities(tableBody) {
  const headers = getAuthHeaders();
  if (!headers) return;
  try {
    const res = await fetch(`${API_URL}/activities`, { headers });
    if (res.ok) {
        const activities = await res.json();
        renderActivities(activities, tableBody);
    } else { throw new Error(); }
  } catch (e) { tableBody.innerHTML = `<tr><td colspan="6" class="text-danger">Error carga.</td></tr>`; }
}

function renderActivities(list, tableBody) {
  const role = localStorage.getItem("userRol");
  tableBody.innerHTML = "";
  
  let filtered = list;
  if (role === 'USUARIO') filtered = list.filter(a => ['ABIERTO', 'EN_CURSO'].includes(a.estado));
  if (role === 'COORDINADOR') filtered = list.filter(a => a.estado !== 'PENDIENTE');

  if (!filtered.length) { tableBody.innerHTML = `<tr><td colspan="6" class="text-muted">No hay actividades.</td></tr>`; return; }

  filtered.forEach(act => {
    const tr = document.createElement("tr");
    const date = act.fechaInicio ? new Date(act.fechaInicio).toLocaleDateString() : "-";
    let btns = '';
    if (role !== 'ADMINISTRADOR') {
        btns += `<button class="btn btn-sm btn-outline-primary" onclick="joinActivity(${act.activityId})">Participar</button>`;
    } else if (act.estado === 'PENDIENTE') {
        btns += `<button class="btn btn-sm btn-success me-1" onclick="validateActivity(${act.activityId}, 'ABIERTO')">✓</button>`;
        btns += `<button class="btn btn-sm btn-danger" onclick="validateActivity(${act.activityId}, 'SUSPENDIDO')">✗</button>`;
    }
    tr.innerHTML = `<td>${act.activityId}</td><td>${act.titulo}</td><td>${act.tipoActividad}</td><td>${date}</td>
                    <td><span class="badge bg-secondary">${act.estado}</span></td><td>${btns}</td>`;
    tableBody.appendChild(tr);
  });
}

// --- DONACIONES GESTIÓN ---
async function fetchDonations(title) {
  document.getElementById("content-title").textContent = title;
  const area = document.getElementById("content-area");
  area.innerHTML = `<div class="p-4">Cargando...</div>`;
  const headers = getAuthHeaders();
  if(!headers) return;
  try {
      const res = await fetch(`${API_URL}/donations/pending`, { headers });
      if(res.ok) {
          const data = await res.json();
          renderDonationsList(data, area);
      } else { area.innerHTML = `<div class="alert alert-warning">Error acceso.</div>`; }
  } catch(e) { area.innerHTML = `<div class="alert alert-danger">Error conexión.</div>`; }
}

function renderDonationsList(list, container) {
    if(!list.length) { container.innerHTML = `<div class="p-4 text-muted">Sin pendientes.</div>`; return; }
    const html = list.map(d => `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm">
            <div class="card-body">
                <h5>${d.descripcionItem || 'Donación'}</h5>
                <p class="text-muted mb-1">Tipo: ${d.itemType} | Cant: ${d.cantidad}</p>
                <span class="badge bg-warning text-dark">${d.estado}</span>
                <div class="mt-3">
                    <button class="btn btn-sm btn-success" onclick="approveDonation(${d.id})">Aprobar</button>
                    <button class="btn btn-sm btn-danger" onclick="rejectDonation(${d.id})">Rechazar</button>
                </div>
            </div>
        </div>
      </div>`).join('');
    container.innerHTML = `<div class="card-body p-4"><div class="row g-3">${html}</div></div>`;
}

// =========================
// NUEVAS FUNCIONES (SPRINT 4: TU APORTE & SPRINT 3: INTERCAMBIOS)
// =========================

// --- TU APORTE (VISTA DE TARJETAS) ---
async function loadDonationCardsPage(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");
  contentTitle.textContent = title; // "Tu Aporte"

  contentArea.innerHTML = `
    <div class="card-body p-4">
      <p class="text-muted mb-4">Elige una causa y selecciona un monto fijo para colaborar. ¡Gracias!</p>
      <div id="donation-cards-container" class="row g-4">
        <div class="text-center w-100 py-4">Cargando causas...</div>
      </div>
    </div>`;

  const container = document.getElementById("donation-cards-container");
  let cardsHtml = "";

  // 1. Tarjeta Institucional
  cardsHtml += createDonationCardHtml({ id: null, titulo: "Fondo Común HugNet", desc: "Apoya a la organización general para gastos operativos.", icon: 'bi-globe-americas', badge: 'Institucional' });

  // 2. Tarjetas de Actividades
  try {
    const headers = getAuthHeaders();
    if (headers) {
      const res = await fetch(`${API_URL}/activities`, { headers });
      if (res.ok) {
        const list = await res.json();
        list.filter(a => ['ABIERTO', 'EN_CURSO'].includes(a.estado)).forEach(a => {
            cardsHtml += createDonationCardHtml({ 
                id: a.activityId, 
                titulo: a.titulo, 
                desc: `Campaña activa (${a.tipoActividad}).`, 
                icon: 'bi-stars', 
                badge: 'Campaña' 
            });
        });
      }
    }
  } catch (e) { console.warn("Error cargando campañas", e); }
  container.innerHTML = cardsHtml;
}

function createDonationCardHtml({ id, titulo, desc, icon, badge }) {
  // El ID 'null' debe pasarse como string 'null' o handled carefully
  const idParam = id === null ? 'null' : id;
  const badgeClass = id === null ? 'bg-primary' : 'bg-success';

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm border-0 item-card">
        <div class="card-body text-center p-4 d-flex flex-column align-items-center">
          <div class="rounded-circle bg-light p-3 mb-3 text-primary"><i class="bi ${icon} fs-1"></i></div>
          <span class="badge ${badgeClass} mb-2">${badge}</span>
          <h5 class="card-title fw-bold">${titulo}</h5>
          <p class="card-text text-muted small">${desc}</p>
          <div class="mt-auto w-100 pt-3">
            <button class="btn btn-outline-primary w-100 rounded-pill" onclick="initiateDonationFlow(${idParam}, '${titulo}')">
              <i class="bi bi-heart-fill me-2"></i> Aportar
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

// --- FLUJO DE DONACIÓN (MODAL CON MONTOS FIJOS) ---


window.initiateDonationFlow = async function(activityId, activityTitle) {
  // Paso 1: Selector de monto
  const { value: montoStr } = await Swal.fire({
    title: `Aporte para: ${activityTitle}`,
    text: 'Selecciona el monto de tu colaboración',
    input: 'radio',
    inputOptions: {
      '500': '$ 500 (Colaborador)',
      '1000': '$ 1.000 (Amigo)',
      '2000': '$ 2.000 (Protector)'
    },
    inputValidator: (value) => { if (!value) return 'Debes seleccionar una opción'; },
    showCancelButton: true,
    confirmButtonText: 'Generar QR de Pago',
    cancelButtonText: 'Cancelar'
  });

  if (!montoStr) return;

  const headers = getAuthHeaders();
  if (!headers) return;

  Swal.fire({ title: 'Generando link...', didOpen: () => Swal.showLoading() });

  try {
    
    
    const payload = {
        // Nombre exacto del campo en Java: private DonationType tipoDonacion;
        tipoDonacion: 'MONETARIA', // Valor exacto del Enum DonationType
        
        // Nombre exacto: private Double monto;
        monto: parseFloat(montoStr),
        
        // Comentario opcional 
        // Tu DTO tiene 'descripcionItem', usaremos ese para guardar el comentario.
        descripcionItem: `Aporte Web (${activityTitle})`, 
        
        // itemType: No lo enviamos porque es monetaria (o null)
        itemType: null,
        
        cantidad: 1 // Default para que @Min(1) no falle si se valida
    };

    // Agregamos activityId solo si es válido
    if (activityId && activityId !== 'null' && activityId !== null) {
        payload.activityId = parseInt(activityId);
    }

    console.log("📦 Payload enviado:", JSON.stringify(payload)); 

    const res = await fetch(`${API_URL}/donations`, { 
        method: "POST", 
        headers, 
        body: JSON.stringify(payload) 
    });
    
    if (res.ok) {
      const data = await res.json();
      
      // MODIFICACIÓN PARA EL VIDEO:
      // Agregamos un botón extra para simular el retorno si MP falla
      Swal.fire({
        title: '¡Listo para aportar!',
        html: `
          <p>1. Escanea el QR o toca "Ir a Pagar".</p>
          <p>2. Cuando termines, vuelve aquí y confirma.</p>
          <div id="payment-qr" class="d-flex justify-content-center my-3"></div>
          <a href="${data.paymentUrl}" class="btn btn-primary rounded-pill mb-3" target="_blank">
             <i class="bi bi-credit-card-2-front"></i> Ir a Pagar en MercadoPago
          </a>
        `,
        // Botón secundario para confirmar manualmente
        showDenyButton: true,
        confirmButtonText: 'Cerrar',
        denyButtonText: '✅ ¡Ya pagué! (Confirmar)',
        denyButtonColor: '#198754', // Verde
        
        didOpen: () => {
          new QRCode(document.getElementById("payment-qr"), { text: data.paymentUrl, width: 150, height: 150 });
        }
      }).then((result) => {
          // Si el usuario hace clic en "Ya pagué"
          if (result.isDenied) {
              Swal.fire({
                  title: '¡Muchas Gracias!',
                  text: 'Estamos verificando tu aporte. ¡Gracias por colaborar!',
                  icon: 'success'
              }).then(() => {
                  // Recargamos para limpiar
                  window.location.href = "dashboard.html?view=Tu%20Aporte";
              });
          }
      });

    } else {
      const err = await res.json();
      console.error("Error Backend:", err);
      // Mostramos el mensaje exacto del error de validación si existe
      let msg = err.message || 'Error al procesar la donación';
      if(err.errors) msg += "\n" + err.errors.map(e => e.defaultMessage).join("\n");
      
      Swal.fire('Error', msg, 'error');
    }
  } catch (e) { 
    console.error(e);
    Swal.fire('Error', 'Error de conexión.', 'error'); 
  }
};

// --- INTERCAMBIOS (SPRINT 3) ---
async function loadExchangePage(title) {
  const area = document.getElementById("content-area");
  document.getElementById("content-title").textContent = title;
  const role = localStorage.getItem("userRol");

  area.innerHTML = `
    <div class="card-body p-4">
      <div id="form-publicar-container" class="card mb-4 d-none">
        <div class="card-header bg-primary text-white">Publicar Ítem</div>
        <div class="card-body">
          <form id="form-publicar-exchange">
            <div class="row">
                <div class="col-md-6 mb-3"><label class="form-label">Título</label><input type="text" class="form-control" id="item-titulo" required></div>
                <div class="col-md-6 mb-3"><label class="form-label">Tipo</label><select class="form-select" id="item-tipo" required><option value="BIEN">Bien Físico</option><option value="SERVICIO">Servicio</option></select></div>
            </div>
            <div class="mb-3"><label class="form-label">¿Qué buscas?</label><input type="text" class="form-control" id="item-deseado" required></div>
            <button type="submit" class="btn btn-primary">Publicar</button>
          </form>
        </div>
      </div>
      <h4 class="mb-3">Ítems Disponibles</h4>
      <div id="lista-intercambios-container" class="row g-3"><p>Cargando...</p></div>
    </div>`;

  if (role === 'PRESTADOR') {
    document.getElementById('form-publicar-container').classList.remove('d-none');
    document.getElementById('form-publicar-exchange').addEventListener('submit', handlePublishExchange);
  }
  fetchExchanges();
}

async function handlePublishExchange(e) {
    e.preventDefault();
    const headers = getAuthHeaders();
    const body = {
        titulo: document.getElementById('item-titulo').value,
        itemType: document.getElementById('item-tipo').value,
        itemDeseado: document.getElementById('item-deseado').value,
        descripcion: "Web"
    };
    try {
        const res = await fetch(`${API_URL}/exchanges/created`, { method: "POST", headers, body: JSON.stringify(body) });
        if(res.ok) { Swal.fire('Éxito', 'Publicado', 'success'); e.target.reset(); fetchExchanges(); }
        else { Swal.fire('Error', 'No se pudo publicar', 'error'); }
    } catch(err) { console.error(err); }
}

async function fetchExchanges() {
  const container = document.getElementById("lista-intercambios-container");
  const headers = getAuthHeaders();
  const role = localStorage.getItem("userRol"); // Obtenemos el rol aquí

  if (!headers) return;

  // 1. URL LIMPIA: Quitamos el filtro de la URL para que el Backend no falle
  const url = `${API_URL}/exchanges`; 

  try {
      const res = await fetch(url, { headers });
      
      if(res.ok) {
          const allData = await res.json();
          
          // 2. FILTRADO EN FRONTEND:
          // Si NO es Admin ni Coordinador, filtramos manualmente aquí
          let dataToRender = allData;
          if (role !== 'ADMINISTRADOR' && role !== 'COORDINADOR') {
              dataToRender = allData.filter(item => item.estado === 'DISPONIBLE');
          }

          renderExchanges(dataToRender, container);
      } else {
          container.innerHTML = `<p class="text-danger">Error del servidor (${res.status}).</p>`;
      }
  } catch(e) {
      console.error(e);
      container.innerHTML = `<p class="text-danger">Error de conexión.</p>`;
  }
}

function renderExchanges(list, container) {
  if (!list.length) { container.innerHTML = `<p class="text-muted">No hay ítems.</p>`; return; }
  container.innerHTML = "";
  const userId = parseInt(localStorage.getItem("userId"));

  list.forEach(item => {
    const isOwner = item.prestadorId === userId;
    // ... botones ...
    let mainBtn = isOwner 
        ? `<button class="btn btn-sm btn-outline-secondary" disabled>Tu publicación</button>`
        : `<button class="btn btn-sm btn-outline-primary" onclick="solicitarExchange(${item.id})" ${item.estado !== 'DISPONIBLE' ? 'disabled' : ''}>Solicitar</button>`;

    let qrBtn = '';
    if (item.estado !== 'DISPONIBLE' && item.tokenConfirmacion) {
        // ¡AQUÍ EL CAMBIO! Pasamos item.tokenConfirmacion
        qrBtn = `<button class="btn btn-sm btn-dark w-100 mt-2" onclick="showExchangeQR('${item.tokenConfirmacion}', '${item.titulo}', ${item.id})"><i class="bi bi-qr-code"></i> Ver QR</button>`;
    }

    // ... resto del HTML de la tarjeta ...
    container.innerHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title text-truncate">${item.titulo}</h5>
            <h6 class="card-subtitle mb-2 text-muted">Busca: ${item.itemDeseado}</h6>
            <div class="mt-auto">
              <span class="badge bg-info text-dark mb-2">${item.estado}</span>
              <div class="d-grid">${mainBtn}${qrBtn}</div>
            </div>
          </div>
        </div>
      </div>`;
  });
}

window.showExchangeQR = function(token, title, id) {
    Swal.fire({
        title: 'Validar Intercambio',
        // HTML: Solo el texto y el contenedor del QR
        html: `
            <p class="text-muted mb-3">Muestra este código para entregar: <strong>${title}</strong></p>
            <div class="d-flex justify-content-center mb-4">
                <div id="qrcode" class="p-2 border rounded bg-white"></div>
            </div>
            <div class="alert alert-light border small">
               <i class="bi bi-info-circle"></i> Simulación para Demo
            </div>
        `,
        // CONFIGURACIÓN DE BOTONES (Esto garantiza que se vean)
        showConfirmButton: true,
        confirmButtonText: 'Confirmar Entrega',
        confirmButtonColor: '#198754', // Color Verde (#success)
        showCloseButton: true,
        
        // Generación del QR al abrir
        didOpen: () => {
            new QRCode(document.getElementById("qrcode"), {
                text: token, 
                width: 160,
                height: 160
            });
        }
    }).then((result) => {
        // Lógica: Si el usuario toca el botón verde "Confirmar Entrega"
        if (result.isConfirmed) {
            confirmarIntercambioDemo(token, id);
        }
    });
};

// Modificamos la confirmación para usar el endpoint correcto (si existiera) o simular
window.confirmarIntercambioDemo = async function(token, id) {
    const headers = getAuthHeaders();
    Swal.showLoading();
    
    try {
        // CORRECCIÓN: Usamos GET y la URL exacta de tu Controller (/confirmar/{token})
        const res = await fetch(`${API_URL}/exchanges/confirmar/${token}`, { 
            method: "PATCH", // Tu backend usa @GetMapping
            headers 
        });
        
        if (res.ok) {
            // Si el backend devuelve el objeto actualizado, todo salió bien
            Swal.fire({
                title: '¡Entrega Confirmada!',
                text: 'El sistema ha validado el token correctamente.',
                icon: 'success'
            }).then(() => {
                 fetchExchanges(); // Refrescamos la lista
            });
        } else {
            // Capturamos el error del backend
            const err = await res.json();
            Swal.fire('Error', err.message || 'Token inválido o expirado.', 'error');
        }

    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
    }
};

window.solicitarExchange = async function(id) {
    const headers = getAuthHeaders();
    try {
        const res = await fetch(`${API_URL}/exchanges/${id}/solicitar`, { method: "PATCH", headers });
        if(res.ok) { Swal.fire('Éxito', 'Solicitado', 'success'); fetchExchanges(); }
        else { Swal.fire('Error', 'Error solicitud', 'error'); }
    } catch(e) { Swal.fire('Error', 'Error conexión', 'error'); }
};



// --- GLOBALES ---
window.joinActivity = async function (id) {
  const headers = getAuthHeaders();
  const userId = localStorage.getItem("userId");
  try {
      const res = await fetch(`${API_URL}/activities/${id}/join/${userId}`, { method: "POST", headers });
      if(res.ok) Swal.fire('Éxito', 'Te has unido.', 'success');
      else { const err = await res.json(); Swal.fire('Error', err.message, 'error'); }
  } catch(e) { console.error(e); }
};

window.validateActivity = async function (id, status) {
    const headers = getAuthHeaders();
    try {
      const res = await fetch(`${API_URL}/admin/activities/${id}/status`, { method: "PATCH", headers, body: JSON.stringify({ newStatus: status }) });
      if (res.ok) { Swal.fire('Éxito', 'Actualizado.', 'success'); loadActivitiesDashboard("Gestión de Actividades"); }
      else Swal.fire('Error', 'No se pudo actualizar.', 'error');
    } catch(e) { Swal.fire('Error', 'Error conexión.', 'error'); }
};

window.approveDonation = async function(id) {
    const headers = getAuthHeaders();
    await fetch(`${API_URL}/donations/${id}/approve`, { method: "PATCH", headers });
    fetchDonations("Administrar Donaciones");
};
window.rejectDonation = async function(id) {
    const headers = getAuthHeaders();
    await fetch(`${API_URL}/donations/${id}/reject`, { method: "PATCH", headers });
    fetchDonations("Administrar Donaciones");
};