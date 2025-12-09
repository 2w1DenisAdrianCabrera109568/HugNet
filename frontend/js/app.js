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
  USER_MANAGEMENT: { title: "Gestión de Usuarios", icon: "bi-person-video3", loader: loadUsersPage },
  DONATIONS_MANAGEMENT: { title: "Administrar Donaciones", icon: "bi-inboxes-fill", loader: fetchDonations },
  REPORTS: { title: "Reportes", icon: "bi-clipboard-data-fill", loader: loadReportsPage },
  
  // --- UTILIDADES ---
  MY_ACTIVITIES: { title: "Mis Actividades", icon: "bi-calendar-check-fill", loader: loadMyActivitiesPage },
  FAQS: { title: "Preguntas Frecuentes", icon: "bi-question-circle-fill", loader: loadFaqPage },
  ABOUT: { title: "Acerca de HugNet", icon: "bi-info-circle-fill", loader: loadAboutPage },
  CONTACT: { title: "Contacto", icon: "bi-envelope-fill", loader: loadContactPage },
  PROFILE: { title: "Mi Perfil", icon: "bi-person-fill", loader: loadProfilePage },
};

// Rutas de utilidad que van al final del sidebar
const UTILITY_ROUTE_TITLES = [APP_ROUTES.FAQS.title, APP_ROUTES.ABOUT.title, APP_ROUTES.CONTACT.title, APP_ROUTES.PROFILE.title];

// Definicion de los menus por ROL
const ROLE_MENUS = {
  // Admin ve todo
  ADMINISTRADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.ACTIVITY_MANAGEMENT, APP_ROUTES.EXCHANGES, APP_ROUTES.TU_APORTE, APP_ROUTES.USER_MANAGEMENT, APP_ROUTES.DONATIONS_MANAGEMENT, APP_ROUTES.REPORTS, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE],
  
  COORDINADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.EXCHANGES, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE],
  
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
  
  // 1. Setup Básico Header
  if (userName) userName.textContent = localStorage.getItem("userEmail");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  // --- NUEVO: Control del Botón "Crear Actividad" ---
  // Se muestra SOLO si es Coordinador
  const btnCreate = document.getElementById('btn-create-activity');
  if (btnCreate) {
      if (userRol === 'COORDINADOR') {
          btnCreate.classList.remove('d-none');
      } else {
          btnCreate.classList.add('d-none');
      }
  }
  // --------------------------------------------------

  const nav = document.getElementById("sidebar-nav");
  const utilNav = document.getElementById("sidebar-utility-nav");
  if (!nav) return;
  nav.innerHTML = ""; 
  if (utilNav) utilNav.innerHTML = "";

  // 2. Generación del Sidebar (Tu lógica existente)
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

  // 3. Carga de Vista Inicial (Tu lógica existente)
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
  
  if (typeof setupMobileSidebarToggle === 'function') setupMobileSidebarToggle();
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
async function loadProfilePage() {
    const contentArea = document.getElementById("content-area");
    const template = document.getElementById("profile-template");

    // 1. Clonar Template
    contentArea.innerHTML = "";
    const clone = template.content.cloneNode(true);
    contentArea.appendChild(clone);

    // 2. Obtener datos (Usamos localStorage para rapidez, o podrías hacer fetch al user-service)
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");
    const rol = localStorage.getItem("userRol");
    
    // Si quisieras datos frescos del backend (nombre real):
    // const userData = await fetchUserData(userId); 
    // Por ahora usamos placeholders o lo que tengamos:
    
    document.getElementById("profile-id").textContent = userId;
    document.getElementById("profile-email").textContent = email;
    document.getElementById("profile-role").textContent = rol;
    
    // Como en el login no guardamos el nombre en localStorage, mostramos el email o "Usuario"
    // Si quieres el nombre real, descomenta la llamada fetch abajo
    document.getElementById("profile-name").textContent = "Usuario #" + userId;
    
    // Opcional: Traer nombre real
    try {
        const headers = getAuthHeaders();
        const res = await fetch(`${API_URL}/users/${userId}`, { headers });
        if (res.ok) {
            const u = await res.json();
            document.getElementById("profile-name").textContent = `${u.nombre} ${u.apellido}`;
        }
    } catch (e) {
        console.log("No se pudo cargar detalles extra del perfil");
    }
}

async function deleteMyAccount() {
    const userId = localStorage.getItem("userId");
    
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto! Tu cuenta será eliminada permanentemente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar cuenta'
    });

    if (result.isConfirmed) {
        try {
            const headers = getAuthHeaders();
            const res = await fetch(`${API_URL}/users/${userId}`, { 
                method: 'DELETE',
                headers 
            });

            if (res.ok) {
                await Swal.fire('¡Eliminado!', 'Tu cuenta ha sido eliminada.', 'success');
                handleLogout(); // Desloguear y mandar al home
            } else {
                Swal.fire('Error', 'No se pudo eliminar la cuenta. Intenta más tarde.', 'error');
            }
        } catch (e) {
            Swal.fire('Error', 'Error de conexión.', 'error');
        }
    }
}

// --- ACTIVIDADES ---

async function loadActivitiesDashboard(title) {
    // 1. Actualizar el título principal del Dashboard (si lo usas fuera del content-area)
    const titleEl = document.getElementById("content-title");
    if (titleEl) titleEl.textContent = title;

    // 2. Preparar el área de contenido
    const contentArea = document.getElementById("content-area");
    const template = document.getElementById("activities-template");
    
    // Limpiamos lo que había antes
    contentArea.innerHTML = "";

    // 3. Clonar el template e inyectarlo
    // (Esto es más limpio que usar innerHTML con strings gigantes)
    const clone = template.content.cloneNode(true);
    contentArea.appendChild(clone);

    // 4. Lógica de Rol: Mostrar botón "Crear" si es Coordinador
    const userRol = localStorage.getItem("userRol");
    const btnCreate = document.getElementById("btn-create-activity");
    
    if (btnCreate && userRol === 'COORDINADOR') {
        btnCreate.classList.remove('d-none');
    }

    // 5. Cargar los datos
    // Pasamos el elemento tbody que acabamos de crear al fetch
    const tableBody = document.getElementById("activityTableBody");
    if (tableBody) {
        await fetchActivities(tableBody);
    }
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

    // 1. Filtros de lógica de negocio (Mantenemos tu lógica original)
    let filtered = list;
    if (role === 'USUARIO') {
        filtered = list.filter(a => ['ABIERTO', 'EN_CURSO'].includes(a.estado));
    }
    // Nota: Si el coordinador necesita ver sus eventos pendientes para editarlos, podrías quitar este filtro.
    // Por ahora lo dejamos como lo tenías:
    if (role === 'COORDINADOR') {
        filtered = list.filter(a => a.estado !== 'PENDIENTE');
    }

    if (!filtered || filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay actividades disponibles para mostrar.</td></tr>`;
        return;
    }

    filtered.forEach(act => {
        const tr = document.createElement("tr");
        tr.className = "align-middle"; // Alineación vertical centrada
        
        // Formateo de fecha
        const date = act.fechaInicio ? new Date(act.fechaInicio).toLocaleDateString() : "-";

        // Lógica de Badges (Colores según estado)
        let badgeClass = "bg-secondary";
        if (act.estado === 'ABIERTO' || act.estado === 'APROBADA') badgeClass = "bg-success";
        if (act.estado === 'PENDIENTE') badgeClass = "bg-warning text-dark";
        if (act.estado === 'SUSPENDIDO' || act.estado === 'RECHAZADA') badgeClass = "bg-danger";

        // Lógica de Botones (Aquí implementamos el Dropdown)
        let btns = '';

        if (role === 'ADMINISTRADOR') {
            // Admin: Aprobar / Rechazar (Mantenemos tu función validateActivity)
            if (act.estado === 'PENDIENTE') {
                btns = `
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-success" title="Aprobar" onclick="validateActivity(${act.activityId}, 'ABIERTO')"><i class="bi bi-check-lg"></i></button>
                    <button class="btn btn-sm btn-danger" title="Rechazar" onclick="validateActivity(${act.activityId}, 'SUSPENDIDO')"><i class="bi bi-x-lg"></i></button>
                </div>`;
            } else {
                btns = `<small class="text-muted fst-italic">Gestionado</small>`;
            }

        } else if (role === 'COORDINADOR') {
            // --- NUEVO: MENÚ DROPDOWN (3 PUNTITOS) ---
            btns = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-light border" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="openAttendeesModal(${act.activityId})">
                            <i class="bi bi-people me-2"></i>Ver Asistentes
                        </a></li>
                        
                        <li><a class="dropdown-item" href="#" onclick="openAddSponsorModal(${act.activityId})">
                            <i class="bi bi-cash-coin me-2"></i>Asignar Sponsor
                        </a></li>
                        
                        <li><hr class="dropdown-divider"></li>
                        
                        <li><a class="dropdown-item text-danger" href="#" onclick="validateActivity(${act.activityId}, 'SUSPENDIDO')">
                            <i class="bi bi-trash me-2"></i>Cancelar Evento
                        </a></li>
                    </ul>
                </div>
            `;

        } else {
            // Rol Usuario / Prestador: Botón de participar (Mantenemos joinActivity)
            // Agregamos validación visual por si acaso
            if (act.estado === 'ABIERTO' || act.estado === 'APROBADA') {
                btns = `<button class="btn btn-sm btn-outline-primary" onclick="joinActivity(${act.activityId})">Participar</button>`;
            }
        }

        // Construcción de la fila
        tr.innerHTML = `
            <td class="fw-bold">${act.activityId}</td>
            <td>${act.titulo}</td>
            <td><span class="badge bg-light text-dark border">${act.tipoActividad || 'General'}</span></td>
            <td>${date}</td>
            <td><span class="badge ${badgeClass}">${act.estado}</span></td>
            <td class="text-end">${btns}</td>
        `;
        
        tableBody.appendChild(tr);
    });
}

// --- CREACIÓN DE ACTIVIDADES ---

function openCreateActivityModal() {
    document.getElementById('createActivityForm').reset();
    
    // Setear mínimo HOY para evitar fechas pasadas
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('actDateStart').setAttribute('min', today);
    document.getElementById('actDateEnd').setAttribute('min', today);

    const modalEl = document.getElementById('createActivityModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function submitCreateActivity() {
    // 1. Capturar datos
    const titulo = document.getElementById('actTitle').value;
    const descripcion = document.getElementById('actDesc').value;
    const tipo = document.getElementById('actType').value;

    // Capturar Inicio
    const dateStart = document.getElementById('actDateStart').value; 
    const timeStart = document.getElementById('actTimeStart').value;

    // Capturar Fin
    const dateEnd = document.getElementById('actDateEnd').value;
    const timeEnd = document.getElementById('actTimeEnd').value;

    // 2. Validaciones
    if (!titulo || !descripcion || !tipo || !dateStart || !timeStart || !dateEnd || !timeEnd) {
        Swal.fire('Atención', 'Por favor completa todos los campos de fecha y hora.', 'warning');
        return;
    }

    // Armar las fechas ISO (YYYY-MM-DDTHH:mm:ss)
    const fechaInicioISO = `${dateStart}T${timeStart}:00`;
    const fechaFinISO = `${dateEnd}T${timeEnd}:00`;

    // Validación lógica: Fin no puede ser antes que Inicio
    if (new Date(fechaFinISO) <= new Date(fechaInicioISO)) {
        Swal.fire('Error en fechas', 'La fecha de fin debe ser posterior a la de inicio.', 'error');
        return;
    }

    // 3. Payload (Objeto a enviar)
    const payload = {
        titulo: titulo,
        description: descripcion, // Nombre exacto de tu entidad
        fechaInicio: fechaInicioISO,
        fechaFin: fechaFinISO,
        tipoActividad: tipo,
        // estado: NO LO ENVIAMOS (Java pondrá PENDIENTE automáticamente)
        // coordinadorId: null (El controller lo rellena con el token)
    };

    try {
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';

        const res = await fetch(`${API_URL}/activities`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            // Éxito
            const modalEl = document.getElementById('createActivityModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            await Swal.fire('¡Creada!', 'La actividad se ha registrado correctamente.', 'success');
            
            // Recargar la tabla usando el título correcto
            loadActivitiesDashboard("Tablero de Actividades"); 
        } else {
            const errorTxt = await res.text();
            console.error("Error backend:", errorTxt);
            Swal.fire('Error', 'No se pudo crear la actividad.', 'error');
        }
    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'Error de conexión.', 'error');
    }
}

// --- MÓDULO: GESTIÓN DE USUARIOS (ADMIN) ---

async function loadUsersPage() {
    const contentArea = document.getElementById("content-area");
    const template = document.getElementById("users-template");
    
    // 1. Renderizar Template
    contentArea.innerHTML = "";
    const clone = template.content.cloneNode(true);
    contentArea.appendChild(clone);

    // 2. Cargar datos
    const tbody = document.getElementById("usersTableBody");
    try {
        const headers = getAuthHeaders();
        // Asumo endpoint GET /api/users para listar todos
        const res = await fetch(`${API_URL}/users`, { headers });
        
        if (res.ok) {
            const users = await res.json();
            renderUsersTable(users, tbody);
            
            // Listener para buscador simple
            document.getElementById('search-user').addEventListener('keyup', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = users.filter(u => 
                    u.email.toLowerCase().includes(term) || 
                    (u.nombre && u.nombre.toLowerCase().includes(term))
                );
                renderUsersTable(filtered, tbody);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar usuarios.</td></tr>';
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error de conexión.</td></tr>';
    }
}

function renderUsersTable(list, tbody) {
    tbody.innerHTML = "";
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No se encontraron usuarios.</td></tr>';
        return;
    }

    list.forEach(u => {
        // Colores para roles
        let badgeClass = "bg-secondary";
        if (u.rol === 'ADMINISTRADOR') badgeClass = "bg-danger";
        if (u.rol === 'COORDINADOR') badgeClass = "bg-primary";
        if (u.rol === 'USUARIO') badgeClass = "bg-info text-dark";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${u.id || u.userId}</td> <td class="fw-bold">${u.nombre || 'Sin Nombre'} ${u.apellido || ''}</td>
            <td>${u.email}</td>
            <td><span class="badge ${badgeClass}">${u.rol}</span></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" title="Cambiar Rol" onclick="changeUserRole(${u.id || u.userId}, '${u.rol}')">
                    <i class="bi bi-person-gear"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Eliminar" onclick="deleteUserByAdmin(${u.id || u.userId})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function changeUserRole(userId, currentRole) {
    // Usamos SweetAlert con un Select para elegir el nuevo rol
    const { value: newRole } = await Swal.fire({
        title: 'Cambiar Rol de Usuario',
        input: 'select',
        inputOptions: {
            'USUARIO': 'Usuario',
            'PRESTADOR': 'Prestador',
            'COORDINADOR': 'Coordinador',
            'GEST_DONACIONES': 'Gestor Donaciones',
            'ADMINISTRADOR': 'Administrador'
        },
        inputPlaceholder: 'Selecciona un rol',
        inputValue: currentRole,
        showCancelButton: true,
        confirmButtonText: 'Guardar'
    });

    if (newRole && newRole !== currentRole) {
        try {
            const headers = getAuthHeaders();
            headers['Content-Type'] = 'application/json';

            // Llamada al endpoint PATCH que me pasaste
            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({ newRole: newRole }) // JSON coincide con RoleUpdateRequest
            });

            if (res.ok) {
                Swal.fire('Éxito', 'Rol actualizado correctamente', 'success');
                loadUsersPage(); // Recargar tabla
            } else {
                Swal.fire('Error', 'No se pudo actualizar el rol', 'error');
            }
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Error de red', 'error');
        }
    }
}

async function deleteUserByAdmin(userId) {
    const result = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
        try {
            const headers = getAuthHeaders();
            const res = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers
            });

            if (res.ok) {
                Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
                loadUsersPage(); // Recargar tabla
            } else {
                Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
            }
        } catch (e) {
            Swal.fire('Error', 'Error de red.', 'error');
        }
    }
}

// =========================
// MÓDULO: MIS ACTIVIDADES (Historial de Usuario)
// =========================

async function loadMyActivitiesPage(title) {
  // 1. Seteamos el título
  document.getElementById("content-title").textContent = title;
  
  // 2. Cargamos el HTML externo y ejecutamos fetchMyActivities al terminar
  await loadPartial('partials/my-activities.html', fetchMyActivities);
}

async function fetchMyActivities() {
  const container = document.getElementById("myActivitiesTableBody");
  if (!container) return; 

  const headers = getAuthHeaders();
  const userId = localStorage.getItem("userId");
  if (!headers || !userId) return;

  try {
    // 1. Obtenemos las inscripciones del usuario (Nos da los IDs)
    const resInscriptions = await fetch(`${API_URL}/activities/user/${userId}`, { headers });
    
    // 2. Obtenemos el catálogo completo de actividades (Nos da los Títulos y detalles)
    const resCatalog = await fetch(`${API_URL}/activities`, { headers });

    if (resInscriptions.ok && resCatalog.ok) {
      const inscriptions = await resInscriptions.json();
      const catalog = await resCatalog.json();

      // 3. Cruzamos los datos (MATCH)
      // Por cada inscripción, buscamos su actividad completa en el catálogo
      const myActivities = inscriptions.map(insc => {
        // Detectamos si 'insc' es un objeto (ActivityParticipant) o un número directo
        const activityIdTarget = insc.activityId || insc; 
        
        // Buscamos los detalles completos
        const fullActivity = catalog.find(a => a.activityId === activityIdTarget);
        
        // Si la encontramos, mezclamos los datos (para tener titulo + datos de inscripción como 'asistio')
        if (fullActivity) {
            return { ...fullActivity, ...insc }; 
        }
        // Fallback por si no se encuentra
        return { activityId: activityIdTarget, titulo: "Actividad no disponible", tipoActividad: "-", estado: "-" };
      });

      renderMyActivitiesTable(myActivities, container);

    } else {
      if (resInscriptions.status === 404) {
        container.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">Aún no te has inscrito en ninguna actividad.</td></tr>`;
      } else {
        throw new Error("Error al sincronizar datos");
      }
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-danger"><i class="bi bi-exclamation-triangle me-2"></i> No se pudo cargar el historial completo.</td></tr>`;
  }
}

function renderMyActivitiesTable(list, container) {
  if (!list || list.length === 0) {
    container.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron inscripciones.</td></tr>`;
    return;
  }

  container.innerHTML = list.map(act => {
    const fecha = act.fechaInicio ? new Date(act.fechaInicio).toLocaleDateString() : "Sin fecha";
    
    // Lógica visual simple para el estado
    let asistenciaBadge = '<span class="badge bg-secondary">Pendiente</span>';
    if (act.estado === 'FINALIZADA') { // O lógica de 'asistio' si el backend lo trae
        asistenciaBadge = '<span class="badge bg-success">Confirmada</span>';
    }

    return `
      <tr>
        <td>
          <div class="fw-bold text-primary">${act.titulo}</div>
          <small class="text-muted">ID: ${act.activityId}</small>
        </td>
        <td>${fecha}</td>
        <td><span class="badge bg-light text-dark border">${act.tipoActividad}</span></td>
        <td class="text-center"><span class="badge bg-success">Inscrito</span></td>
        <td class="text-center">${asistenciaBadge}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" onclick="showActivityQR(${act.activityId}, '${act.titulo}')">
            <i class="bi bi-qr-code"></i> Ver QR
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Función global para el QR (para que el onclick del HTML la encuentre)
window.showActivityQR = function(id, titulo) {
  Swal.fire({
    title: 'Tu Pase de Asistencia',
    html: `
      <p class="small text-muted mb-3">Muestra este código al coordinador en: <br><strong>${titulo}</strong></p>
      <div class="d-flex justify-content-center bg-white p-3 rounded border">
        <div id="activity-qr"></div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Cerrar',
    didOpen: () => {
      // Generamos QR con el link de validación
      const qrData = `https://hugnet.app/check-in/${id}/${localStorage.getItem("userId")}`;
      new QRCode(document.getElementById("activity-qr"), {
        text: qrData,
        width: 150,
        height: 150
      });
    }
  });
};

// =========================
// NUEVAS FUNCIONES (SPRINT 4: TU APORTE & SPRINT 3: INTERCAMBIOS)
// =========================

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


/* window.initiateDonationFlow = async function(activityId, activityTitle) {

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
 */

window.initiateDonationFlow = async function(activityId, activityTitle) {
    // PASO 1: Botones en lugar de Radio
    const result = await Swal.fire({
        title: `Aportar a: ${activityTitle}`,
        text: '¿Cómo deseas colaborar?',
        icon: 'question',
        
        // Configuración de los botones
        showCancelButton: true,
        showDenyButton: true,
        
        confirmButtonText: '💵 Dinero (MP)',
        confirmButtonColor: '#0d6efd', // Azul Bootstrap
        
        denyButtonText: '📦 Especie (Bienes)',
        denyButtonColor: '#198754',    // Verde Bootstrap
        
        cancelButtonText: 'Cancelar'
    });

    // Lógica de decisión basada en qué botón tocó
    if (result.isConfirmed) {
        // Clic en "Dinero"
        await handleMonetaryDonation(activityId, activityTitle);
    } else if (result.isDenied) {
        // Clic en "Especie"
        await handleEspecieDonation(activityId, activityTitle);
    }
    // Si cancela (dismiss), no hace nada
};

// --- LÓGICA DONACIÓN MONETARIA (Tu código original adaptado) ---
async function handleMonetaryDonation(activityId, activityTitle) {
    const { value: montoStr } = await Swal.fire({
        title: 'Monto del Aporte',
        text: 'Selecciona el monto de tu colaboración',
        input: 'radio',
        inputOptions: {
            '500': '$ 500 (Colaborador)',
            '1000': '$ 1.000 (Amigo)',
            '2000': '$ 2.000 (Protector)'
        },
        inputValidator: (value) => { if (!value) return 'Debes seleccionar un monto'; },
        showCancelButton: true,
        confirmButtonText: 'Generar QR de Pago',
        cancelButtonText: 'Volver'
    });

    if (!montoStr) return;

    // Payload para Dinero
    const payload = {
        tipoDonacion: 'MONETARIA',
        monto: parseFloat(montoStr),
        descripcionItem: `Aporte Web (${activityTitle})`,
        cantidad: 1,
        itemType: null
    };

    // Llamada al Backend
    await sendDonationToBackend(payload, activityId, true); 
}

// --- LÓGICA DONACIÓN EN ESPECIE (Nuevo) ---
async function handleEspecieDonation(activityId, activityTitle) {
    const { value: formValues } = await Swal.fire({
        title: 'Donación en Especie',
        // Inyectamos HTML para tener 2 campos en la misma fila
        html: `
            <div class="row g-2 align-items-center">
                <div class="col-9">
                    <label for="swal-desc" class="form-label small text-start w-100 mb-1">Descripción</label>
                    <input id="swal-desc" class="form-control" placeholder="Ej: Paquetes de arroz, Abrigos...">
                </div>
                <div class="col-3">
                    <label for="swal-cant" class="form-label small text-start w-100 mb-1">Cant.</label>
                    <input id="swal-cant" type="number" class="form-control text-center" value="1" min="1">
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        confirmButtonColor: '#198754',
        cancelButtonText: 'Cancelar',
        // Lógica para capturar y validar los datos manualmente
        preConfirm: () => {
            const descripcion = document.getElementById('swal-desc').value;
            const cantidad = document.getElementById('swal-cant').value;

            if (!descripcion) {
                Swal.showValidationMessage('❌ Falta la descripción del ítem');
                return false;
            }
            if (!cantidad || parseInt(cantidad) < 1) {
                Swal.showValidationMessage('❌ La cantidad debe ser mayor a 0');
                return false;
            }

            return { descripcion, cantidad };
        }
    });

    // Si el usuario cancela, formValues será undefined
    if (!formValues) return;

    // Payload actualizado con la cantidad real
    const payload = {
        tipoDonacion: 'ESPECIE',
        monto: null, 
        descripcionItem: formValues.descripcion,
        cantidad: parseInt(formValues.cantidad), // <--- ¡Dato real!
        itemType: 'BIEN' 
    };

    // Llamada al Backend
    await sendDonationToBackend(payload, activityId, false);
}

// --- FUNCIÓN CENTRALIZADA PARA ENVIAR AL BACKEND ---
async function sendDonationToBackend(payload, activityId, isMonetary) {
    const headers = getAuthHeaders();
    if (!headers) return;

    // Agregamos activityId si existe
    if (activityId && activityId !== 'null' && activityId !== null) {
        payload.activityId = parseInt(activityId);
    }

    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });

    try {
        console.log("📦 Payload enviado:", JSON.stringify(payload));

        const res = await fetch(`${API_URL}/donations`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();

            if (isMonetary) {
                // TU LÓGICA DE QR / MERCADO PAGO
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
                    showDenyButton: true,
                    confirmButtonText: 'Cerrar',
                    denyButtonText: '✅ ¡Ya pagué!',
                    denyButtonColor: '#198754',
                    didOpen: () => {
                        new QRCode(document.getElementById("payment-qr"), { text: data.paymentUrl, width: 150, height: 150 });
                    }
                }).then((result) => {
                    if (result.isDenied) {
                        Swal.fire('¡Muchas Gracias!', 'Estamos verificando tu aporte.', 'success')
                            .then(() => window.location.href = "dashboard.html?view=Tu%20Aporte");
                    }
                });

            } else {
                // ÉXITO PARA ESPECIE (Mensaje simple)
                Swal.fire({
                    title: '¡Muchas Gracias!',
                    text: 'Tu donación en especie ha sido registrada. Nos pondremos en contacto para coordinar.',
                    icon: 'success',
                    confirmButtonText: 'Genial'
                }).then(() => {
                    // Recargar o redirigir
                    window.location.reload(); 
                });
            }

        } else {
            // MANEJO DE ERRORES
            const err = await res.json();
            console.error("Error Backend:", err);
            let msg = err.message || 'Error al procesar la donación';
            if (err.errors) msg += "\n" + err.errors.map(e => e.defaultMessage).join("\n");
            Swal.fire('Error', msg, 'error');
        }

    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
    }
}

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

// =========================
// MÓDULO: REPORTES (SPRINT 5)
// =========================

async function loadReportsPage(title) {
  document.getElementById("content-title").textContent = title;
  await loadPartial('partials/reports.html', async () => {
    await fetchUserRanking();
  });
}

window.switchReportTab = async function(tabName) {
  // 1. Limpieza visual (reset de clases)
  document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.report-view').forEach(view => view.classList.add('d-none'));
  
  // 2. Activar la pestaña y vista seleccionada
  // NOTA: Esto requiere que el ID del botón en HTML sea "tab-" + tabName
  const tabBtn = document.getElementById(`tab-${tabName}`);
  const tabView = document.getElementById(`view-${tabName}`);

  if (tabBtn && tabView) {
      tabBtn.classList.add('active');
      tabView.classList.remove('d-none');
  } else {
      console.error(`Error: No se encontró el botón "tab-${tabName}" o la vista "view-${tabName}". Revisa los IDs en tu HTML.`);
      return; // Detenemos aquí para evitar el error de consola
  }

  // 3. Carga de datos bajo demanda
  try {
        if (tabName === 'ranking') {
            await fetchUserRanking();
        } 
        else if (tabName === 'balance') {
            // Asegúrate de que esta función exista en tu código
            if (typeof fetchBalanceReport === 'function') await fetchBalanceReport();
        } 
        else if (tabName === 'stock') {
            await fetchStockReport();
        } 
        else if (tabName === 'types') {
            await fetchParticipationReport(); // La nueva función de hoy
        }
        // Sponsors no carga automático (requiere búsqueda manual), así que no hacemos nada
    } catch (e) {
        console.error(`Error al cargar datos para ${tabName}:`, e);
    }
  
  // ¡AGREGADO HOY! Cargar el stock automáticamente
  if (tabName === 'stock') await fetchStockReport();
  
  // Para sponsors no cargamos nada automático porque requiere ingresar ID primero 
};

async function fetchUserRanking() {
  const container = document.getElementById("rankingTableBody");
  const headers = getAuthHeaders();
  
  try {
    const res = await fetch(`${API_URL}/reports/user-ranking`, { headers });
    if (res.ok) {
      const users = await res.json();
      renderRankingTable(users, container);
    } else { throw new Error(); }
  } catch (e) {
    container.innerHTML = `<tr><td colspan="4" class="text-danger">Error al cargar el ranking.</td></tr>`;
  }
}

function renderRankingTable(users, container) {
    // Validación de seguridad para evitar errores si llega null o vacío
    if (!users || users.length === 0) {
        container.innerHTML = `<tr><td colspan="4" class="text-center py-3">No hay datos suficientes para el ranking.</td></tr>`;
        return;
    }

    let html = "";

    users.forEach((u) => {
        // 1. Definir medallas visuales según el puesto que trae el Backend
        let posBadge = `#${u.puesto}`;
        let rowClass = "";

        if (u.puesto === 1) {
            posBadge = "🥇";
            rowClass = "table-warning fw-bold"; // Color dorado para el 1ro
        } else if (u.puesto === 2) {
            posBadge = "🥈";
        } else if (u.puesto === 3) {
            posBadge = "🥉";
        }

        // 2. Calcular un "Nivel" ficticio basado en la cantidad de eventos
        // (Ej: Cada 5 eventos subes de nivel)
        const nivelCalculado = Math.floor(u.cantidadEventos / 5) + 1;

        // 3. Construir la fila usando las propiedades EXACTAS del DTO
        html += `
        <tr class="${rowClass}">
            <td class="fs-5">${posBadge}</td>
            <td class="text-start">
                <div class="fw-bold">${u.nombreCompleto}</div>
                <small class="text-muted">${u.email}</small>
            </td>
            <td>
                <span class="badge bg-info text-dark">Nivel ${nivelCalculado}</span>
            </td>
            <td class="fw-bold text-primary fs-5">
                ${u.cantidadEventos} <small class="fs-6 text-muted">eventos</small>
            </td>
        </tr>`;
    });

    container.innerHTML = html;
}

async function fetchBalanceReport() {
  const container = document.getElementById("balanceTableBody");
  const globalDisplay = document.getElementById("global-balance-display");
  const headers = getAuthHeaders();
  
  try {
    const res = await fetch(`${API_URL}/reports/financial-balance`, { headers });
    if (res.ok) {
      const reportData = await res.json();
      renderBalanceTable(reportData, container, globalDisplay);
    } else { throw new Error("Error API"); }
  } catch (e) {
    container.innerHTML = `<tr><td colspan="4" class="text-danger text-center">No se pudo cargar el balance financiero.</td></tr>`;
  }
}

function renderBalanceTable(data, container, globalDisplay) {
  if (!data || data.length === 0) {
    container.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay movimientos registrados.</td></tr>`;
    globalDisplay.textContent = "$ 0.00";
    return;
  }

  let html = "";
  let totalGlobal = 0;

  data.forEach(item => {
    // CORRECCIÓN 1: Usar el nombre exacto que envía Java (totalIngresos)
    const ingresos = item.totalIngresos || 0; 
    totalGlobal += ingresos;

    // Nota: El DTO actual no tiene campo 'status', así que mostrará '-'
    // Si quieres mostrar el estado, deberías agregarlo al BalanceReportDTO en Java.
    
    html += `
      <tr>
        <td>
          <span class="fw-bold">${item.activityTitle || 'Actividad sin nombre'}</span>
        </td>
        <td><span class="badge bg-light text-dark border">${item.status || '-'}</span></td>
        <td class="text-end text-success fw-bold">
          $ ${ingresos.toLocaleString('es-AR', {minimumFractionDigits: 2})}
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary" onclick="Swal.fire('Detalle', 'El detalle de transacciones se implementará en la v2', 'info')">
            <i class="bi bi-search"></i>
          </button>
        </td>
      </tr>`;
  });

  container.innerHTML = html;
  globalDisplay.textContent = `$ ${totalGlobal.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
}

async function fetchStockReport() {
    const container = document.getElementById("stockTableBody");
    
    // Mostramos spinner de carga antes de pedir datos
    container.innerHTML = `<tr><td colspan="5" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>`;

    try {
        const headers = getAuthHeaders();
        // Nota: Ajusta la URL si tu endpoint de reportes tiene otro prefijo, 
        // pero basado en tu controller, asumo que está bajo /api/reports
        const res = await fetch(`${API_URL}/reports/stock`, { headers });

        if (res.ok) {
            const items = await res.json();
            renderStockTable(items, container);
        } else {
            throw new Error("Error en la respuesta del servidor");
        }
    } catch (error) {
        console.error("Error cargando stock:", error);
        container.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar el reporte de stock.</td></tr>`;
    }
}

function renderStockTable(items, container) {
    if (!items || items.length === 0) {
        container.innerHTML = `<tr><td colspan="5" class="text-center py-3">No hay ítems en stock actualmente.</td></tr>`;
        return;
    }

    let html = "";

    items.forEach(item => {
        let badgeClass = "bg-secondary";
        let icon = "bi-box";

        if (item.origen === "DONACION") {
            badgeClass = "bg-success";
            icon = "bi-gift";
        } else if (item.origen === "INTERCAMBIO") {
            badgeClass = "bg-primary";
            icon = "bi-arrow-left-right";
        }

        let estadoClass = "text-muted";
        if (item.estado === "DISPONIBLE" || item.estado === "APROBADO") {
            estadoClass = "text-success fw-bold";
        } else if (item.estado === "RESERVADO") {
            estadoClass = "text-warning fw-bold";
        }

        html += `
        <tr>
            <td class="fw-bold">${item.descripcion}</td>
            <td>
                <span class="badge ${badgeClass}">
                    <i class="bi ${icon} me-1"></i>${item.origen}
                </span>
            </td>
            <td><span class="badge bg-light text-dark border">${item.categoria}</span></td>
            <td class="${estadoClass}">${item.estado}</td>
            
            <td><small class="text-muted">${item.fechaIngreso}</small></td>
        </tr>`;
    });

    container.innerHTML = html;
}

async function fetchParticipationReport() {
    const container = document.getElementById('typesTableBody');
    container.innerHTML = '<tr><td colspan="4" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>';

    try {
        const headers = getAuthHeaders();
        // Endpoint exacto que me pasaste
        const res = await fetch(`${API_URL}/reports/participation-by-type`, { headers });

        if (res.ok) {
            // Esperamos una LISTA de objetos: [{tipo: "TALLER", cantidad: 5, ...}, ...]
            const data = await res.json();
            renderParticipationTable(data, container);
        } else {
            container.innerHTML = '<tr><td colspan="4" class="text-center text-danger">No se pudo cargar el reporte.</td></tr>';
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error de conexión.</td></tr>';
    }
}

function renderParticipationTable(list, container) {
    container.innerHTML = '';

    if (!list || list.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No hay datos registrados.</td></tr>';
        return;
    }

    // CORRECCIÓN: Usamos 'item.totalEventos' que es el nombre exacto en el DTO de Java.
    const totalGlobalEventos = list.reduce((sum, item) => sum + (item.totalEventos || 0), 0);

    list.forEach(item => {
        // Mapeo exacto con los DTOs de Backend (ActivityTypeReportDTO / ReporteParticipacionDTO)
        const tipo = item.tipoActividad || "Desconocido";
        const cantidad = item.totalEventos || 0;         // Antes buscabas .cantidad
        const participantes = item.totalParticipantes || 0; 

        // Cálculo del porcentaje para la barra de progreso
        const porcentaje = totalGlobalEventos > 0 ? Math.round((cantidad / totalGlobalEventos) * 100) : 0;

        // Asignación de iconos según el tipo (Strings deben coincidir con el ENUM de Java)
        let icon = 'bi-circle';
        // Asegúrate que estos strings coincidan con tu ENUM ActivityTipe (pueden venir en mayúsculas)
        const tipoUpper = tipo.toString().toUpperCase(); 
        if (tipoUpper === 'VOLUNTARIADO') icon = 'bi-hand-thumbs-up';
        if (tipoUpper === 'DONACION') icon = 'bi-gift';
        if (tipoUpper === 'TALLER') icon = 'bi-book';
        // Agrega otros tipos si tu Enum tiene más (ej: CHARLA, EVENTO, etc.)

        const row = `
            <tr>
                <td class="fw-bold"><i class="bi ${icon} me-2 text-secondary"></i>${tipo}</td>
                <td class="text-center"><span class="badge bg-primary rounded-pill">${cantidad}</span></td>
                <td class="text-center text-muted fw-bold">${participantes}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1" style="height: 6px;">
                            <div class="progress-bar bg-info" role="progressbar" style="width: ${porcentaje}%" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <span class="ms-2 small text-muted">${porcentaje}%</span>
                    </div>
                </td>
            </tr>
        `;
        container.innerHTML += row;
    });
}

/**
 * US29: Busca el reporte de sponsors para una actividad específica.
 */
async function searchSponsorReport() {
    const activityId = document.getElementById("sponsorActivityId").value;
    const container = document.getElementById("sponsorTableBody");

    if (!activityId) {
        alert("Por favor, ingresa un ID de actividad.");
        return;
    }

    container.innerHTML = `<tr><td colspan="5" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>`;

    try {
        const headers = getAuthHeaders();
        // Asumo que el gateway redirige /api/sponsors al sponsor-service
        const res = await fetch(`${API_URL}/sponsors/activity/${activityId}/report`, { headers });

        if (res.ok) {
            const sponsors = await res.json();
            renderSponsorTable(sponsors, container, activityId);
        } else {
            container.innerHTML = `<tr><td colspan="5" class="text-center text-danger">No se encontraron datos o la actividad no existe.</td></tr>`;
        }
    } catch (error) {
        console.error("Error buscando sponsors:", error);
        container.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error de conexión.</td></tr>`;
    }
}
/**
 * Renderiza la tabla y configura el botón de notificación (US30).
 */
function renderSponsorTable(sponsors, container, activityId) {
    if (!sponsors || sponsors.length === 0) {
        container.innerHTML = `<tr><td colspan="5" class="text-center py-3">Esta actividad no tiene sponsors asignados aún.</td></tr>`;
        return;
    }

    let html = "";

    sponsors.forEach(s => {
        // Badge visual para el tipo de sponsor
        let badgeClass = s.tipoSponsor === "EMPRESA" ? "bg-dark" : "bg-info text-dark";

        html += `
        <tr>
            <td class="fw-bold">${s.nombreEmpresa}</td>
            <td><span class="badge ${badgeClass}">${s.tipoSponsor}</span></td>
            <td class="text-success fst-italic">"${s.descripcionAporte}"</td>
            <td><small class="text-muted">${s.email}</small></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" 
                        onclick="notifySponsor(${activityId}, ${s.sponsorId})">
                    <i class="bi bi-envelope-paper me-1"></i>Notificar Transparencia
                </button>
            </td>
        </tr>`;
    });

    container.innerHTML = html;
}
/**
 * US30: Envía el email de transparencia.
 */
async function notifySponsor(activityId, sponsorId) {
    if (!confirm("¿Enviar correo de agradecimiento y transparencia a este sponsor?")) return;

    try {
        const headers = getAuthHeaders();
        // Endpoint POST definido en tu Controller
        const res = await fetch(`${API_URL}/sponsors/activity/${activityId}/notify/${sponsorId}`, { 
            method: 'POST',
            headers 
        });

        if (res.ok) {
            alert("✅ ¡Email enviado con éxito!");
        } else {
            alert("❌ Error al enviar el correo. Verifique logs.");
        }
    } catch (e) {
        console.error(e);
        alert("Error de red al intentar notificar.");
    }
}
/**
 * US22: Exportar el reporte visible a PDF
 */
function downloadCurrentReportPDF() {
    // 1. Identificar qué reporte está visible
    let elementToPrint = null;
    let filename = 'hugnet_reporte.pdf';
    let title = "Reporte HugNet";

    if (!document.getElementById('view-ranking').classList.contains('d-none')) {
        elementToPrint = document.getElementById('view-ranking');
        filename = 'hugnet_ranking_usuarios.pdf';
        title = "Ranking de Usuarios";
    } else if (!document.getElementById('view-balance').classList.contains('d-none')) {
        elementToPrint = document.getElementById('view-balance');
        filename = 'hugnet_balance_financiero.pdf';
        title = "Balance Financiero";
    } else if (!document.getElementById('view-stock').classList.contains('d-none')) {
        elementToPrint = document.getElementById('view-stock');
        filename = 'hugnet_stock_unificado.pdf';
        title = "Stock de Donaciones e Intercambios";
    } else if (!document.getElementById('view-sponsors').classList.contains('d-none')) {
        elementToPrint = document.getElementById('view-sponsors');
        filename = 'hugnet_aporte_sponsors.pdf';
        title = "Reporte de Sponsors";
    }

    // 2. Validación
    if (!elementToPrint) {
        alert("No hay ningún reporte visible para exportar.");
        return;
    }

    // 3. Configuración del PDF (Márgenes y calidad)
    const opt = {
        margin:       0.5, // Márgenes en pulgadas
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 }, // Escala 2 mejora la nitidez del texto
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // 4. Generación (Usamos la librería html2pdf)
    // Clonamos el elemento para agregarle un título al PDF sin modificar la web
    const clone = elementToPrint.cloneNode(true);
    
    // Agregamos un encabezado simple al clon para que salga en el PDF
    const header = document.createElement('div');
    header.innerHTML = `<h2 style="text-align:center; color:#0d6efd; margin-bottom:20px;">${title}</h2><p style="text-align:center;">Generado el: ${new Date().toLocaleDateString()}</p>`;
    clone.insertBefore(header, clone.firstChild);

    // Ejecutamos la conversión
    html2pdf().set(opt).from(clone).save();
}

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

document.addEventListener('click', function(e) {
    // Verificamos si el elemento clickeado es la pestaña de "Stock Unificado"
    // (Buscamos por el texto del botón/pestaña)
    if (e.target && e.target.innerText.includes('Stock Unificado')) {
        console.log("Pestaña Stock detectada -> Cargando datos...");
        
        // 1. Opcional: Asegurarse de que la vista esté visible (si usas lógica manual)
        // document.getElementById('view-stock').classList.remove('d-none');
        
        // 2. Ejecutar la función que conecta con el Backend
        fetchStockReport();
    }
});

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

// --- AGREGA ESTO AL FINAL DE APP.JS (Para evitar errores hasta que hagamos los modales) ---
async function openAttendeesModal(activityId) {
    // 1. Inicializar el Modal de Bootstrap
    const modalEl = document.getElementById('attendeesModal');
    const listContainer = document.getElementById('attendeesList');
    
    // Si no usamos una variable global para el modal, lo instanciamos cada vez
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // 2. Feedback visual de carga
    listContainer.innerHTML = `
        <li class="list-group-item text-center py-4">
            <div class="spinner-border text-primary spinner-border-sm mb-2"></div>
            <div class="text-muted small">Consultando inscripciones...</div>
        </li>`;

    try {
        const headers = getAuthHeaders();
        // NOTA: Usamos el endpoint de REPORTES porque es el que trae los nombres reales (US23/Mejora UX)
        // Ajusta la URL si tu endpoint se llama diferente (ej: /participants-list)
        const res = await fetch(`${API_URL}/reports/activity/${activityId}/participants-list`, { headers });

        if (res.ok) {
            const attendees = await res.json();
            renderAttendeesList(attendees, listContainer);
        } else {
            // Si da 404 puede ser que nadie se inscribió aún o el endpoint falla
            listContainer.innerHTML = `<li class="list-group-item text-center text-muted py-3">No se encontraron inscriptos o hubo un error.</li>`;
        }
    } catch (e) {
        console.error("Error cargando asistentes:", e);
        listContainer.innerHTML = `<li class="list-group-item text-center text-danger py-3">Error de conexión al buscar asistentes.</li>`;
    }
}

/**
 * Dibuja cada fila de usuario dentro del modal.
 */
function renderAttendeesList(list, container) {
    container.innerHTML = '';

    if (!list || list.length === 0) {
        container.innerHTML = `<li class="list-group-item text-center text-muted py-4"><i class="bi bi-person-x fs-1 d-block mb-2"></i>Aún no hay inscriptos.</li>`;
        return;
    }

    list.forEach(user => {
        // Asumo que el DTO trae: { nombre, apellido, email, (opcional: fechaInscripcion) }
        // Si tu DTO usa 'nombreCompleto', ajusta aquí.
        const nombreMostrar = user.nombreCompleto || `${user.nombre} ${user.apellido}`;
        
        container.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold text-dark">${nombreMostrar}</div>
                    <small class="text-muted"><i class="bi bi-envelope me-1"></i>${user.email}</small>
                </div>
                <span class="badge bg-success bg-opacity-10 text-success rounded-pill">
                    Inscripto
                </span>
            </li>
        `;
    });
}
async function openAddSponsorModal(activityId) {
    // 1. Guardar el ID de la actividad en el input oculto
    document.getElementById('assignActivityId').value = activityId;
    document.getElementById('contributionDesc').value = ''; // Limpiar campo anterior
    
    // 2. Abrir el modal visualmente
    const modalEl = document.getElementById('assignSponsorModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // 3. Cargar lista de Sponsors en el <select>
    const select = document.getElementById('sponsorSelect');
    select.innerHTML = '<option value="" selected disabled>Cargando...</option>';

    try {
        const headers = getAuthHeaders();
        // Endpoint estándar para listar sponsors (CRUD básico)
        const res = await fetch(`${API_URL}/sponsors`, { headers }); 
        
        if (res.ok) {
            const sponsors = await res.json();
            
            if (sponsors.length === 0) {
                select.innerHTML = '<option value="" disabled>No hay sponsors registrados</option>';
                return;
            }

            // Llenar el select
            let options = '<option value="" selected disabled>Elige un sponsor...</option>';
            sponsors.forEach(s => {
                options += `<option value="${s.sponsorId}">${s.nombre} (${s.tipo})</option>`;
            });
            select.innerHTML = options;

        } else {
            select.innerHTML = '<option value="" disabled>Error al cargar sponsors</option>';
        }
    } catch (e) {
        console.error(e);
        select.innerHTML = '<option value="" disabled>Error de conexión</option>';
    }
}

/**
 * Envía la asignación al Backend (US28).
 */
async function submitSponsorAssignment() {
    const activityId = document.getElementById('assignActivityId').value;
    const sponsorId = document.getElementById('sponsorSelect').value;
    const descripcion = document.getElementById('contributionDesc').value;

    // Validaciones simples
    if (!sponsorId) {
        Swal.fire('Error', 'Debes seleccionar un sponsor.', 'warning');
        return;
    }
    if (!descripcion.trim()) {
        Swal.fire('Error', 'Debes describir el aporte.', 'warning');
        return;
    }

    try {
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';

        // Endpoint US28: POST /api/sponsors/{id}/assign (Según Documento Maestro v4)
        // Body: { activityId: ..., descripcionAporte: ... }
        const payload = {
            activityId: parseInt(activityId),
            descripcionAporte: descripcion
        };

        const res = await fetch(`${API_URL}/sponsors/${sponsorId}/assign`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            // Cerrar modal
            const modalEl = document.getElementById('assignSponsorModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            await Swal.fire('¡Asignado!', 'El sponsor ha sido vinculado al evento.', 'success');
            // Opcional: Recargar algo si fuera necesario, pero aquí no hace falta
        } else {
            const errorTxt = await res.text(); // Intentar leer mensaje del backend
            Swal.fire('Error', `No se pudo asignar: ${errorTxt || 'Error desconocido'}`, 'error');
        }

    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'Error de red al intentar asignar.', 'error');
    }
}