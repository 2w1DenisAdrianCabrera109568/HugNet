
# HugNet — Documento Maestro

## 1. Descripción y Objetivo
HugNet es una plataforma digital destinada a la gestión y coordinación de actividades solidarias 
en instituciones educativas y organizaciones sociales. Su objetivo es conectar a voluntarios, coordinadores, sponsors y gestores 
de donaciones dentro de un mismo ecosistema colaborativo. El propósito funcional es brindar una solución modular y escalable 
basada en microservicios, permitiendo administrar usuarios, actividades, donaciones y reportes de forma eficiente y segura.

---
## 2. Alcance y Funcionalidades
El proyecto abarca el desarrollo de una plataforma web funcional que contemple las siguientes gestiones:
- Gestión de usuarios y roles.
- Gestión de actividades solidarias.
- Gestión de donaciones en especie y monetarias.
- Gestión de sponsors y sus aportes.
- Generación de reportes administrativos y operativos.
- Envío de correos electrónicos y notificaciones (futuro).

---
## 3. Roles del Sistema
- **Usuario:** Se registra, inicia sesión, participa en actividades y realiza donaciones.
- **Coordinador:** Crea y gestiona actividades, asigna sponsors y genera reportes.
- **Gestor de Donaciones:** Supervisa el stock y valida donaciones materiales o monetarias.
- **Sponsor:** Apoya las actividades mediante aportes o recursos.
- **Administrador:** Supervisa usuarios, roles, actividades y reportes globales.

---
## 4. Arquitectura General
El sistema está basado en una arquitectura de **microservicios con Spring Boot**, utilizando un API Gateway para la comunicación. Cada servicio es autónomo y posee su propia base de datos relacional (PostgreSQL en producción, H2 para desarrollo).

### 4.1. Seguridad
La seguridad se maneja mediante **JSON Web Tokens (JWT)**.
1.  **Generación:** El `user-service` actúa como centro de identidad. Valida las credenciales del usuario y, si son correctas, genera un token JWT firmado (con una clave secreta Base64) que incluye `userId`, `email` y `rol` como *claims*.
2.  **Validación:** Cada microservicio protegido (`activity-service`, `sponsor-service`, etc.) contiene un `JwtAuthenticationFilter` que intercepta cada petición. Este filtro valida la firma del token usando la misma clave secreta.
3.  **Autorización:** El filtro extrae los *claims* (especialmente el `rol`) y los usa para construir el contexto de seguridad de Spring. Esto permite usar anotaciones `@PreAuthorize("hasRole('ADMINISTRADOR')")` en los endpoints para un control de acceso granular.
4.  **Propagación:** Cuando un microservicio necesita llamar a otro (ej: `report-service` a `activity-service`), el token JWT original se propaga en la cabecera `Authorization` de la nueva llamada.

### 4.2. CORS (Cross-Origin Resource Sharing)
Para permitir que el frontend (`http://127.0.0.1:5500`) se comunique con los backends (ej: `http://localhost:8081`), la seguridad se ha centralizado. En lugar de usar `@CrossOrigin` en cada controlador, se ha definido un `Bean` global (`corsConfigurationSource`) en el `SecurityConfig` de cada microservicio. Esto maneja correctamente las peticiones *Preflight* (`OPTIONS`) y permite las cabeceras personalizadas como `Authorization`.

### 4.3. Comunicación Inter-Servicios
- **Asincrónica (Moderna):** Se utiliza `WebClient` (de Spring WebFlux) para la comunicación no bloqueante. Implementado en `report-service` para llamar a `activity-service`.
- **Sincrónica (Legado):** Se planea implementar `RestTemplate` para demostrar el conocimiento de ambos métodos. *(Pendiente)*

---
## 5. Microservicios
- **user-service:** Autenticación (login), registro y gestión de usuarios/roles. Es el único servicio que genera los tokens JWT.
- **activity-service:** Administración de actividades (CRUD), inscripciones, validación de estado por Admins y consulta de participantes.
- **donation-service:** Administración de donaciones. Expone un endpoint para ver el stock.
- **sponsor-service:** Administración de sponsors (CRUD).
- **report-service:** Generación de reportes. Llama a otros servicios (`WebClient`) para recolectar datos, como la asistencia.
- **gateway:** Enrutamiento de peticiones y punto de entrada único al sistema.

---
## 6. Estructura de Paquetes (Estándar por Microservicio)
Cada microservicio sigue la siguiente estructura de paquetes:
- `com.hugnet.servicename`
    - `config`: Clases de configuración (`SecurityConfig`, `JwtService`, `WebClientConfig`).
    - `controller`: Controladores REST.
    - `dto`: Objetos de Transferencia de Datos (DTOs).
        - `common`: DTOs comunes como `ErrorHandle`.
        - `mapper`: Clases `Mapper`.
    - `entity`: Entidades JPA y `Enums`.
    - `exception`: Excepciones personalizadas y `GlobalExceptionHandler`.
    - `repository`: Interfaces de Spring Data JPA.
    - `service`: Lógica de negocio.
        - `impl`: Implementaciones de las interfaces de servicio.
	
---
## 7. Estructura de la Base de Datos
Cada microservicio mantiene su propia base de datos (actualmente H2 en memoria con `schema.sql` y `data.sql`).
- **Users:** Contiene los datos de los usuarios y su rol (`Enum: USUARIO, COORDINADOR, ADMINISTRADOR`).
- **Activities:** Posee un estado (`Enum: PENDIENTE, APROBADA, RECHAZADA`).
- **Sponsors:** Posee un tipo (`Enum: EMPRESA, PARTICULAR, COMERCIO, ORGANIZACION`).
- **Donations:** Posee un tipo (`Enum: MONETARIA, ESPECIE`).
- **Tablas Intermedias:** `activity_participants` (en `activity-service`) y `activity_sponsors` (en `sponsor-service`).

---
## 8. Tecnologías
- **Backend:** Java 17, Spring Boot, Spring Data JPA, Spring Security, Spring Cloud.
- **Dependencias Clave:** `spring-boot-starter-webflux` (para WebClient), `jjwt` (para JWT), `spring-boot-starter-mail`.
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.
- **Bases de Datos:** PostgreSQL (Producción) / H2 (Desarrollo).
- **Infraestructura:** Docker, Docker Compose.
- **Documentación:** Swagger / OpenAPI.

---
## 9. Frontend (HTML, CSS, JS)
Se ha implementado una interfaz de usuario de una sola página (SPA) simulada con archivos HTML separados y un archivo `app.js` centralizado.

### 9.1. Estructura de Archivos (Frontend)
- `index.html`: Página de Login.
- `register.html`: Página de Registro de nuevo usuario.
- `dashboard.html`: Página principal que muestra la lista de actividades.
- `js/app.js`: Contiene toda la lógica de frontend, enrutamiento simple y llamadas a la API.

### 9.2. Flujo de Funcionamiento
1.  **Inicio:** El usuario aterriza en `index.html`.
2.  **Login:** El formulario de login (`initLoginPage`) llama al endpoint `/api/users/login`.
3.  **Token:** Si el login es exitoso, la respuesta (que incluye el `token`, `rol`, `email` y `userId`) se guarda en `localStorage`.
4.  **Redirección:** El usuario es enviado a `dashboard.html`.
5.  **Carga del Dashboard:** Al cargar `dashboard.html`, `initDashboardPage` se ejecuta:
    - Verifica si hay un token en `localStorage`. Si no, lo patea de vuelta a `index.html`.
    - Llama a `fetchActivities` para buscar la lista de actividades.
6.  **Peticiones Seguras:** Todas las llamadas a la API (excepto login/register) usan la función `getAuthHeaders()`, que toma el token del `localStorage` y lo añade a la cabecera `Authorization: Bearer <token>`.

### 9.3. Lógica de Roles en la UI
La función `renderActivities` en `app.js` lee el `userRol` guardado en `localStorage` y renderiza los botones de acción dinámicamente:
- **`ADMINISTRADOR`:** Ve "Aprobar" (si está PENDIENTE) y "Ver Lista". No ve "Participar".
- **`COORDINADOR`:** Ve "Participar" y "Ver Lista".
- **`USUARIO`:** Ve únicamente "Participar".

---
## 10. Historias de Usuario (por Sprint)

✅Sprint 1 (25/09 → 08/10) – Usuarios + Actividades 
ID Historia de Usuario 
SP US01 Como usuario quiero registrarme en la plataforma para poder participar en actividades. 
US02 Como usuario quiero iniciar sesión para acceder a mis actividades. 
US03 Como administrador quiero asignar roles a los usuarios para gestionar permisos. 
US04 Como coordinador quiero crear actividades solidarias para fomentar la participación. 
US05 Como usuario quiero inscribirme en actividades para poder colaborar. 3 US06 Como coordinador quiero ver qué usuarios se inscribieron en una actividad. 
US07 Como usuario quiero consultar en qué actividades estoy inscripto. 
Total Sprint 1 = 24 SP 

✅ Sprint 2 (09/10 → 22/10) – Administración básica + Sponsors iniciales + Reportes simples 
ID Historia de Usuario 
SP US16 Como administrador quiero gestionar los roles de los usuarios.
US17 Como administrador quiero validar las actividades creadas.
US24 Como sistema quiero enviar un correo de confirmación al usuario. 
US27 Como coordinador quiero registrar sponsors en la plataforma.
US19 Como coordinador quiero obtener un reporte de asistencia por evento.
US21 Como gestor de donaciones quiero ver el stock actualizado de bienes e intercambios. 
Total Sprint 2 = 22 SP 

✅ Sprint 3 (23/10 → 05/11) – Intercambio + Donaciones en especie 
ID Historia de Usuario 
SP US08 Como prestador quiero publicar un bien o servicio para intercambio o donación.
US09 Como usuario quiero solicitar un bien publicado.
US10 Como coordinador quiero controlar el stock de objetos en intercambio.
US11 Como usuario quiero confirmar la entrega de un bien mediante QR.
US12 Como usuario quiero realizar una donación en especie.
US13 Como gestor de donaciones quiero registrar y actualizar el stock de donaciones.
Total Sprint 3 = 29 SP 

✅ Sprint 4 (06/11 → 19/11) – Donaciones monetarias + Sponsors avanzados
ID Historia de Usuario SP 
US14 Como usuario quiero realizar una donación en efectivo mediante pasarela de pago.
US15 Como gestor de donaciones quiero validar las donaciones monetarias.
US28 Como coordinador quiero asignar sponsors a un evento para darles visibilidad.
US20 Como administrador quiero ver un reporte de participación por tipo de evento.
Total Sprint 4 = 23 SP 

✅ Sprint 5 (20/11 → 03/12) – Reportes finales + PWA + Sponsors avanzados 
ID Historia de Usuario SP 
US18 Como administrador quiero ver un reporte del balance de cada evento.
US22 Como administrador quiero exportar los reportes en PDF.
US23 Como administrador quiero ver un ranking de usuarios más activos.
US25 Como usuario quiero escanear un QR para acceder rápido a la información de evento.
US26 Como usuario quiero instalar la plataforma como PWA en mi dispositivo.
US29 Como coordinador quiero generar un reporte del aporte de sponsors.
US30 Como coordinador quiero enviar el reporte del evento al sponsor para brindar transparencia.

**Sprint 1 (25/09 → 08/10)** – Usuarios + Actividades  
US01–US07 (24 SP)

**Sprint 2 (09/10 → 22/10)** – Administración básica + Sponsors iniciales + Reportes simples  
US16, US17, US19, US21, US24, US27 (22 SP)

**Sprint 3 (23/10 → 05/11)** – Intercambio + Donaciones en especie  
US08–US13 (29 SP)

**Sprint 4 (06/11 → 19/11)** – Donaciones monetarias + Sponsors avanzados  
US14, US15, US20, US28 (23 SP)

**Sprint 5 (20/11 → 03/12)** – Reportes finales + PWA + Sponsors avanzados  
US18, US22, US23, US25, US26, US29, US30 (36 SP)

---
## 11. Estado de Avance (✔ ⚠ ⬜)
✔ Sprint 1: Completado.
✔ Sprint 2: **Completado (funcionalidad backend y frontend demo).**
⬜ Sprint 3: Planificado.
⬜ Sprint 4: Planificado.
⬜ Sprint 5: Planificado.

---
## 12. Próximos pasos (Pendientes)
Lista de tareas técnicas y funcionales pendientes para los próximos sprints:

### 12.1. Seguridad Crítica
- **`PasswordEncoder`:** Implementar `BCryptPasswordEncoder` en el `user-service`. Actualmente las contraseñas se guardan en texto plano, lo cual es un riesgo de seguridad crítico.

### 12.2. Mejoras de Funcionalidad
- **US24 (Email):** Implementar el envío de correos, investigando la alternativa a las "Contraseñas de aplicaciones" de Google (ej: SendGrid).
- **Mejora "Ver Lista":** Implementar la comunicación `activity-service` -> `user-service` para que el botón "Ver Lista" devuelva nombres de participantes en lugar de IDs.
- **Implementar `RestTemplate`:** Añadir un nuevo endpoint de reporte que use `RestTemplate` para la comunicación sincrónica, como se planeó.

### 12.3. Infraestructura
- **PostgreSQL:** Solucionar el problema de conexión con la base de datos PostgreSQL.
- **Dockerización:** Una vez que Postgres funcione, crear los `Dockerfile` para cada servicio y el `docker-compose.yml` para orquestar todo el entorno (todos los backends + la base de datos).

### 12.4. Sprints Futuros
- Iniciar el desarrollo del **Sprint 3** (Intercambio y Donaciones en especie).

