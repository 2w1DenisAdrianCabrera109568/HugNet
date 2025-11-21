---

---



\# HugNet — Documento Maestro (v2 - Actualizado)



\## 1. Descripción y Objetivo

HugNet es una plataforma digital destinada a la gestión y coordinación de actividades solidarias

\[cite\_start]en instituciones educativas y organizaciones sociales\[cite: 19]. Su objetivo es conectar a voluntarios, coordinadores, sponsors y gestores

de donaciones dentro de un mismo ecosistema colaborativo. El propósito funcional es brindar una solución modular y escalable

basada en microservicios, permitiendo administrar usuarios, actividades, donaciones y reportes de forma eficiente y segura.



---

\## 2. Alcance y Funcionalidades

El proyecto abarca el desarrollo de una plataforma web funcional que contemple las siguientes gestiones:

\- \[cite\_start]Gestión de usuarios y roles\[cite: 32].

\- \[cite\_start]Gestión de actividades solidarias\[cite: 40].

\- \[cite\_start]Gestión de donaciones en especie y monetarias\[cite: 69].

\- \[cite\_start]Gestión de sponsors y sus aportes\[cite: 73].

\- \[cite\_start]Generación de reportes administrativos y operativos\[cite: 52].

\- \[cite\_start]Envío de correos electrónicos y notificaciones (futuro)\[cite: 10].



---

\## 3. Roles del Sistema

\- \[cite\_start]\*\*Usuario:\*\* Se registra, inicia sesión, participa en actividades y realiza donaciones\[cite: 35].

\- \[cite\_start]\*\*Coordinador:\*\* Crea y gestiona actividades, asigna sponsors y genera reportes\[cite: 37].

\- \[cite\_start]\*\*Gestor de Donaciones:\*\* Supervisa el stock y valida donaciones materiales o monetarias\[cite: 39].

\- \[cite\_start]\*\*Sponsor:\*\* Apoya las actividades mediante aportes o recursos\[cite: 73].

\- \[cite\_start]\*\*Administrador:\*\* Supervisa usuarios, roles, actividades y reportes globales\[cite: 38].



> ### 3.1. Aclaración de Roles (Sprint 3)

>

> \[cite\_start]De acuerdo al Kickoff \[cite: 36] y al análisis de las HU del Sprint 3, se identifica un nuevo rol que debe ser añadido al sistema:

>

> - \*\*Prestador:\*\* Es un `Usuario` que ha decidido ofrecer un `SERVICIO` (ej. "Clases de Inglés") o un `BIEN` (ej. "Apuntes") para intercambio.

>

> \*\*Acción Técnica (Inicio Sprint 3):\*\*

> 1.  Navegar al microservicio `user-service`.

> 2.  Modificar el `Enum Rol.java`.

> 3.  Añadir el valor `PRESTADOR` a la lista.



---

\## 4. Arquitectura General

El sistema está basado en una arquitectura de \*\*microservicios con Spring Boot\*\*, utilizando un API Gateway para la comunicación. \[cite\_start]Cada servicio es autónomo y posee su propia base de datos relacional (PostgreSQL en producción, H2 para desarrollo)\[cite: 6, 8].



> ### 4.1. Aclaración: Manejo de Errores (Validación)

>

> Durante la implementación del Sprint 2, se detectó que las validaciones (`@Valid` en Controladores, `@NotEmpty`, `@Email` en DTOs) no devolvían errores 400, sino 200 (éxito) o 500 (error de lógica).

>

> \*\*Solución Implementada:\*\*

> 1.  \*\*Dependencia Faltante:\*\* Se añadió la dependencia `spring-boot-starter-validation` al `pom.xml` del `user-service` (y se debe añadir a cualquier otro servicio que reciba y valide DTOs).

> 2.  \*\*`GlobalExceptionHandler` Unificado:\*\* Se creó una clase `@RestControllerAdvice` (GlobalExceptionHandler) que captura `MethodArgumentNotValidException` y la transforma en un JSON de error 400 estandarizado (usando el DTO `ErrorHandle`).

> 3.  \*\*Lógica de Negocio (`@PrePersist`):\*\* Se detectó un error 500 (`PropertyValueException`) al registrar usuarios, causado por un `rol = null` en la entidad.

>     - \*\*Solución de Seguridad:\*\* Se eliminó el campo `rol` del `CreateUserDTO` (para evitar inyección de roles).

>     - \*\*Solución de Lógica:\*\* Se implementó un método `@PrePersist` en la entidad `User.java` que asigna `Rol.USUARIO` por defecto si el campo `rol` es nulo. Este patrón (la entidad se "cura" a sí misma) debe ser la norma.



\### 4.2. Seguridad

La seguridad se maneja mediante \*\*JSON Web Tokens (JWT)\*\*.

1\.  \*\*Generación:\*\* El `user-service` actúa como centro de identidad. Valida las credenciales del usuario y, si son correctas, genera un token JWT firmado (con una clave secreta Base64) que incluye `userId`, `email` y `rol` como \*claims\*.

2\.  \*\*Validación:\*\* Cada microservicio protegido (`activity-service`, `sponsor-service`, etc.) contiene un `JwtAuthenticationFilter` que intercepta cada petición. Este filtro valida la firma del token usando la misma clave secreta.

3\.  \*\*Autorización:\*\* El filtro extrae los \*claims\* (especialmente el `rol`) y los usa para construir el contexto de seguridad de Spring. Esto permite usar anotaciones `@PreAuthorize("hasRole('ADMINISTRADOR')")` en los endpoints para un control de acceso granular.

4\.  \*\*Propagación:\*\* Cuando un microservicio necesita llamar a otro (ej: `report-service` a `activity-service`), el token JWT original se propaga en la cabecera `Authorization` de la nueva llamada.



> ### 4.2.1. Aclaración: Centralización en Gateway (Implementado)

>

> A diferencia de la descripción original, la lógica de validación de JWT (`JwtAuthenticationFilter`) se ha \*\*centralizado en el microservicio `gateway`\*\*.

>

> - El `gateway` actúa como el único punto de entrada y valida el 100% del tráfico.

> - Si el token es inválido, el `gateway` rechaza la petición (401 Unauthorized) y esta \*nunca\* llega a los microservicios internos.

> - Si el token es válido, el `gateway` añade cabeceras HTTP (`X-User-Id`, `X-User-Rol`) a la petición y la reenvía al servicio correspondiente (ej. `activity-service`).

> - Los servicios internos (como `activity-service`) ya no necesitan `JwtAuthenticationFilter`. Simplemente \*confían\* en que la petición es válida y leen el rol desde la cabecera `X-User-Rol` para la autorización (`@PreAuthorize`).



\### 4.3. CORS (Cross-Origin Resource Sharing)

Para permitir que el frontend (`http://127.0.0.1:5500`) se comunique con los backends (ej: `http://localhost:8081`), la seguridad se ha centralizado. En lugar de usar `@CrossOrigin` en cada controlador, se ha definido un `Bean` global (`corsConfigurationSource`) en el `SecurityConfig` de cada microservicio.



\### 4.4. Comunicación Inter-Servicios

\- \*\*Asincrónica (Moderna):\*\* Se utiliza `WebClient` (de Spring WebFlux) para la comunicación no bloqueante. Implementado en `report-service` para llamar a `activity-service`.

\- \*\*Sincrónica (Legado):\*\* Se planea implementar `RestTemplate` para demostrar el conocimiento de ambos métodos. \*(Pendiente)\*



> ### 4.4.1. Aclaración: Estrategia de Reportes (Sprint 5)

>

> El `report-service` (Sprint 5) requerirá datos de \*todos\* los demás servicios.

>

> - \*\*Decisión Arquitectónica:\*\* Se descarta el uso de colas de mensajes (Kafka/RabbitMQ) por complejidad y tiempo.

> - \*\*Solución Adoptada:\*\* Se utilizará la \*\*agregación síncrona (en tiempo real)\*\*. Cuando se solicite un reporte, el `report-service` disparará múltiples llamadas `WebClient` asíncronas a los demás servicios, esperará todas las respuestas (`Mono.zip`), las combinará y generará el reporte.

> - \*\*Consecuencia Aceptada:\*\* Esta solución es "lenta" a escala (millones de usuarios) pero es arquitectónicamente correcta, limpia y la más rápida de implementar para los fines del proyecto.



> ### 4.5. Aclaración: Tareas Asíncronas (@Async)

>

> Para tareas que no deben bloquear la respuesta al usuario (como el envío de correos), se utiliza la anotación `@Async`.

>

> - \*\*Implementación:\*\* El `EmailService` en `user-service` usa `@Async`.

> - \*\*Requisito:\*\* Para que funcione, la clase principal de la aplicación (`UserServiceApplication.java`) debe estar anotada con `@EnableAsync`.



---

\## 5. Microservicios

\- \*\*user-service:\*\* Autenticación (login), registro y gestión de usuarios/roles. Es el único servicio que genera los tokens JWT.

\- \*\*activity-service:\*\* Administración de actividades (CRUD), inscripciones, validación de estado por Admins y consulta de participantes.

\- \*\*donation-service:\*\* Administración de donaciones. Expone un endpoint para ver el stock.

\- \*\*sponsor-service:\*\* Administración de sponsors (CRUD).

\- \*\*report-service:\*\* Generación de reportes. Llama a otros servicios (`WebClient`) para recolectar datos, como la asistencia.

\- \*\*gateway:\*\* Enrutamiento de peticiones y punto de entrada único al sistema.



> ### 5.1. Aclaración de Responsabilidades y Servicios (Sprints 3-5)

>

> Nuestro análisis de lógica de negocio ha redefinido las responsabilidades:

>

> 1.  \*\*NUEVO: `exchange-service` (Sprint 3):\*\*

>     \[cite\_start]- \*\*Propósito:\*\* Gestionar \*únicamente\* los intercambios (trueques)\[cite: 90].

>     - \*\*Lógica:\*\* Manejará la entidad `Exchange` (ver Sección 7.1). Gestionará ítems de `TipoItem.BIEN` (que requiere stock) y `TipoItem.SERVICIO` (que no requiere stock).

>

> 2.  \*\*MODIFICADO: `donation-service` (Sprints 3-4):\*\*

>     - \*\*Propósito:\*\* Gestionar \*únicamente\* las donaciones.

>     - \*\*Lógica Sprint 3 (US12, US13):\*\* Gestionará \*\*Donaciones en Especie\*\* (bienes o servicios donados sin esperar nada a cambio).

>     - \*\*Lógica Sprint 4 (US14, US15):\*\* Gestionará \*\*Donaciones Monetarias\*\*. Será el \*dueño\* de la lógica de integración con la pasarela de pago (MercadoPago) y de la conciliación de pagos (ver Sección 10.4).

>     - \*\*Lógica Sprint 5 (US18):\*\* \*\*NO gestionará egresos\*\*. Se determinó que "las donaciones son sagradas". Los reportes de balance serán de \*flujo\* (cuánto entró, a dónde fue), no de contabilidad (ingresos - gastos).



---

\## 6. Estructura de Paquetes (Estándar por Microservicio)

Cada microservicio sigue la siguiente estructura de paquetes:

\- `com.hugnet.nameservice\_service`

&nbsp;   - `config`: Clases de configuración (`SecurityConfig`, `JwtService`, `WebClientConfig`).

&nbsp;   - `controller`: Controladores REST.

&nbsp;   - `dto`: Objetos de Transferencia de Datos (DTOs).

&nbsp;       - `common`: DTOs comunes como `ErrorHandle`.

&nbsp;       - `mapper`: Clases `Mapper`.

&nbsp;   - `entity`: Entidades JPA y `Enums`.

&nbsp;   - `exception`: Excepciones personalizadas y `GlobalExceptionHandler`.

&nbsp;   - `repository`: Interfaces de Spring Data JPA.

&nbsp;   - `service`: Lógica de negocio.

&nbsp;       - `impl`: Implementaciones de las interfaces de servicio.



---

\## 7. Estructura de la Base de Datos

Cada microservicio mantiene su propia base de datos (actualmente H2 en memoria con `schema.sql` y `data.sql`).

\- \*\*Users:\*\* Contiene los datos de los usuarios y su rol (`Enum: USUARIO, COORDINADOR, ADMINISTRADOR`).

\- \*\*Activities:\*\* Posee un estado (`Enum: PENDIENTE, APROBADA, RECHAZADA`).

\- \*\*Sponsors:\*\* Posee un tipo (`Enum: EMPRESA, PARTICULAR, COMERCIO, ORGANIZACION`).

\- \*\*Donations:\*\* Posee un tipo (`Enum: MONETARIA, ESPECIE`).

\- \*\*Tablas Intermedias:\*\* `activity\_participants` (en `activity-service`) y `activity\_sponsors` (en `sponsor-service`).



> ### 7.1. Nuevas Entidades y Modificaciones (Sprints 3-5)

>

> Para soportar las nuevas funcionalidades, se crearán/modificarán las siguientes entidades:

>

> \*\*1. `Exchange.java` (Nueva, en `exchange-service`)\*\*

> - `id` (Long): PK

> - `titulo` (String): "Apuntes de Psicoanálisis"

> - `descripcion` (String): "Detalle de los apuntes"

> - `prestadorId` (Long): ID del usuario (con Rol.PRESTADOR) que lo publica.

> - `tipoItem` (Enum: `BIEN`, `SERVICIO`): Define si es un objeto físico (usa stock) o un servicio (no usa stock).

> - `estado` (Enum: `DISPONIBLE`, `RESERVADO`, `INTERCAMBIADO`): Controla el ciclo de vida del ítem.

> - `itemDeseado` (String): Texto libre. "Busco apuntes de Matemática". Resuelve el vacío de "a cambio de qué".

> - `token\_confirmacion` (UUID): Token único para la lógica del QR de entrega (US11).

>

> \*\*2. `Donation.java` (Modificada, en `donation-service`)\*\*

> - \*\*Campos a añadir (Sprint 4 - Pagos):\*\*

>     - `payment\_gateway\_id` (String, nullable): Para guardar el ID de la transacción de MercadoPago.

>     - `payment\_status` (Enum: `PENDIENTE\_PAGO`, `APROBADA`, `RECHAZADA`): Para la conciliación de pagos.

>

> \*\*3. `activity\_participants` (Modificada, en `activity-service`)\*\*

> - \*\*Campos a añadir (Sprint 5 - Asistencia QR):\*\*

>     - `asistio` (boolean, default: false)

>     - `token\_asistencia` (UUID): Token único para que el coordinador valide la asistencia del usuario (Lógica QR 2).



---

\## 8. Tecnologías

\- \[cite\_start]\*\*Backend:\*\* Java 17, Spring Boot, Spring Data JPA, Spring Security, Spring Cloud\[cite: 8, 9].

\- \[cite\_start]\*\*Dependencias Clave:\*\* `spring-boot-starter-webflux` (para WebClient), `jjwt` (para JWT), `spring-boot-starter-mail`\[cite: 10].

\- \[cite\_start]\*\*Frontend:\*\* HTML5, CSS3, JavaScript (ES6+), Bootstrap 5. (Nota: El Kickoff menciona Thymeleaf\[cite: 7], pero la implementación actual usa JS vanilla).

\- \[cite\_start]\*\*Bases de Datos:\*\* PostgreSQL (Producción) / H2 (Desarrollo)\[cite: 6].

\- \*\*Infraestructura:\*\* Docker, Docker Compose.

\- \*\*Documentación:\*\* Swagger / OpenAPI.



---

\## 9. Frontend (HTML, CSS, JS)

Se ha implementado una interfaz de usuario de una sola página (SPA) simulada con archivos HTML separados y un archivo `app.js` centralizado.



\### 9.1. Estructura de Archivos (Frontend)

\- `index.html`: Página de Login.

\- `register.html`: Página de Registro de nuevo usuario.

\- `dashboard.html`: Página principal que muestra la lista de actividades.

\- `js/app.js`: Contiene toda la lógica de frontend, enrutamiento simple y llamadas a la API.



\### 9.2. Flujo de Funcionamiento

1\.  \*\*Inicio:\*\* El usuario aterriza en `index.html`.

2\.  \*\*Login:\*\* El formulario de login (`initLoginPage`) llama al endpoint `/api/users/login`.

3\.  \*\*Token:\*\* Si el login es exitoso, la respuesta (que incluye el `token`, `rol`, `email` y `userId`) se guarda en `localStorage`.

4\.  \*\*Redirección:\*\* El usuario es enviado a `dashboard.html`.

5\.  \*\*Carga del Dashboard:\*\* Al cargar `dashboard.html`, `initDashboardPage` se ejecuta:

&nbsp;   - Verifica si hay un token en `localStorage`. Si no, lo patea de vuelta a `index.html`.

&nbsp;   - Llama a `fetchActivities` para buscar la lista de actividades.

6\.  \*\*Peticiones Seguras:\*\* Todas las llamadas a la API (excepto login/register) usan la función `getAuthHeaders()`, que toma el token del `localStorage` y lo añade a la cabecera `Authorization: Bearer <token>`.



\### 9.3. Lógica de Roles en la UI

La función `renderActivities` en `app.js` lee el `userRol` guardado en `localStorage` y renderiza los botones de acción dinámicamente:

\- \*\*`ADMINISTRADOR`:\*\* Ve "Aprobar" (si está PENDIENTE) y "Ver Lista". No ve "Participar".

\- \*\*`COORDINADOR`:\*\* Ve "Participar" y "Ver Lista".

\- \*\*`USUARIO`:\*\* Ve únicamente "Participar".



---

\## 10. Historias de Usuario (por Sprint)



✅Sprint 1 (25/09 → 08/10) – Usuarios + Actividades

(US01–US07)



✅ Sprint 2 (09/10 → 22/10) – Administración básica + Sponsors iniciales + Reportes simples

(US16, US17, US19, US21, US24, US27)



---

\### ⬜ Sprint 3 (23/10 → 05/11) – Intercambio + Donaciones en especie

\*(Historias: US08–US13)\*



> ### 10.1. Aclaración Arquitectónica del Sprint 3

>

> Este Sprint se divide en dos grandes frentes de trabajo que ocurren en paralelo: la creación del `exchange-service` y la ampliación del `donation-service`.

>

> \*\*Acciones Requeridas (Inicio de Sprint):\*\*

> 1.  \*\*En `user-service`:\*\* Añadir el `Enum Rol.PRESTADOR`.

> 2.  \*\*Nuevo Proyecto:\*\* Crear el esqueleto del microservicio `exchange-service` (copiando la estructura estándar de `user-service`: config, controller, dto, entity, etc.).

>

> \*\*Plan de Implementación por HU:\*\*

>

> \* \*\*US08: Publicar bien/servicio (Intercambio):\*\*

>     \* \*\*Microservicio:\*\* `exchange-service`.

>     \* \*\*Entidad:\*\* `Exchange.java` (como se definió en 7.1).

>     \* \*\*Lógica:\*\* Crear `ExchangeController` con un endpoint `POST /api/exchanges`. Debe estar protegido (`@PreAuthorize("hasRole('PRESTADOR')")`). El DTO (`CreateExchangeDTO`) recibirá `titulo`, `descripcion`, `tipoItem` y `itemDeseado`. El `Service` asignará el `prestadorId` (desde el token/cabecera) y el `estado` (default: `DISPONIBLE`).

>

> \* \*\*US09: Solicitar bien publicado:\*\*

>     \* \*\*Microservicio:\*\* `exchange-service`.

>     \* \*\*Lógica:\*\* Endpoint `PATCH /api/exchanges/{id}/solicitar`. El `Service` cambiará el `estado` de `DISPONIBLE` a `RESERVADO` y generará el `token\_confirmacion` (UUID) para el QR.

>

> \* \*\*US10: Controlar stock de intercambio:\*\*

>     \* \*\*Microservicio:\*\* `exchange-service`.

>     \* \*\*Lógica:\*\* Endpoint `GET /api/exchanges`. Permitirá filtros por `estado` o `prestadorId`. (La lógica de "stock" real se aplica solo a `TipoItem.BIEN`).

>

> \* \*\*US11: Confirmar entrega con QR:\*\*

>     \* \*\*Microservicio:\*\* `exchange-service`.

>     \* \*\*Lógica:\*\* Endpoint `GET /api/exchanges/confirmar/{token}`.

>     \* \*\*Flujo:\*\* 1. El Coordinador (o Prestador) genera el QR desde el frontend. El QR contiene la URL a este endpoint. 2. El Usuario (receptor) escanea el QR. 3. Su teléfono visita la URL. 4. El `Service` busca el `Exchange` por el `token\_confirmacion`, valida que esté `RESERVADO`, y lo cambia a `INTERCAMBIADO`.

>

> \* \*\*US12: Realizar donación en especie:\*\*

>     \* \*\*Microservicio:\*\* `donation-service`.

>     \* \*\*Lógica:\*\* Ampliar la entidad `Donation.java` para que maneje donaciones en especie. (Debe incluir `TipoItem` (BIEN/SERVICIO), `descripcion`, `cantidad`, `estado` (PENDIENTE, APROBADA)).

>

> \* \*\*US13: Registrar y actualizar stock de donaciones:\*\*

>     \* \*\*Microservicio:\*\* `donation-service`.

>     \* \*\*Lógica:\*\* Endpoints para que el `Gestor de Donaciones` pueda ver las donaciones `PENDIENTE` y moverlas a `APROBADA` (aceptando el bien en el inventario).



---

\### ⬜ Sprint 4 (06/11 → 19/11) – Donaciones monetarias + Sponsors avanzados

\*(Historias: US14, US15, US20, US28)\*



> ### 10.2. Aclaración Arquitectónica del Sprint 4

>

> El foco de este sprint es la \*\*integración con la pasarela de pagos (MercadoPago)\*\*.

>

> \*\*Plan de Implementación por HU:\*\*

>

> \* \*\*US14: Donación en efectivo (Pasarela de pago):\*\*

>     \* \*\*Microservicio:\*\* `donation-service`.

>     \* \*\*Entorno de Pruebas:\*\* \*\*No se usará dinero real\*\*. Se debe crear una cuenta de desarrollador en MercadoPago para obtener credenciales del \*\*Modo Sandbox\*\*. Esto proveerá tarjetas de crédito de prueba.

>     \* \*\*Entidad:\*\* Modificar `Donation.java` (como se definió en 7.1) para añadir `payment\_gateway\_id` y `payment\_status`.

>     \* \*\*Flujo Técnico:\*\*

>         1.  \*\*Frontend:\*\* Usuario selecciona monto (ej. $500). Llama al backend.

>         2.  \*\*Backend (`donation-service`):\*\* Crea la `Donation` en BD (monto: 500, status: `PENDIENTE\_PAGO`).

>         3.  \*\*Backend:\*\* Llama a la API de MP (Sandbox) para crear una "Preferencia de Pago". En esta llamada, se especifica una \*\*URL de Webhook\*\* (ej. `https://api.hugnet.com/api/donations/webhook/mp`).

>         4.  \*\*MP:\*\* Devuelve una URL de pago (ej. `mercadopago.com/checkout/123`).

>         5.  \*\*Backend:\*\* Devuelve esa URL al frontend.

>         6.  \*\*Frontend:\*\* Redirige al usuario a la URL de MercadoPago.

>         7.  \*\*MP (Sandbox):\*\* El usuario paga con la tarjeta de prueba.

>         8.  \*\*MP (Webhook):\*\* MercadoPago llama a nuestra URL de Webhook (`.../webhook/mp`) para notificarnos que el pago fue aprobado.

>         9.  \*\*Backend (`donation-service`):\*\* Nuestro endpoint de Webhook recibe la notificación, busca la `Donation` y actualiza su `payment\_status` a `APROBADA`.

>

> \* \*\*US15: Validar donaciones monetarias:\*\*

>     \* \*\*Microservicio:\*\* `donation-service`.

>     \* \*\*Lógica:\*\* Endpoint `GET /api/donations/monetary` (protegido para `Gestor de Donaciones`) que muestra todas las donaciones y su `payment\_status`.



---

\### ⬜ Sprint 5 (20/11 → 03/12) – Reportes finales + PWA + Sponsors avanzados

\*(Historias: US18, US22, US23, US25, US26, US29, US30)\*



> ### 10.3. Aclaración Arquitectónica del Sprint 5

>

> Este Sprint integra todo. El foco está en el `report-service` y la implementación de las 3 lógicas de QR.

>

> \*\*Plan de Implementación por HU (Foco en Lógica):\*\*

>

> \* \*\*US18: Reporte de balance de evento:\*\*

>     \* \*\*Microservicio:\*\* `report-service`.

>     \* \*\*Lógica Aclarada:\*\* "Balance" \*\*NO\*\* es `Ingresos - Egresos`. Es un reporte de \*\*flujo de bienes y fondos\*\*.

>     \* \*\*Flujo Técnico:\*\* El `report-service` llamará (vía `WebClient`) a:

>         1.  `donation-service`: "Dame todas las donaciones (monetarias y en especie) aprobadas para la actividad X".

>         2.  `sponsor-service`: "Dame todos los aportes (ej. 300 botellas de agua) para la actividad X".

>         3.  El `report-service` agregará estos datos y los presentará.

>

> \* \*\*US23: Ranking de usuarios más activos:\*\*

>     \* \*\*Microservicio:\*\* `report-service`.

>     \* \*\*Lógica:\*\* (Ver 4.4.1). El servicio llamará a `user-service` (dame todos los usuarios), `activity-service` (dame asistencias), `donation-service` (dame donaciones), `exchange-service` (dame intercambios), y aplicará una lógica (ej. 10 ptos por asistencia, 5 por donación) para generar el ranking.

>

> \* \*\*US25: QR para acceder rápido a info de evento:\*\*

>     \* \*\*Microservicio:\*\* `activity-service` (para datos) y \*\*Frontend\*\* (para generación).

>     \* \*\*Lógica:\*\* Este es un \*\*"QR Tonto" (de solo lectura)\*\*.

>     \* \*\*Flujo Técnico:\*\* El frontend generará una imagen QR que contiene \*únicamente\* la URL pública de la actividad (ej. `https://hugnet.com/actividad/42`). El `activity-service` no requiere lógica especial.

>

> \* \*\*Aclaración - QR de Asistencia (Lógica Faltante US06/US19):\*\*

>     \* Este es el \*\*"QR Inteligente" N°2\*\* (además del US11).

>     \* \*\*Microservicio:\*\* `activity-service`.

>     \* \*\*Entidad:\*\* Modificar `activity\_participants` (como se definió en 7.1) para añadir `token\_asistencia` (UUID) y `asistio` (boolean).

>     \* \*\*Flujo Técnico:\*\* 1. El Coordinador ve la lista de inscriptos en su app. 2. Toca el nombre de "Manolo". 3. La app muestra un QR que contiene la URL `api/activities/asistencia/{token\_de\_manolo}`. 4. Manolo escanea ese QR. 5. El `Service` recibe la llamada, busca por el token, y marca `asistio = true`.



---

\## 11. Estado de Avance (✔ ⚠ ⬜)

✔ Sprint 1: Completado.

✔ Sprint 2: \*\*Completado (funcionalidad backend y frontend demo).\*\*

⬜ Sprint 3: Planificado.

⬜ Sprint 4: Planificado.

⬜ Sprint 5: Planificado.



---

\## 12. Próximos pasos (Pendientes)

Lista de tareas técnicas y funcionales \*\*inmediatas\*\* para iniciar el \*\*Sprint 3\*\*.



> \*Esta sección reemplaza los pendientes obsoletos del documento original.\*



\### 12.1. Tarea 1: Modificar `user-service`

1\.  Abrir el `Enum Rol.java`.

2\.  Añadir el valor `PRESTADOR`.



\### 12.2. Tarea 2: Crear `exchange-service`

1\.  Crear un nuevo módulo de Spring Boot (`exchange-service`).

2\.  Copiar la estructura de carpetas estándar (config, controller, dto, etc.).

3\.  Configurar su `pom.xml` (añadiendo dependencias web, jpa, postgresql, lombok, validation).

4\.  Configurar su `application.yml` (puerto, nombre de servicio, BBDD `hugnet\_exchanges`).

5\.  Añadir el nuevo servicio al `docker-compose.yml` (siguiendo el patrón de `user-service`).

6\.  Añadir las reglas de enrutamiento en el `gateway` (para `/api/exchanges`).



\### 12.3. Tarea 3: Implementar Entidad Base (en `exchange-service`)

1\.  Crear los `Enums`: `TipoItem.java` y `ExchangeStatus.java`.

2\.  Crear la entidad `Exchange.java` (siguiendo la estructura de la Sección 7.1).

3\.  Crear la interfaz `ExchangeRepository.java`.



\### 12.4. Tarea 4: Implementar HU-08 (en `exchange-service`)

1\.  Crear `ExchangeDTO.java`, `CreateExchangeDTO.java` y el `ExchangeMapper.java`.

2\.  Crear `ExchangeService.java` y `ExchangeServiceImpl.java`.

3\.  Implementar el método `createExchange(CreateExchangeDTO dto, String userId)`.

4\.  Crear `ExchangeController.java` con el endpoint `POST /api/exchanges`.

5\.  Asegurarse de que el endpoint esté protegido (`@PreAuthorize`) y extraiga el `userId` de las cabeceras (`X-User-Id`) que inyecta el gateway.

