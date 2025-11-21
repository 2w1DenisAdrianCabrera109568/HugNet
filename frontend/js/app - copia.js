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
  // --- NUEVA RUTA SPRINT 3 ---
  EXCHANGES: { title: "Intercambios", icon: "bi-arrow-left-right", loader: loadExchangePage },
  // -------------------------
  FAQS: { title: "Preguntas Frecuentes", icon: "bi-question-circle-fill", loader: loadFaqPage },
  ABOUT: { title: "Acerca de HugNet", icon: "bi-info-circle-fill", loader: loadAboutPage },
  CONTACT: { title: "Contacto", icon: "bi-envelope-fill", loader: loadContactPage },
  // --------------------
  MY_ACTIVITIES: { title: "Mis Actividades", icon: "bi-calendar-check-fill", loader: loadComingSoon },
  USER_MANAGEMENT: { title: "Gestion de Usuarios", icon: "bi-person-video3", loader: loadComingSoon },
  ACTIVITY_MANAGEMENT: { title: "Gestion de Actividades", icon: "bi-pencil-square", loader: loadActivitiesDashboard },
  REPORTS: { title: "Reportes", icon: "bi-clipboard-data-fill", loader: loadComingSoon },
  DONATIONS: { title: "Ver Donaciones", icon: "bi-box-heart-fill", loader: fetchDonations },
  PROFILE: { title: "Mi Perfil", icon: "bi-person-fill", loader: loadComingSoon },
};
// Rutas de utilidad (FAQs, About, Contact, Profile)
const UTILITY_ROUTE_TITLES = [APP_ROUTES.FAQS.title, APP_ROUTES.ABOUT.title, APP_ROUTES.CONTACT.title, APP_ROUTES.PROFILE.title];

// Definicion de los menus por ROL
// --- ACTUALIZADO CON SPRINT 3 (EXCHANGES y PRESTADOR) ---
const ROLE_MENUS = {
  ADMINISTRADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.ACTIVITY_MANAGEMENT, APP_ROUTES.EXCHANGES, APP_ROUTES.USER_MANAGEMENT, APP_ROUTES.DONATIONS, APP_ROUTES.REPORTS, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE],
  COORDINADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.EXCHANGES, APP_ROUTES.REPORTS, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE],
  GESTOR_DONACIONES: [APP_ROUTES.DONATIONS, APP_ROUTES.DASHBOARD, APP_ROUTES.EXCHANGES, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE],
  USUARIO: [APP_ROUTES.DASHBOARD, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.EXCHANGES, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE],
  PRESTADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.EXCHANGES, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.FAQS, APP_ROUTES.ABOUT, APP_ROUTES.CONTACT, APP_ROUTES.PROFILE]
};

//const ROLE_MENUS = {
//  ADMINISTRADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.ACTIVITY_MANAGEMENT, APP_ROUTES.EXCHANGES, APP_ROUTES.USER_MANAGEMENT, APP_ROUTES.DONATIONS, APP_ROUTES.REPORTS, APP_ROUTES.PROFILE],
//  COORDINADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.EXCHANGES, APP_ROUTES.REPORTS, APP_ROUTES.PROFILE],
//  GESTOR_DONACIONES: [APP_ROUTES.DONATIONS, APP_ROUTES.DASHBOARD, APP_ROUTES.EXCHANGES, APP_ROUTES.PROFILE],
//  USUARIO: [APP_ROUTES.DASHBOARD, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.EXCHANGES, APP_ROUTES.PROFILE],
  // Nuevo Rol
//  PRESTADOR: [APP_ROUTES.DASHBOARD, APP_ROUTES.EXCHANGES, APP_ROUTES.MY_ACTIVITIES, APP_ROUTES.PROFILE]
//};

// =========================
// FUNCIONES AUXILIARES DE UTILIDAD
// =========================

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("⚠️ No hay token guardado");
    // Usamos SweetAlert para una mejor UX
    Swal.fire({
      title: 'Sesion Expirada',
      text: 'Tu sesion ha expirado. Seras redirigido al login.',
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

  if (!passwordInput || !toggleButton) {
    console.warn(`⚠️ No se encontro elemento: ${inputId} o ${buttonId}`);
    return;
  }

  const icon = toggleButton.querySelector("i");
  console.log(`✅ Toggle configurado para ${inputId}`);

  toggleButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      if (icon) icon.className = "bi bi-eye-fill";
      toggleButton.classList.add("active");
      console.log("👁️ Mostrar contrasena");
    } else {
      passwordInput.type = "password";
      if (icon) icon.className = "bi bi-eye-slash-fill";
      toggleButton.classList.remove("active");
      console.log("👁️ Ocultar contrasena");
    }
  });
}

function initializePopovers() {
  try {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
    console.log("✅ Popovers inicializados");
  } catch (error) {
    console.warn("⚠️ Error al inicializar popovers:", error);
  }
}

// =========================
// ENRUTADOR PRINCIPAL
// =========================
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOMContentLoaded disparado");

  const currentPage = window.location.pathname.split("/").pop();
  console.log("📍 Pagina actual:", currentPage);

  // menu.html y dashboard.html son las paginas protegidas
  const isProtectedPage = ["menu.html", "dashboard.html"].includes(currentPage);

  if (isProtectedPage && !localStorage.getItem("token")) {
    console.warn("🔒 Pagina protegida sin token, redirigiendo a index.html");
    window.location.href = "index.html";
    return;
  }

  switch (currentPage) {
    case "index.html":
    case "":
      console.log("🔐 Inicializando pagina de LOGIN");
      initLoginPage();
      break;
    case "register.html":
      console.log("📝 Inicializando pagina de REGISTRO");
      initRegisterPage();
      break;
    case "menu.html":
      console.log("🎯 Inicializando pagina de MENU");
      initMenuPage();
      break;
    case "dashboard.html":
      console.log("📊 Inicializando pagina de DASHBOARD");
      initDashboardPage();
      break;
    default:
      console.warn("⚠️ Pagina no reconocida:", currentPage);
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

  if (!form || !emailInput || !passwordInput) {
    console.error("❌ Elementos del formulario no encontrados");
    return;
  }

  console.log("✅ Elementos del login encontrados");

  setupPasswordToggle("password", "togglePassword");
  initializePopovers();

  // Limpiar errores al escribir
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      message.textContent = "";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📨 Formulario de login enviado");

    message.textContent = "";
    let isValid = true;

    // Validacion
    if (!REGEX_EMAIL.test(emailInput.value)) {
      console.warn("❌ Email invalido:", emailInput.value);
      emailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      console.log("✅ Email valido");
    }

    if (!REGEX_PASSWORD.test(passwordInput.value)) {
      console.warn("❌ Contrasena no cumple requisitos");
      passwordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      console.log("✅ Contrasena valida");
    }

    if (!isValid) {
      console.log("🛑 Validacion fallida");
      return;
    }

    try {
      console.log("🌐 Enviando solicitud de login a:", `${API_URL}/users/login`);

      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
      });

      console.log("📊 Respuesta recibida, status:", response.status);

      if (response.ok) {
        const loginData = await response.json();
        console.log("✅ Login exitoso");
        console.log("📦 Datos recibidos:", loginData);

        localStorage.setItem("token", loginData.token);
        localStorage.setItem("userEmail", loginData.email);
        localStorage.setItem("userRol", loginData.rol);
        localStorage.setItem("userId", loginData.userId);

        console.log("💾 Datos guardados en localStorage");
        console.log("➡️ Redirigiendo a menu.html");

        window.location.href = "menu.html";
      } else {
        const errorData = await response.json();
        console.error("❌ Error en login:", errorData);
        message.textContent = errorData.message || "Credenciales incorrectas.";
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
      message.textContent = "Error de conexion con el servidor.";
      console.error("Detalle del error:", error.message);
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
  const termsCheck = document.getElementById("termsCheck");

  if (!form || !nombreInput || !apellidoInput || !emailInput || !passwordInput) {
    console.error("❌ Elementos del formulario de registro no encontrados");
    return;
  }

  console.log("✅ Elementos del registro encontrados");

  setupPasswordToggle("password", "togglePassword");
  initializePopovers();

  // Limpiar errores al escribir
  [nombreInput, apellidoInput, emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      message.textContent = "";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📨 Formulario de registro enviado");

    message.textContent = "";
    let isValid = true;

    // Validacion
    if (nombreInput.value.trim() === "") {
      console.warn("❌ Nombre vacio");
      nombreInput.classList.add('is-invalid');
      isValid = false;
    }
    if (apellidoInput.value.trim() === "") {
      console.warn("❌ Apellido vacio");
      apellidoInput.classList.add('is-invalid');
      isValid = false;
    }
    if (!REGEX_EMAIL.test(emailInput.value)) {
      console.warn("❌ Email invalido:", emailInput.value);
      emailInput.classList.add('is-invalid');
      isValid = false;
    }
    if (!REGEX_PASSWORD.test(passwordInput.value)) {
      console.warn("❌ Contrasena no cumple requisitos");
      passwordInput.classList.add('is-invalid');
      isValid = false;
    }

    if (!isValid) {
      console.log("🛑 Validacion fallida");
      return;
    }
    if (!termsCheck.checked) {
      console.warn("❌ Términos no aceptados");
      termsCheck.classList.add('is-invalid');
      // Asegurarse que el feedback se muestre
      termsCheck.nextElementSibling.nextElementSibling.style.display = 'block';
      isValid = false;
    } else {
      termsCheck.classList.remove('is-invalid');
      termsCheck.nextElementSibling.nextElementSibling.style.display = 'none';
    }

    try {
      console.log("🌐 Enviando solicitud de registro a:", `${API_URL}/users/register`);

      // --- REFACTORIZADO ---
      // Se elimino "rol: 'USUARIO'" del body.
      // El backend ahora asigna el rol por defecto (mas seguro).
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreInput.value,
          apellido: apellidoInput.value,
          email: emailInput.value,
          password: passwordInput.value
        })
      });

      console.log("📊 Respuesta recibida, status:", response.status);

      if (response.ok) {
        console.log("✅ Registro exitoso");
        Swal.fire({
          title: '¡Registro Exitoso!',
          text: 'Tu cuenta ha sido creada. Seras redirigido al login.',
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        }).then(() => {
          window.location.href = "index.html";
        });
      } else {
        // Manejo de error de validacion del backend
        const errorData = await response.json();
        console.error("❌ Error en registro:", errorData);
        if (errorData.errors) {
          const errorMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join('\n');
          message.textContent = errorMessages;
        } else {
          message.textContent = errorData.message || "Error en el registro. (El email ya puede estar en uso)";
        }
      }
    } catch (error) {
      console.error("❌ Error en registro:", error);
      message.className = "mt-3 text-center small text-danger";
      message.textContent = "Error de conexion con el servidor.";
    }
  });
}

function initMenuPage() {
  const userEmail = localStorage.getItem("userEmail");
  const userRol = localStorage.getItem("userRol");

  console.log("👤 Usuario:", userEmail, "Rol:", userRol);

  const userNameElement = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userNameElement) {
    userNameElement.textContent = userEmail || "Usuario";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  const menuContainer = document.getElementById("menu-options");
  if (!menuContainer) {
    console.error("❌ Contenedor de menu no encontrado");
    return;
  }

  menuContainer.innerHTML = ""; // Limpiamos el contenedor

  // Usamos el ROL para obtener las opciones de menu
  const menuItems = ROLE_MENUS[userRol];

  if (!menuItems || menuItems.length === 0) {
    console.warn(`⚠️ Rol invalido o no encontrado: ${userRol}`);
    menuContainer.innerHTML = '<p class="alert alert-warning">No tienes permisos para ver este menu.</p>';
    return;
  }

  console.log(`✅ Mostrando ${menuItems.length} opciones de menu para rol: ${userRol}`);

  // Creamos los botones del menu dinamicamente
  menuItems.forEach((item, index) => {
    const button = document.createElement("a");
    // Todos los botones llevan al dashboard, pero con un parametro "view"
    button.href = `dashboard.html?view=${encodeURIComponent(item.title)}`;
    button.className = `btn btn-lg ${index === 0 ? 'btn-primary' : 'btn-outline-primary'}`;
    button.innerHTML = `<i class="bi ${item.icon} me-2"></i> ${item.title}`;
    menuContainer.appendChild(button);
  });
}

function initDashboardPage() {
  const userEmail = localStorage.getItem("userEmail");
  const userRol = localStorage.getItem("userRol");

  console.log("📊 Dashboard - Usuario:", userEmail, "Rol:", userRol);

  // 1. Configurar Info de Usuario y Logout
  const userNameElement = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userNameElement) {
    userNameElement.textContent = userEmail || "Usuario";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // 2. Construir la Barra Lateral (Sidebar)
  const navContainer = document.getElementById("sidebar-nav");
  if (!navContainer) {
    console.error("❌ Contenedor de navegacion no encontrado");
    return;
  }

  navContainer.innerHTML = ""; // Limpiar por si acaso

  const menuItems = ROLE_MENUS[userRol];

  if (!menuItems || menuItems.length === 0) {
    console.warn(`⚠️ Rol invalido o no encontrado: ${userRol}`);
    navContainer.innerHTML = '<li class="alert alert-warning">No tienes permisos para acceder.</li>';
    return;
  }

  console.log(`✅ Configurando sidebar con ${menuItems.length} opciones`);

  menuItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = "nav-item";

    const link = document.createElement("a");
    link.href = `?view=${encodeURIComponent(item.title)}`;
    link.className = "nav-link text-white";
    link.innerHTML = `<i class="bi ${item.icon} me-2"></i> ${item.title}`;

    // Event listener para cargar contenido
    link.onclick = async (e) => {
      e.preventDefault();
      console.log("📌 Clickeado:", item.title);
      // Resaltar link activo
      document.querySelectorAll("#sidebar-nav .nav-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      // Cargar el contenido de la vista
      await item.loader(item.title);
      // Actualizar la URL (sin recargar)
      window.history.pushState(null, '', `dashboard.html?view=${encodeURIComponent(item.title)}`);
    };

    li.appendChild(link);
    navContainer.appendChild(li);
  });

  // 3. Cargar la Vista Correcta (segun URL)
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view');

  let viewToLoad = menuItems[0]; // Vista por defecto (la primera del rol)

  if (view) {
    const foundView = menuItems.find(item => item.title === view);
    if (foundView) viewToLoad = foundView;
  }

  console.log("🔄 Cargando vista:", viewToLoad.title);
  viewToLoad.loader(viewToLoad.title); // Carga el contenido

  // Resalta el link activo en la barra lateral
  const activeLink = document.querySelector(`#sidebar-nav a[href="?view=${encodeURIComponent(viewToLoad.title)}"]`);
  if (activeLink) activeLink.classList.add("active");

  // 4. LOGICA DE TOGGLE (MOVIDA DESDE dashboard.html)
  // Esto garantiza que los botones se encuentren DESPUES de crear los links
  setupMobileSidebarToggle();
}

function setupMobileSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const openBtn = document.getElementById('openSidebarBtn');
  const closeBtn = document.getElementById('closeSidebarBtn');
  const mainContent = document.getElementById('main-content');
  const sidebarLinks = document.querySelectorAll('#sidebar-nav a');

  // Abrir sidebar
  if (openBtn) {
    openBtn.addEventListener('click', () => sidebar.classList.add('show'));
  }

  // Cerrar sidebar
  if (closeBtn) {
    closeBtn.addEventListener('click', () => sidebar.classList.remove('show'));
  }

  // Cerrar sidebar al hacer click en un enlace del menu (en moviles)
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
      }
    });
  });

  // Cerrar sidebar si se hace click fuera de el (en moviles)
  if (mainContent) {
    mainContent.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
      }
    });
  }
  console.log("✅ Toggle de sidebar movil configurado");
}


// =========================
// FUNCIONES DE CARGA DE CONTENIDO
// =========================

async function loadActivitiesDashboard(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");

  contentTitle.textContent = title;
  // Esqueleto de la tabla
  contentArea.innerHTML = `
    <div class="card-body p-4">
      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle text-center">
          <thead class="table-primary">
            <tr>
              <th>ID</th>
              <th>Titulo</th>
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

  // Llama a la funcion que busca y renderiza los datos
  await fetchActivities(document.getElementById("activityTableBody"));
}

function loadComingSoon(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");

  contentTitle.textContent = title;
  contentArea.innerHTML = `
    <div class="card-body p-4 text-center">
      <h3 class="text-muted">Proximamente...</h3>
      <p>Esta seccion (${title}) esta en construccion.</p>
    </div>
  `;
}

// =========================
// NUEVAS FUNCIONES DE CARGA (Términos, FAQs, Contacto)
// =========================

function loadFaqPage(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");

  contentTitle.textContent = title;
  contentArea.innerHTML = `
    <div class="card-body p-4">
      <div class="accordion" id="faqAccordion">

        <div class="accordion-item">
          <h2 class="accordion-header" id="headingOne">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
              ¿Cómo creo mi usuario y clave?
            </button>
          </h2>
          <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Puedes crear tu cuenta desde la página de <a href="register.html">Registro</a>. Simplemente completa tu nombre, apellido, correo electrónico y una contraseña segura (que cumpla con los requisitos indicados). Al finalizar, deberás aceptar los Términos y Condiciones.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header" id="headingTwo">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
              ¿Qué es un "Prestador" y cómo me convierto en uno?
            </button>
          </h2>
          <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              [cite_start]Un <strong>Prestador</strong> es un rol especial dentro de HugNet (añadido en el Sprint 3) que te permite publicar bienes (ej: "Apuntes") o servicios (ej: "Clases de Inglés") para intercambiar con otros miembros de la comunidad[cite: 36].<br><br>
              Actualmente, la asignación del rol <strong>PRESTADOR</strong> es manejada por un <strong>ADMINISTRADOR</strong> (vía endpoint <code>PATCH /api/users/{id}/role</code>) para mantener la seguridad.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header" id="headingThree">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
              ¿Cómo funciona el Intercambio (Trueque)?
            </button>
          </h2>
          <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Una vez que tienes el rol <strong>PRESTADOR</strong>, puedes publicar tus ítems (HU-08). Otros usuarios podrán ver tu publicación y "Solicitar" el intercambio (HU-09). Cuando lo solicitan, el ítem pasa a estado <strong>RESERVADO</strong>. La entrega se confirma mediante un QR (HU-11).
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header" id="headingFour">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
              ¿Cómo funcionan las Donaciones Monetarias (Sprint 4)?
            </button>
          </h2>
          <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Las donaciones monetarias (HU-14) se gestionarán a través de una pasarela de pago segura (MercadoPago en modo Sandbox). Cuando realices una donación, se creará un link de pago. Utilizaremos Webhooks para confirmar automáticamente que el pago fue <strong>APROBADA</strong> (HU-15).
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
  // Inicializar el componente Accordion de Bootstrap
  new bootstrap.Collapse(document.getElementById('collapseOne'));
}

function loadAboutPage(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");

  contentTitle.textContent = title;
  contentArea.innerHTML = `
    <div class="card-body p-4">
      <h3 class="text-primary">Acerca de HugNet</h3>
      [cite_start]<p class="lead">HugNet es una plataforma digital destinada a la gestión y coordinación de actividades solidarias, enfocada en instituciones educativas y organizaciones sociales[cite: 19].</p>
      [cite_start]<p>Nuestro objetivo es conectar a voluntarios, coordinadores, sponsors y gestores de donaciones dentro de un mismo ecosistema colaborativo[cite: 19]. [cite_start]Utilizamos una arquitectura de microservicios moderna (Spring Boot, Spring Cloud) para asegurar que la plataforma sea modular, escalable y segura[cite: 8].</p>

      <h4 class="mt-4">Nuestra Misión</h4>
      <p>Promover la participación activa de la comunidad (US01-US07), facilitar la gestión de donaciones (US12-US15) e intercambios (US08-US11), y proveer herramientas transparentes para la administración de recursos y reportes (US18, US23).</p>
    </div>
  `;
}

function loadContactPage(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");

  contentTitle.textContent = title;
  [cite_start]// Modelo basado en la sugerencia del PDF [cite: 73, 77]
  contentArea.innerHTML = `
    <div class="card-body p-4">
      <h3 class="text-primary">Contáctenos</h3>
      [cite_start]<p>¿Tienes alguna duda, sugerencia o reclamo? [cite: 77] Estamos aquí para ayudarte.</p>

      <div class="row">
        <div class="col-md-8">
          <form id="contact-form">
            <div class="mb-3">
              <label for="contact-name" class="form-label">Tu Nombre</label>
              <input type="text" class="form-control" id="contact-name" required>
            </div>
            <div class="mb-3">
              <label for="contact-email" class="form-label">Tu Correo Electrónico</label>
              <input type="email" class="form-control" id="contact-email" required>
            </div>
            <div class="mb-3">
              <label for="contact-subject" class="form-label">Asunto</label>
              <input type="text" class="form-control" id="contact-subject" required>
            </div>
            <div class="mb-3">
              <label for="contact-message" class="form-label">Mensaje</label>
              <textarea class="form-control" id="contact-message" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Enviar Mensaje</button>
            <p id="contact-form-message" class="mt-3"></p>
          </form>
        </div>
        <div class="col-md-4">
          <h5>Información Directa</h5>
          <p>
            <i class="bi bi-envelope-fill me-2"></i>
            <strong>Email de Soporte:</strong><br>
            [cite_start]<a href="mailto:soporte@hugnet.com">soporte@hugnet.com</a> [cite: 77]
          </p>
          <p>
            <i class="bi bi-info-circle-fill me-2"></i>
            <strong>Sugerencias y Reclamos:</strong><br>
            [cite_start]<a href="mailto:sugerencias@hugnet.com">sugerencias@hugnet.com</a> [cite: 77]
          </p>
          <hr>
          <p>Para dudas rápidas, consulta nuestras <a href="dashboard.html?view=Preguntas%20Frecuentes">Preguntas Frecuentes</a>.</p>
        </div>
      </div>
    </div>
  `;

  // Añadimos un listener al formulario de contacto (simulado)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const messageEl = document.getElementById('contact-form-message');
      messageEl.textContent = '¡Gracias por tu mensaje! (Funcionalidad de envío no implementada en este demo).';
      messageEl.className = 'text-success';
      contactForm.reset();
    });
  }
}

// ===================================
// --- NUEVAS FUNCIONES (SPRINT 3) ---
// ===================================

/**
 * Carga la pagina de Intercambios (HU-08, HU-09)
 */
async function loadExchangePage(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");
  const userRol = localStorage.getItem("userRol");

  contentTitle.textContent = title;

  // 1. Inyectamos el HTML de la pagina de Intercambios
  contentArea.innerHTML = `
    <div class="card-body p-4">
      
      <!-- SECCION 1: FORMULARIO PARA PUBLICAR (HU-08) -->
      <!-- Oculto por defecto, solo visible para PRESTADOR -->
      <div id="form-publicar-container" class="card mb-4 d-none">
        <div class="card-header bg-primary text-white">
          Publicar un Nuevo Item para Intercambio
        </div>
        <div class="card-body">
          <form id="form-publicar-exchange">
            <div class="mb-3">
              <label for="item-titulo" class="form-label">Titulo</label>
              <input type="text" class="form-control" id="item-titulo" placeholder="Ej: Apuntes de Psicoanalisis" required>
            </div>
            
            <div class="mb-3">
              <label for="item-tipo" class="form-label">Tipo de Item</label>
              <select class="form-select" id="item-tipo" required>
                <option value="" selected disabled>Selecciona una opcion...</option>
                <option value="BIEN">Bien Fisico (Ej: Libros, Apuntes)</option>
                <option value="SERVICIO">Servicio (Ej: Clases, Tutorias)</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="item-deseado" class="form-label">Que buscas a cambio?</label>
              <input type="text" class="form-control" id="item-deseado" placeholder="Ej: Apuntes de Matematica" required>
            </div>
            
            <div class="mb-3">
              <label for="item-descripcion" class="form-label">Descripcion (Opcional)</label>
              <textarea class="form-control" id="item-descripcion" rows="3"></textarea>
            </div>

            <button type="submit" class="btn btn-primary">Publicar Item</button>
          </form>
        </div>
      </div>

      <!-- SECCION 2: LISTA DE ITEMS DISPONIBLES (HU-09) -->
      <h2 class="h4">Items Disponibles</h2>
      <div id="lista-intercambios-container" class="row g-3">
        <p id="loading-placeholder">Cargando items disponibles...</p>
      </div>

    </div>
  `;

  // 2. Logica de visibilidad para el formulario
  if (userRol === 'PRESTADOR') {
    document.getElementById('form-publicar-container').classList.remove('d-none');

    // 3. Adjuntar listener al formulario (solo si es prestador)
    document.getElementById('form-publicar-exchange').addEventListener('submit', async (e) => {
      e.preventDefault();
      const headers = getAuthHeaders();
      if (!headers) return;

      const body = {
        titulo: document.getElementById('item-titulo').value,
        itemType: document.getElementById('item-tipo').value,
        itemDeseado: document.getElementById('item-deseado').value,
        descripcion: document.getElementById('item-descripcion').value
      };

      try {
        const response = await fetch(`${API_URL}/exchanges/created`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body)
        });

        if (response.ok) {
          Swal.fire('Publicado!', 'Tu item ya esta visible para intercambio.', 'success');
          document.getElementById('form-publicar-exchange').reset(); // Limpiar formulario
          fetchExchanges(); // Recargar la lista
        } else {
          const error = await response.json();
          Swal.fire('Error', `No se pudo publicar: ${error.message}`, 'error');
        }
      } catch (error) {
        console.error("Error al publicar item:", error);
        Swal.fire('Error', 'Error de conexion con el servidor.', 'error');
      }
    });
  }

  // 4. Cargar la lista de items
  fetchExchanges();
}

/**
 * Busca los items de intercambio (HU-09 y HU-10)
 */
async function fetchExchanges() {
  const container = document.getElementById("lista-intercambios-container");
  if (!container) return;
  container.innerHTML = `<p id="loading-placeholder">Cargando items...</p>`;

  const headers = getAuthHeaders();
  if (!headers) return;

  const userRol = localStorage.getItem("userRol");

  // HU-10: Coordinador/Admin ven todo.
  // HU-09: Usuarios ven solo lo DISPONIBLE.
  let url = `${API_URL}/exchanges`;
  if (userRol === 'USUARIO' || userRol === 'PRESTADOR') {
    url += '?estado=DISPONIBLE';
  }

  try {
    const response = await fetch(url, { method: "GET", headers: headers });
    if (!response.ok) throw new Error("Error al cargar intercambios");

    const exchanges = await response.json();
    renderExchanges(exchanges);
  } catch (error) {
    console.error("Error al cargar intercambios:", error);
    container.innerHTML = `<p class="text-danger">Error al cargar los items.</p>`;
  }
}

/**
 * Renderiza las cards de Intercambio (HU-09 y HU-10)
 */
function renderExchanges(exchanges) {
  const container = document.getElementById("lista-intercambios-container");
  if (!container) return;

  if (!exchanges || exchanges.length === 0) {
    container.innerHTML = `<p class="text-muted">No hay items de intercambio disponibles.</p>`;
    return;
  }

  container.innerHTML = ""; // Limpiar el "cargando..."
  const userId = parseInt(localStorage.getItem("userId"), 10);

  exchanges.forEach(item => {
    const isOwner = item.prestadorId === userId;

    // El boton de solicitar solo aparece si no eres el dueno
    const buttonHtml = isOwner
      ? `<button class="btn btn-sm btn-outline-secondary" disabled>Es tu publicacion</button>`
      : `<button class="btn btn-sm btn-outline-primary" 
                 onclick="solicitarExchange(${item.id})" 
                 ${item.estado !== 'DISPONIBLE' ? 'disabled' : ''}>
           ${item.estado === 'DISPONIBLE' ? 'Solicitar' : item.estado}
         </button>`;

    const badgeColor = item.itemType === 'BIEN' ? 'bg-success' : 'bg-info';
    const estadoColor = item.estado === 'DISPONIBLE' ? 'text-success' : 'text-warning';

    const cardHtml = `
      <div class="col-md-6 col-lg-4">
        <div class="card item-card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.titulo}</h5>
            <h6 class="card-subtitle mb-2 text-muted">Busca: ${item.itemDeseado}</h6>
            <p class="card-text small">${item.descripcion || ''}</p>
            <div class="mt-auto">
              <span class="badge ${badgeColor} me-2">${item.itemType}</span>
              <span class="fw-bold ${estadoColor}">${item.estado}</span>
              <div class="mt-3">
                ${buttonHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += cardHtml;
  });
}

/**
 * Logica para el boton "Solicitar" (HU-09)
 */
window.solicitarExchange = async function (id) {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    const response = await fetch(`${API_URL}/exchanges/${id}/solicitar`, {
      method: "PATCH",
      headers: headers
    });

    if (response.ok) {
      Swal.fire('Solicitado!', 'El item ha sido reservado para ti. El prestador sera notificado.', 'success');
      fetchExchanges(); // Recargar la lista
    } else {
      const error = await response.json();
      Swal.fire('Error', `No se pudo solicitar: ${error.message}`, 'error');
    }
  } catch (error) {
    console.error("Error al solicitar item:", error);
    Swal.fire('Error', 'Error de conexion con el servidor.', 'error');
  }
}

/**
 * Carga las donaciones (HU-13)
 */
async function fetchDonations(title) {
  const contentTitle = document.getElementById("content-title");
  const contentArea = document.getElementById("content-area");
  contentTitle.textContent = title;
  contentArea.innerHTML = `<div class="card-body p-4 text-muted">Cargando datos de donaciones...</div>`;

  const headers = getAuthHeaders();
  if (!headers) return;

  const userRol = localStorage.getItem("userRol");

  // HU-13: El Gestor ve las pendientes. El resto ve... (por definir, por ahora vemos todo)
  let url = `${API_URL}/donations/pending`;
  if (userRol !== 'GESTOR_DONACIONES') {
    // Por ahora, si no es gestor, no puede ver
    contentArea.innerHTML = `<div class="card-body p-4"><div class="alert alert-warning">No tienes permisos para gestionar donaciones.</div></div>`;
    return;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error del servidor");
    }

    const donations = await response.json();
    renderDonations(donations);

  } catch (error) {
    console.error("Error al cargar donaciones:", error);
    contentArea.innerHTML = `<div class="card-body p-4"><div class="alert alert-danger">Error de conexion: ${error.message}</div></div>`;
  }
}

/**
 * Renderiza las cards de Donaciones (HU-13)
 */
function renderDonations(donations) {
  const contentArea = document.getElementById("content-area");

  if (!donations || donations.length === 0) {
    contentArea.innerHTML = `<div class="card-body p-4"><p class="text-muted">No hay donaciones pendientes de aprobacion.</p></div>`;
    return;
  }

  let cardsHtml = donations.map(don => {
    const badgeColor = don.itemType === 'BIEN' ? 'bg-success' : 'bg-info';
    return `
      <div class="col-md-6 col-lg-4">
        <div class="card donation-card h-100">
          <div class="card-body">
            <h5 class="card-title">${don.descripcionItem}</h5>
            <h6 class="card-subtitle mb-2 text-muted">Cantidad: ${don.cantidad || 1}</h6>
            <p class="card-text">
              <span class="badge ${badgeColor}">${don.itemType}</span>
              <span class="badge bg-warning text-dark">${don.estado}</span>
            </p>
            <p class="card-text small text-muted">Donante ID: ${don.donanteId}</p>
            <div class="mt-3">
              <button class="btn btn-sm btn-success" onclick="approveDonation(${don.id})">Aprobar</button>
              <button class="btn btn-sm btn-danger ms-2" onclick="rejectDonation(${don.id})">Rechazar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  contentArea.innerHTML = `
    <div class="card-body p-4">
      <h2 class="h4">Donaciones Pendientes de Aprobacion</h2>
      <div class="row g-3">
        ${cardsHtml}
      </div>
    </div>
  `;
}

/**
 * Logica para aprobar donacion (HU-13)
 */
window.approveDonation = async function (id) {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    const response = await fetch(`${API_URL}/donations/${id}/approve`, {
      method: "PATCH",
      headers: headers
    });
    if (response.ok) {
      Swal.fire('Aprobada!', 'La donacion ha sido aceptada.', 'success');
      fetchDonations("Ver Donaciones"); // Recargar
    } else {
      const error = await response.json();
      Swal.fire('Error', `No se pudo aprobar: ${error.message}`, 'error');
    }
  } catch (error) {
    console.error("Error al aprobar donacion:", error);
    Swal.fire('Error', 'Error de conexion.', 'error');
  }
}

/**
 * Logica para rechazar donacion (HU-13)
 */
window.rejectDonation = async function (id) {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    const response = await fetch(`${API_URL}/donations/${id}/reject`, {
      method: "PATCH",
      headers: headers
    });
    if (response.ok) {
      Swal.fire('Rechazada', 'La donacion ha sido rechazada.', 'info');
      fetchDonations("Ver Donaciones"); // Recargar
    } else {
      const error = await response.json();
      Swal.fire('Error', `No se pudo rechazar: ${error.message}`, 'error');
    }
  } catch (error) {
    console.error("Error al rechazar donacion:", error);
    Swal.fire('Error', 'Error de conexion.', 'error');
  }
}


// ===================================================
// FUNCIONES ANTIGUAS (Sin cambios)
// ===================================================

async function fetchActivities(tableBody) {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    console.log("🌐 Obteniendo actividades...");
    const response = await fetch(`${API_URL}/activities`, {
      method: "GET",
      headers: headers
    });

    console.log("📊 Respuesta de actividades, status:", response.status);

    if (response.status === 401 || response.status === 403) {
      console.warn("🔒 No autorizado, ejecutando logout");
      handleLogout();
      return;
    }
    if (!response.ok) throw new Error("Error al obtener actividades");

    const activities = await response.json();

    if (!Array.isArray(activities)) {
      console.error("❌ La respuesta no es un array:", activities);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-danger p-4">Formato de respuesta invalido del servidor.</td></tr>`;
      return;
    }

    console.log(`✅ ${activities.length} actividades obtenidas`);
    renderActivities(activities, tableBody);
  } catch (error) {
    console.error("❌ Error al cargar actividades:", error);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-danger p-4">Error al conectar con el servidor de actividades.</td></tr>`;
  }
}

function renderActivities(activities, tableBody) {
  const userRol = localStorage.getItem("userRol");

  let filteredActivities = activities;

  // Estas reglas de filtrado son de la logica anterior,
  // se pueden refinar.
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

// ===================================================
// FUNCIONES GLOBALES (llamadas por onclick)
// ===================================================

window.joinActivity = async function (activityId) {
  const headers = getAuthHeaders();
  const userId = localStorage.getItem("userId");

  if (!headers || !userId) {
    Swal.fire('Error', 'Debe iniciar sesion para participar.', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/activities/${activityId}/join/${userId}`, {
      method: "POST",
      headers: headers
    });

    if (response.ok) {
      Swal.fire('¡Exito!', 'Te has unido a la actividad.', 'success');
      loadActivitiesDashboard("Mis Actividades");
    } else {
      const error = await response.json();
      Swal.fire('Error', `No se pudo unir: ${error.message}`, 'error');
    }
  } catch (error) {
    console.error("Error al unirse a actividad:", error);
    Swal.fire('Error', 'Error de conexion con el servidor.', 'error');
  }
}

window.validateActivity = async function (activityId, newStatus) {
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
      Swal.fire(`¡Exito!`, `La actividad ha sido marcada como ${newStatusText}.`, 'success');
      loadActivitiesDashboard("Gestion de Actividades");
    } else {
      const error = await response.json();
      Swal.fire('Error', `Error al ${actionText}: ${error.message}`, 'error');
    }
  } catch (error) {
    console.error("Error al validar:", error);
    Swal.fire('Error', 'Error de conexion con el servidor.', 'error');
  }
}

window.viewParticipants = async function (activityId) {
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
        Swal.fire('Info', 'Aun no hay participantes inscritos en esta actividad.', 'info');
      } else {
        // En el futuro, llamariamos a /api/users/batch para obtener nombres
        Swal.fire('Participantes (IDs)', `Proximamente veras los nombres.\nIDs: ${participantIds.join(', ')}`, 'info');
      }

    } else {
      const error = await response.json();
      Swal.fire('Error', `Error al ver participantes: ${error.message}`, 'error');
    }
  } catch (error) {
    console.error("Error al ver participantes:", error);
    Swal.fire('Error', 'Error de conexion con el servidor.', 'error');
  }
}
