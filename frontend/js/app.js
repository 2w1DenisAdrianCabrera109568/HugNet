document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "index.html" || currentPage === "") {
    initLoginPage();
  } else if (currentPage === "dashboard.html") {
    initDashboardPage();
  }
});

// =========================
// LOGIN PAGE
// =========================
function initLoginPage() {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

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
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "dashboard.html";
      } else {
        message.textContent = "Usuario no encontrado o credenciales incorrectas.";
      }
    } catch (error) {
      console.error("Error:", error);
      message.textContent = "Error de conexión con el servidor.";
    }
  });
}

// =========================
// DASHBOARD PAGE
// =========================
function initDashboardPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  const tableBody = document.getElementById("activityTableBody");

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Mostrar nombre en navbar
  userNameEl.textContent = user.name ? user.name : "Usuario";

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });

  // Cargar actividades
  fetchActivities(tableBody);
}

// =========================
// FUNCIONES AUXILIARES
// =========================
async function fetchActivities(tableBody) {
  try {
    const response = await fetch("http://localhost:8082/activities");
    if (!response.ok) throw new Error("Error al obtener actividades");

    const activities = await response.json();
    renderActivities(activities, tableBody);
  } catch (error) {
    console.error("Error al cargar actividades:", error);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-danger">Error al conectar con el servidor de actividades</td></tr>`;
  }
}

function renderActivities(activities, tableBody) {
  if (activities.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-muted">No hay actividades registradas.</td></tr>`;
    return;
  }

  tableBody.innerHTML = "";

  activities.forEach(activity => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${activity.id}</td>
      <td>${activity.title}</td>
      <td>${activity.type}</td>
      <td>${activity.date || "-"}</td>
      <td>${activity.location || "-"}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="joinActivity(${activity.id})">
          Participar
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

async function joinActivity(activityId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Debe iniciar sesión para participar en una actividad.");
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(`http://localhost:8082/activities/${activityId}/join/${user.id}`, {
      method: "POST"
    });

    if (response.ok) {
      alert("Te has unido a la actividad con éxito 🎉");
    } else {
      alert("No se pudo unir a la actividad.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión con el servidor.");
  }
}
