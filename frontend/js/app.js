/**
 * Punto de entrada principal.
 * Se ejecuta cuando el HTML está completamente cargado.
 */
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "index.html" || currentPage === "") {
    initLoginPage();
  } else if (currentPage === "dashboard.html") {
    initDashboardPage();
  } else if (currentPage === "register.html") { 
    initRegisterPage();
  }
});

/**
 * Prepara las cabeceras de autorización con el token JWT.
 * Si no hay token, redirige al login.
 * @returns {HeadersInit | null} Objeto de cabeceras o null.
 */
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return null;
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

// =========================
// PAGINA DE LOGIN
// =========================
function initLoginPage() {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      message.textContent = "Por favor complete todos los campos.";
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
      });

      if (response.ok) {
        const loginData = await response.json();
        
        // Guardamos los datos en Local Storage
        localStorage.setItem("token", loginData.token);
        localStorage.setItem("userEmail", loginData.email);
        localStorage.setItem("userRol", loginData.rol);
        localStorage.setItem("userId", loginData.userId); 

        window.location.href = "dashboard.html";
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
// =========================
// PAGINA DE REGISTRO (¡NUEVA!)
// =========================
function initRegisterPage() {
  const form = document.getElementById("registerForm");
  const message = document.getElementById("registerMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";

    // Obtenemos todos los valores
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nombre || !apellido || !email || !password) {
      message.className = "mt-3 text-center small text-danger";
      message.textContent = "Por favor complete todos los campos.";
      return;
    }

    try {
      // Llamamos al endpoint de registro (es público, no necesita token)
      const response = await fetch("http://localhost:8081/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre,
          apellido: apellido,
          email: email,
          password: password,
          rol: "USUARIO" // Asumimos que todos los registros nuevos son USUARIO
        })
      });

      if (response.ok) {
        message.className = "mt-3 text-center small text-success";
        message.textContent = "¡Registro exitoso! Redirigiendo al login...";
        
        // Esperamos 2 segundos y lo mandamos al login
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);

      } else {
        const errorData = await response.json();
        message.className = "mt-3 text-center small text-danger";
        message.textContent = errorData.message || "Error en el registro.";
      }
    } catch (error) {
      console.error("Error en registro:", error);
      message.className = "mt-3 text-center small text-danger";
      message.textContent = "Error de conexión con el servidor.";
    }
  });
}

// =========================
// PAGINA DEL DASHBOARD
// =========================
function initDashboardPage() {
  // Validar que el token exista al cargar la página
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  // Obtener elementos del DOM
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  const tableBody = document.getElementById("activityTableBody");
  const viewDonationsBtn = document.getElementById("viewDonationsBtn");

  // Configurar UI
  userNameEl.textContent = localStorage.getItem("userEmail") || "Usuario";
  
  logoutBtn.addEventListener("click", () => {
    localStorage.clear(); // Limpia todo
    window.location.href = "index.html";
  });
  
  viewDonationsBtn.addEventListener("click", fetchDonations);

  // Cargar datos
  fetchActivities(tableBody);
}

/**
 * Busca las actividades en el backend y las renderiza.
 */
async function fetchActivities(tableBody) {
  const headers = getAuthHeaders();
  if (!headers) return; // Redirección ya manejada en getAuthHeaders

  try {
    const response = await fetch("http://localhost:8082/api/activities", {
      method: "GET",
      headers: headers
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      window.location.href = "index.html";
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

/**
 * Dibuja la tabla de actividades en el DOM.
 */
function renderActivities(activities, tableBody) {
  const userRol = localStorage.getItem("userRol");

  if (!activities || activities.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-muted p-4">No hay actividades registradas.</td></tr>`;
    return;
  }

  tableBody.innerHTML = "";

  activities.forEach(activity => {
    const tr = document.createElement("tr");
    
    // --- Lógica de Botones (depende del rol) ---
    let buttons = '';
    // 1. Mostrar "Participar" SOLO SI el rol NO es ADMINISTRADOR
    if (userRol !== 'ADMINISTRADOR') {
      buttons += `
        <button class="btn btn-sm btn-outline-primary" 
                onclick="joinActivity(${activity.activityId})">
          Participar
        </button>
      `;
    }
    
    // Si es ADMIN y la actividad está PENDIENTE, muestra el botón de Aprobar
    if (userRol === 'ADMINISTRADOR' && activity.estado === 'PENDIENTE') {
      buttons += `
        <button class="btn btn-sm btn-success ms-2" 
                onclick="validateActivity(${activity.activityId})">
          Aprobar
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

    // --- Lógica de Estado (para los colores) ---
    let estadoBadge = '';
    switch (activity.estado) {
      case 'PENDIENTE':
        estadoBadge = '<span class="badge bg-warning text-dark">PENDIENTE</span>';
        break;
      case 'APROBADA':
        estadoBadge = '<span class="badge bg-success">APROBADA</span>';
        break;
      case 'RECHAZADA':
        estadoBadge = '<span class="badge bg-danger">RECHAZADA</span>';
        break;
      default:
        estadoBadge = `<span class="badge bg-secondary">${activity.estado}</span>`;
    }

    // --- Formato de Fecha ---
    const fecha = activity.fechaInicio 
      ? new Date(activity.fechaInicio).toLocaleDateString() 
      : "-";

    // --- Renderizar Fila ---
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
// FUNCIONES GLOBALES (para ser llamadas por onclick)
// ===================================================

/**
 * Se une a una actividad (US05)
 */
window.joinActivity = async function(activityId) {
  const headers = getAuthHeaders();
  const userId = localStorage.getItem("userId");
  
  if (!headers || !userId) {
    alert("Debe iniciar sesión para participar.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8082/api/activities/${activityId}/join/${userId}`, {
      method: "POST",
      headers: headers
    });

    if (response.ok) {
      alert("Te has unido a la actividad con éxito 🎉");
    } else {
      const error = await response.json();
      alert(`No se pudo unir: ${error.message}`);
    }
  } catch (error) {
    console.error("Error al unirse a actividad:", error);
    alert("Error de conexión con el servidor.");
  }
}

/**
 * Obtiene y muestra la lista de IDs de participantes.
 */
window.viewParticipants = async function(activityId) {
  const headers = getAuthHeaders();
  if (!headers) return; // Ya está protegido

  try {
    const response = await fetch(`http://localhost:8082/api/activities/${activityId}/participants`, {
      method: "GET",
      headers: headers
    });

    if (response.ok) {
      const participantIds = await response.json();
      
      if (participantIds.length === 0) {
        alert("Aún no hay participantes inscritos en esta actividad.");
      } else {
        // Mostramos un alert simple con los IDs
        alert(`IDs de los participantes:\n\n${participantIds.join(', ')}`);
      }

    } else {
      const error = await response.json();
      alert(`Error al ver participantes: ${error.message}`);
    }
  } catch (error) {
    console.error("Error al ver participantes:", error);
    alert("Error de conexión con el servidor.");
  }
}

/**
 * Valida una actividad (US17) - Solo para ADMIN
 */
window.validateActivity = async function(activityId) {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    const response = await fetch(`http://localhost:8082/api/admin/activities/${activityId}/status`, {
      method: "PATCH",
      headers: headers,
      // ¡ASEGÚRATE DE QUE "APROBADA" COINCIDA EXACTO CON TU ENUM DE JAVA!
      body: JSON.stringify({ newStatus: "ABIERTO" }) 
    });

    if (response.ok) {
      alert("¡Actividad APROBADA con éxito!");
      fetchActivities(document.getElementById("activityTableBody"));
    } else {
      // Si el backend tira 500, esto ahora mostrará un error más genérico
      const errorText = await response.text(); // Leemos como texto por si no es un JSON
      console.error("Respuesta del servidor:", errorText);
      alert(`Error al aprobar. El servidor respondió con un error.`);
    }
  } catch (error) {
    console.error("Error al validar:", error);
    alert("Error de conexión con el servidor.");
  }
}

/**
 * Busca las donaciones (US21) - Solo para GESTOR/ADMIN
 */
async function fetchDonations() {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    // Apuntamos al puerto 8085 (donation-service)
    const response = await fetch("http://localhost:8085/api/donations", {
      method: "GET",
      headers: headers
    });

    if (response.ok) {
      const donations = await response.json();
      alert(`Stock de Donaciones (JSON):\n\n${JSON.stringify(donations, null, 2)}`);
    } else {
      const error = await response.json();
      alert(`No se pudo cargar donaciones: ${error.message}\n\n(Asegúrate de ser GESTOR_DONACIONES o ADMINISTRADOR)`);
    }
  } catch (error) {
    console.error("Error al cargar donaciones:", error);
    alert("Error de conexión con el servidor de donaciones.");
  }
}