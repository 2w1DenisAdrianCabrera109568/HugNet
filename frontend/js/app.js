// =========================
// DEFINICIONES GLOBALES
// =========================
const API_URL = "http://localhost:8080/api"; // Gateway

// Definiciones de Regex para validación
const REGEX_EMAIL = /^\S+@\S+\.\S+$/;
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,16}$/;

// Definición de las rutas/secciones de la app
const APP_ROUTES = {
  DASHBOARD: { title: "Dashboard de Actividades", icon: "bi-table", loader: loadActivitiesDashboard },
  PROFILE: { title: "Mi Perfil", icon: "bi-person-fill", loader: loadComingSoon },
  MY_ACTIVITIES: { title: "Mis Actividades", icon: "bi-calendar-check-fill", loader: loadComingSoon },
  USER_MANAGEMENT: { title: "Gestión de Usuarios", icon: "bi-person-video3", loader: loadComingSoon },
  ACTIVITY_MANAGEMENT: { title: "Gestión de Actividades", icon: "bi-pencil-square", loader: loadActivitiesDashboard },
  REPORTS: { title: "Reportes", icon: "bi-clipboard-data-fill", loader: loadComingSoon },
  DONATIONS: { title: "Ver Donaciones", icon: "bi-box-heart-fill", loader: fetchDonations }
};

// Definición de los menús por ROL
const ROLE_MENUS = {
  ADMINISTRADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.ACTIVITY_MANAGEMENT, APP_ROUTES.USER_MANAGEMENT, APP_ROUTES.DONATIONS, APP_ROUTES.REPORTS, APP_ROUTES.PROFILE],
  COORDINADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.REPORTS, APP_ROUTES.PROFILE],
  GESTOR_DONACIONES: [APP_ROUTES.DONATIONS, APP_ROUTES.DASHBOARD, APP_ROUTES.PROFILE],
  USUARIO: [APP_ROUTES.DASHBOARD, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.PROFILE]
};

// =========================
// FUNCIONES AUXILIARES DE UTILIDAD
// =========================

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return null;
  }
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function setupPasswordToggle(inputId, buttonId) {
  const passwordInput = document.getElementById(inputId);
  const toggleButton = document.getElementById(buttonId);
  if (!passwordInput || !toggleButton) return;
  const icon = toggleButton.querySelector("i");

  toggleButton.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.className = "bi bi-eye-fill";
    } else {
      passwordInput.type = "password";
      icon.className = "bi bi-eye-slash-fill";
    }
  });
}

/**
 * ¡NUEVO! Inicializa los Popovers de Bootstrap
 */
function initializePopovers() {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
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
    case "index.html":
    case "":
      initLoginPage();
      break;
    case "register.html":
      initRegisterPage();
      break;
    case "menu.html":
      initMenuPage();
      break;
    case "dashboard.html":
      initDashboardPage();
      break;
  }
});

// =========================
// LÓGICA DE PÁGINAS
// =========================

function initLoginPage() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("loginMessage");
  
  setupPasswordToggle("password", "togglePassword");
  initializePopovers(); // ¡Activamos las ventanitas flotantes!

  // Limpiar errores al escribir
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      message.textContent = "";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";
    let isValid = true;

    // --- ¡NUEVA VALIDACIÓN! ---
    if (!REGEX_EMAIL.test(emailInput.value)) {
      emailInput.classList.add('is-invalid');
      isValid = false;
    }
    if (!REGEX_PASSWORD.test(passwordInput.value)) {
      passwordInput.classList.add('is-invalid');
      isValid = false;
    }
    if (!isValid) return;
    // --- FIN VALIDACIÓN ---

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
      });

      if (response.ok) {
        const loginData = await response.json();
        localStorage.setItem("token", loginData.token);
        localStorage.setItem("userEmail", loginData.email);
        localStorage.setItem("userRol", loginData.rol);
        localStorage.setItem("userId", loginData.userId); 
        window.location.href = "menu.html"; 
      } else {
        const errorData = await response.json();
        message.textContent = errorData.message || "Credenciales incorrectas.";
      }
    } catch (error) {
      console.error("Error en login:", error);
      message.textContent = "Error de conexión con el servidor.";
    }
  });
}

function initRegisterPage() {
  const form = document.getElementById("registerForm");
  const message = document.getElementById("registerMessage");
  const nombreInput = document.getElementById("nombre");
  const apellidoInput = document.getElementById("apellido");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  setupPasswordToggle("password", "togglePassword");
  initializePopovers(); // ¡Activamos las ventanitas flotantes!

  // Limpiar errores al escribir
  [nombreInput, apellidoInput, emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      message.textContent = "";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";
    let isValid = true;

    // --- ¡NUEVA VALIDACIÓN! ---
    if (nombreInput.value.trim() === "") {
      nombreInput.classList.add('is-invalid');
      isValid = false;
    }
    if (apellidoInput.value.trim() === "") {
      apellidoInput.classList.add('is-invalid');
      isValid = false;
    }
    if (!REGEX_EMAIL.test(emailInput.value)) {
      emailInput.classList.add('is-invalid');
      isValid = false;
    }
    if (!REGEX_PASSWORD.test(passwordInput.value)) {
      passwordInput.classList.add('is-invalid');
      isValid = false;
    }
    if (!isValid) return;
    // --- FIN VALIDACIÓN ---

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre: nombreInput.value, 
          apellido: apellidoInput.value, 
          email: emailInput.value, 
          password: passwordInput.value, 
          rol: "USUARIO" 
        })
      });

      if (response.ok) {
        Swal.fire({
          title: '¡Registro Exitoso!',
          text: 'Tu cuenta ha sido creada. Serás redirigido al login.',
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        }).then(() => {
          window.location.href = "index.html";
        });
      } else {
        const errorData = await response.json();
        message.className = "mt-3 text-center small text-danger";
        message.textContent = errorData.message || "Error en el registro. (El email ya puede estar en uso)";
      }
    } catch (error) {
      console.error("Error en registro:", error);
      message.className = "mt-3 text-center small text-danger";
      message.textContent = "Error de conexión con el servidor.";
    }
  });
}

function initMenuPage() {
  const userEmail = localStorage.getItem("userEmail");
  const userRol = localStorage.getItem("userRol");
  
  document.getElementById("userName").textContent = userEmail || "Usuario";
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);

  const menuContainer = document.getElementById("menu-options");
  menuContainer.innerHTML = "";

  const menuItems = ROLE_MENUS[userRol] || ROLE_MENUS.USUARIO;

  menuItems.forEach((item, index) => {
    const button = document.createElement("a");
    button.href = `dashboard.html?view=${encodeURIComponent(item.title)}`;
    button.className = `btn btn-lg ${index === 0 ? 'btn-primary' : 'btn-outline-primary'}`;
    button.innerHTML = `<i class="bi ${item.icon} me-2"></i> ${item.title}`;
    menuContainer.appendChild(button);
  });
}

function initDashboardPage() {
  const userEmail = localStorage.getItem("userEmail");
  const userRol = localStorage.getItem("userRol");

  document.getElementById("userName").textContent = userEmail || "Usuario";
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);

  const navContainer = document.getElementById("sidebar-nav");
  navContainer.innerHTML = "";

  const menuItems = ROLE_MENUS[userRol] || ROLE_MENUS.USUARIO;

  menuItems.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "nav-item";
    
    const link = document.createElement("a");
    link.href = `?view=${encodeURIComponent(item.title)}`;
    link.className = "nav-link text-white";
    link.innerHTML = `<i class="bi ${item.icon} me-2"></i> ${item.title}`;
    
    link.onclick = (e) => {
      e.preventDefault();
      document.querySelectorAll("#sidebar-nav .nav-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      item.loader(item.title);
      // Actualiza la URL sin recargar la página
      window.history.pushState(null, '', `dashboard.html?view=${encodeURIComponent(item.title)}`);
    };

    li.appendChild(link);
    navContainer.appendChild(li);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view');
  
  let viewToLoad = menuItems[0];
  
  if (view) {
    const foundView = menuItems.find(item => item.title === view);
    if (foundView) viewToLoad = foundView;
  }

  viewToLoad.loader(viewToLoad.title);
  const activeLink = document.querySelector(`#sidebar-nav a[href="?view=${encodeURIComponent(viewToLoad.title)}"]`);
  if (activeLink) activeLink.classList.add("active");
}

// =========================
// FUNCIONES DE CARGA DE CONTENIDO
// =========================

async function loadActivitiesDashboard(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");
  
  contentTitle.textContent = title;
  contentArea.innerHTML = `
    <div class="card-body p-4">
      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle text-center">
          <thead class="table-primary">
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="activityTableBody">
            <tr><td colspan="6" class="text-muted p-4">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  await fetchActivities(document.getElementById("activityTableBody"));
}

function loadComingSoon(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");
  
  contentTitle.textContent = title;
  contentArea.innerHTML = `
    <div class="card-body p-4 text-center">
      <h3 class="text-muted">Próximamente...</h3>
      <p>Esta sección (${title}) está en construcción.</p>
    </div>
  `;
}

// =========================
// FUNCIONES AUXILIARES (Llamadas a API, etc.)
// =========================

async function fetchActivities(tableBody) {
  const headers = getAuthHeaders();
  if (!headers) return; 

  try {
    const response = await fetch(`${API_URL}/activities`, {
      method: "GET",
      headers: headers
    });

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }
    if (!response.ok) throw new Error("Error al obtener actividades");

    const activities = await response.json();
    renderActivities(activities, tableBody);
  } catch (error) {
    console.error("Error al cargar actividades:", error);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-danger p-4">Error al conectar con el servidor de actividades.</td></tr>`;
  }
}

function renderActivities(activities, tableBody) {
  const userRol = localStorage.getItem("userRol");

  let filteredActivities = activities;

  if (userRol === 'USUARIO') {
    filteredActivities = activities.filter(activity => 
      activity.estado === 'ABIERTO' || activity.estado === 'EN_CURSO'
    );
  }
  if (userRol === 'COORDINADOR') {
    filteredActivities = activities.filter(activity => 
      activity.estado !== 'PENDIENTE'
    );
  }

  if (!filteredActivities || filteredActivities.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-muted p-4">No hay actividades disponibles para ti.</td></tr>`;
    return;
  }

  tableBody.innerHTML = "";

  filteredActivities.forEach(activity => {
    const tr = document.createElement("tr");
    
    let buttons = ''; 
    const isActivityOpen = activity.estado === 'ABIERTO';

    if (userRol !== 'ADMINISTRADOR') {
      const disabledAttr = isActivityOpen ? '' : `disabled title="Solo puedes unirte a actividades 'ABIERTAS'"`;
      buttons += `
        <button class="btn btn-sm btn-outline-primary" 
                onclick="joinActivity(${activity.activityId})" ${disabledAttr}>
          Participar
        </button>
      `;
    }
    
    if (userRol === 'ADMINISTRADOR' && activity.estado === 'PENDIENTE') {
      buttons += `
        <button class="btn btn-sm btn-success ms-2" 
                onclick="validateActivity(${activity.activityId}, 'ABIERTO')">
          Aprobar
        </button>
        <button class="btn btn-sm btn-danger ms-2" 
                onclick="validateActivity(${activity.activityId}, 'SUSPENDIDO')">
          Rechazar
        </button>
      `;
    }
    
    if (userRol === 'ADMINISTRADOR' || userRol === 'COORDINADOR') {
      buttons += `
        <button class="btn btn-sm btn-outline-info ms-2" 
                onclick="viewParticipants(${activity.activityId})">
          Ver Lista
        </button>
      `;
    }

    let estadoBadge = '';
    switch (activity.estado) {
      case 'PENDIENTE': estadoBadge = '<span class="badge bg-warning text-dark">PENDIENTE</span>'; break;
      case 'ABIERTO': estadoBadge = '<span class="badge bg-success">ABIERTO</span>'; break;
      case 'EN_CURSO': estadoBadge = '<span class="badge bg-info">EN CURSO</span>'; break;
      case 'FINALIZADO': estadoBadge = '<span class="badge bg-secondary">FINALIZADO</span>'; break;
      case 'SUSPENDIDO': estadoBadge = '<span class="badge bg-danger">SUSPENDIDO</span>'; break;
      default: estadoBadge = `<span class="badge bg-dark">${activity.estado}</span>`;
    }

    const fecha = activity.fechaInicio ? new Date(activity.fechaInicio).toLocaleDateString() : "-";

    tr.innerHTML = `
      <td>${activity.activityId}</td>
      <td>${activity.titulo}</td>
      <td>${activity.tipoActividad}</td>
      <td>${fecha}</td>
      <td>${estadoBadge}</td>
      <td>${buttons}</td>
    `;
    tableBody.appendChild(tr);
  });
}

async function fetchDonations(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");
  contentTitle.textContent = title;
  contentArea.innerHTML = `<div class="card-body p-4 text-muted">Cargando datos de donaciones...</div>`;
  
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    const response = await fetch(`${API_URL}/donations`, {
      method: "GET",
      headers: headers
    });

    if (response.ok) {
      const donations = await response.json();
      const formattedJson = JSON.stringify(donations, null, 2);
      
      contentArea.innerHTML = `
        <div class="card-body p-4">
          <p class="text-muted">Datos obtenidos del <strong>donation-service</strong>:</p>
          <pre style="max-height: 400px; overflow-y: auto; background-color: #eee; padding: 1rem; border-radius: 0.5rem;">${formattedJson}</pre>
        </div>
      `;
    } else {
      const error = await response.json();
      contentArea.innerHTML = `<div class="card-body p-4"><div class="alert alert-danger">No se pudo cargar donaciones: ${error.message}</div></div>`;
    }
  } catch (error) {
    console.error("Error al cargar donaciones:", error);
    contentArea.innerHTML = `<div class="card-body p-4"><div class="alert alert-danger">Error de conexión con el servidor de donaciones.</div></div>`;
  }
}

// ===================================================
// FUNCIONES GLOBALES (llamadas por onclick)
// ===================================================

window.joinActivity = async function(activityId) {
  const headers = getAuthHeaders();
  const userId = localStorage.getItem("userId");
  
  if (!headers || !userId) {
    Swal.fire('Error', 'Debe iniciar sesión para participar.', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/activities/${activityId}/join/${userId}`, {
      method: "POST",
      headers: headers
    });

    if (response.ok) {
      Swal.fire('¡Éxito!', 'Te has unido a la actividad.', 'success');
    } else {
      const error = await response.json();
      Swal.fire('Error', `No se pudo unir: ${error.message}`, 'error');
    }
  } catch (error) {
    console.error("Error al unirse a actividad:", error);
    Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
  }
}

window.validateActivity = async function(activityId, newStatus) {
  const headers = getAuthHeaders();
  if (!headers) return;

  const actionText = newStatus === 'ABIERTO' ? 'Aprobar' : 'Rechazar';
  const newStatusText = newStatus === 'ABIERTO' ? 'ABIERTA' : 'SUSPENDIDO';

  try {
    const response = await fetch(`${API_URL}/admin/activities/${activityId}/status`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ newStatus: newStatus })
    });

    if (response.ok) {
      Swal.fire(`¡Éxito!`, `La actividad ha sido marcada como ${newStatusText}.`, 'success');
      loadActivitiesDashboard("Gestión de Actividades");
    } else {
      const error = await response.json();
      Swal.fire('Error', `Error al ${actionText}: ${error.message}`, 'error');
    }
  } catch (error) {
    console.error("Error al validar:", error);
    Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
  }
}

window.viewParticipants = async function(activityId) {
  const headers = getAuthHeaders();
  if (!headers) return; 

  try {
    const response = await fetch(`${API_URL}/activities/${activityId}/participants`, {
      method: "GET",
      headers: headers
    });

    if (response.ok) {
      const participantIds = await response.json();
      
      if (participantIds.length === 0) {
        Swal.fire('Info', 'Aún no hay participantes inscritos en esta actividad.', 'info');
      } else {
        Swal.fire('Participantes (IDs)', `Próximamente verás los nombres.\nIDs: ${participantIds.join(', ')}`, 'info');
      }

    } else {
      const error = await response.json();
      Swal.fire('Error', `Error al ver participantes: ${error.message}`, 'error');
    }
  } catch (error) {
    console.error("Error al ver participantes:", error);
    Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
  }
}