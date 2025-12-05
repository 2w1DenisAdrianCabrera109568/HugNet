Documento de Avance de Sesión (03/11/2025)

1\. Tareas Completadas (Resumen de Hoy):



Contexto Establecido: Se cargó y analizó con éxito el HugNet\_Documento\_Maestro.md, el Kickoff\_109568\_HugNet.docx.pdf y el ERD\_HugNet\_Refactorizada.jpg.



Bug de Registro (500) Solucionado:



Causa: Se identificó un PropertyValueException (rol nulo) al registrar usuarios vía Postman.



Solución: Se implementó una solución de seguridad y lógica:



Se eliminó rol del CreateUserDTO (Seguridad).



Se añadió el método @PrePersist a la entidad User.java para asignar Rol.USUARIO por defecto (Robustez).



Se actualizó el UserMapper para que no intente mapear el rol eliminado.



Bug de Validación (400) Solucionado:



Causa: Se identificó que faltaba la dependencia spring-boot-starter-validation en el user-service, lo que provocaba que se ignoraran las anotaciones @Valid.



Solución: Se añadió la dependencia al pom.xml del user-service.



Servicio de Email (Mailtrap) Solucionado:



Causa: Conflicto de configuración entre application.yml (Gmail) y docker-compose.yml (Mailtrap), además de placeholders en las credenciales.



Solución: Se corrigió el docker-compose.yml para usar las credenciales reales de Mailtrap y se añadió @EnableAsync a la aplicación para habilitar el envío asíncrono.



Planificación de Sprints Futuros:



Se realizó un análisis de vacíos arquitectónicos (Egresos, Pagos, QRs, Reportes) y se refinó la lógica de negocio para los Sprints 4 y 5.



Documentación (Hito):



Se generó y entregó el HugNet\_Documento\_Maestro (v2 - Actualizado), que incluye toda la lógica de negocio refinada, las soluciones técnicas y la hoja de ruta detallada para todos los sprints restantes.



2\. Próximo Paso Inmediato (Inicio Próxima Sesión):



Proyecto: user-service



Tarea: Sprint 3 - Tarea 1



Acción: Abrir el archivo Rol.java (el Enum) y añadir el nuevo rol: PRESTADOR.



¡Perfecto! Entendido. Que tengas una buena salida.



Ha sido una sesión increíblemente productiva. Hemos hecho una refactorización de arquitectura que es la base de todo lo que sigue.



Aquí tienes el resumen de nuestra jornada.



# Documento de Avance de Sesión (20/11/2025 - Madrugada)

## 1. Resumen Ejecutivo
Se ha alcanzado el hito **"Backend Code Complete"** para el Sprint 4.
Se resolvieron bloqueos críticos de infraestructura Docker (conflictos de puertos y resolución DNS) y se completó la integración con la API de MercadoPago.

## 2. Tareas Técnicas Completadas

### 🔧 Infraestructura
* **Enroque de Puertos:** Se detectó que el Gateway buscaba el puerto `8084` para donaciones, pero este estaba ocupado por reportes.
    * *Solución:* `donation-service` pasó al **8084**. `report-service` pasó al **8085**.
* **Resolución DNS:** Se eliminó la dependencia de Eureka (`@LoadBalanced`) en los clientes WebClient.
    * *Solución:* Se configuraron las llamadas directas a `http://activity-service:8082` en `sponsor-service` y `report-service`.

### 💰 Donation Service (Pagos)
* **MercadoPago:** Se implementó el flujo de creación de preferencias.
* **Fix Error 400:** Se desactivó `auto_return` en la construcción de la preferencia para evitar errores de validación de URLs de retorno por parte del SDK de Java.
* **Validación:** Se relajaron las restricciones del DTO para permitir donaciones sin ítems físicos.

### 🤝 Sponsor & Report Service
* **Seguridad Inter-Servicios:** Se implementó la propagación del token JWT en las cabeceras de `WebClient`. Esto solucionó el error 403 al intentar validar actividades desde otros servicios.
* **Reportes:** Se implementó la lógica de agregación en memoria para el reporte de participación por tipo.

## 3. Plan de Trabajo Inmediato (Próxima Sesión)

**IMPORTANTE PARA EL ALUMNO:**
La próxima sesión se debe enfocar **exclusivamente** en el Frontend y la Demo. No tocar más código Backend a menos que sea crítico.

1.  **Frontend (Donar):**
    * Crear botón en `dashboard.html`.
    * JS: `fetch('/api/donations')` -> recibir JSON -> `window.location.href = data.paymentUrl`.

2.  **Frontend (Sponsors):**
    * Crear vista simple para seleccionar Sponsor y poner ID de Actividad.

3.  **Frontend (QRs - Deuda Sprint 3):**
    * Asegurar que se puedan mostrar los QRs de intercambio generados en el Sprint anterior para incluirlos en el video.

4.  **Limpieza:**
    * Si los logs de Eureka siguen molestando, comentar la dependencia `spring-cloud-starter-netflix-eureka-client` en los `pom.xml` antes de grabar.

# Documento de Avance de Sesión (Sprint 4 - Cierre y Demo)

**Fecha:** 21/11/2025
**Estado:** ✅ Video Demo Grabado / Backend Code Complete
**Foco de la Sesión:** Integración Frontend (Pagos y QRs), Solución de Bugs Críticos y Preparación para Demo.

---

## 1. Resumen Ejecutivo
Se completó con éxito la integración visual de las funcionalidades clave del Sprint 4 (Donaciones) y Sprint 3 (Intercambios) en el Frontend. Se aplicaron correcciones rápidas en el Backend y Frontend ("Workarounds") para garantizar la fluidez de la grabación del video demostrativo, logrando un flujo de usuario funcional de punta a punta ("Happy Path").

---

## 2. Tareas Completadas y Logros Técnicos

### 💰 Módulo "Tu Aporte" (Donaciones Monetarias - Sprint 4)
* **Nueva Sección UI:** Se creó la vista de tarjetas ("Tu Aporte") reemplazando el formulario simple. Ahora permite donar al "Fondo Común" o a "Campañas Activas" específicas traídas del backend.
* **Integración MercadoPago:**
    * Implementación de Modal con selectores de monto fijo ($500, $1000, $2000) para mejorar UX móvil.
    * **Corrección de Error 500 (Backend):** Se ajustó el payload JSON en `app.js` para coincidir con los Enums estrictos de Java (`tipoDonacion: 'MONETARIA'`).
    * **Flujo de Pago:** Se configuraron las `backUrls` en `DonationServiceImpl.java` para redirigir correctamente a `/frontend/dashboard.html?view=Tu%20Aporte`.
* **Simulación de Éxito:** Se agregó un botón manual "✅ ¡Ya pagué!" en el frontend para simular el retorno automático y mostrar el mensaje de agradecimiento en el video (mitigación de problemas con `auto_return` en localhost).

### 🤝 Módulo Intercambios (Trueque - Sprint 3)
* **Corrección de Permisos (Backend):** Se modificó `ExchangeController` agregando `hasRole('USUARIO')` en el endpoint `GET /api/exchanges`. Esto solucionó el error 500/403 que impedía a los usuarios comunes ver la lista de ítems.
* **Validación QR:**
    * Se cambió el método de confirmación de `GET` a `PATCH` en Backend y Frontend para cumplir con buenas prácticas REST y seguridad.
    * **Simulación de Escaneo:** Se implementó un botón "Confirmar Entrega" dentro del modal del QR en `app.js`. Esto permite simular en la PC la acción que haría un celular real al escanear, cerrando el ciclo del ítem a estado `INTERCAMBIADO`.
* **UI Fixes:** Se solucionó el bug de "Cargando..." infinito implementando manejo de errores (`try/catch`) en `fetchExchanges`.

### 📅 Módulo "Mis Actividades" (Historial de Usuario)
* **Frontend Implementado:** Se creó la lógica en `app.js` (`loadMyActivitiesPage`) para renderizar una tabla con las inscripciones del usuario logueado.
* **Estado Actual:** La vista existe en el frontend, pero actualmente muestra error o vacío porque falta el endpoint correspondiente en el Backend (ver Deuda Técnica).

---

## 3. Deuda Técnica y Tareas Pendientes (Post-Demo / Sprint 5)

Los siguientes puntos son soluciones temporales implementadas para la Demo que deben ser refactorizadas para llevar el código a calidad de producción:

### 🔧 Backend (Java)
1.  **Endpoint Faltante (Prioridad):** Implementar el endpoint `GET /api/activities/user/{userId}` (o similar) en `ActivityController`. Actualmente, el frontend no puede listar las inscripciones históricas del usuario.
2.  **MercadoPago Auto-Return:** Descomentar la línea `.autoReturn("approved")` en `DonationServiceImpl` una vez que el entorno de despliegue tenga URLs públicas o estables (evitar conflictos de `localhost`).
3.  **Validación Robusta:** Revisar `DonationController` para que maneje `ItemType` nulos internamente para donaciones monetarias, sin depender de la estructura exacta del JSON del cliente.

### 🖥️ Frontend (JavaScript)
1.  **Limpieza de Simulaciones:** Eliminar los botones de "Simulación" (Confirmar Entrega manual y "Ya pagué") en `app.js`. La confirmación debe ser 100% automática vía Webhooks o redirección real.
2.  **Filtros Reales:** Restituir el filtrado por servidor en `fetchExchanges` (enviar `?estado=DISPONIBLE`) en lugar de filtrar el array en memoria en el cliente.
3.  **Hardcoding:** Revisar y limpiar cualquier ID o título estático en el flujo de donación si quedaron remanentes de prueba.

---

## 4. Próximos Pasos Inmediatos
1.  Finalizar edición y subida del Video Demo.
2.  Comenzar el Sprint 5 abordando primero la creación del endpoint de "Mis Actividades".


# Documento de Avance de Sesión (26/11/2025)

## 1. Resumen Ejecutivo
**Hito Alcanzado:** ✅ **Backend Code Complete (Sprint 5 & TFI General)**.
En esta sesión se completó el 100% de la lógica de backend requerida para la Gestión Administrativa, Reportes, Sponsors y funcionalidades de historial de usuario. Se resolvieron deudas técnicas de UX (nombres reales en listas) y se implementó la orquestación entre microservicios para generar reportes complejos sin violar los límites de dominio.

---

## 2. Detalle de Implementaciones Técnicas

### 📊 Report Service (Orquestador de Reportes)
Se transformó al `report-service` en un agregador que consume datos de múltiples fuentes (Activity, User, Donation, Exchange) para generar las métricas administrativas.

1.  **US18 - Reporte de Balance Financiero:**
    * **Lógica:** Cruce de `activity-service` (eventos) con `donation-service` (ingresos monetarios).
    * **Endpoint:** `GET /api/reports/financial-balance`
    * **DTO:** `BalanceReportDTO` (Ingresos, Egresos, Balance Neto).

2.  **US25/US26 - Reporte de Stock Unificado:**
    * **Lógica:** Consolidación de "Donaciones en Especie" (puerto 8084) e "Ítems de Intercambio" (puerto 8086).
    * **DTO:** `StockItemDTO` (Unifica campos dispares en una vista común).

3.  **US23 - Ranking de Usuarios:**
    * **Lógica:** Cálculo de frecuencia de participación (desde Activity) enriquecido con datos personales (desde User).
    * **Optimización:** Se implementó un fetch de nombres "on-demand" para el Top 10.

4.  **Mejora UX - Lista de Participantes (Nombres Reales):**
    * **Problema:** `activity-service` solo devolvía IDs (`[1, 5, 9]`).
    * **Solución:** Se creó endpoint en Reportes que busca los IDs y luego consulta sus nombres al `user-service`.
    * **Endpoint:** `GET /api/reports/activity/{id}/participants-list`.

### 🤝 Sponsor Service (Gestión y Transparencia)
1.  **US29 - Reporte de Aportes:**
    * **Implementación:** Búsqueda en `ActivitySponsorRepository` filtrando por actividad.
    * **Endpoint:** `GET /api/sponsors/activity/{id}/report`.

2.  **US30 - Notificación de Transparencia (Email):**
    * **Funcionalidad:** Envío de correo real al sponsor agradeciendo el aporte específico.
    * **Infraestructura:** Integración con **Mailtrap** usando `JavaMailSender`.
    * **Fix Crítico:** Se solucionó el error de `MimeMessage missing` agregando la dependencia `jakarta.mail` y `spring-boot-starter-mail` al `pom.xml`.

### 📅 Activity Service (Historial)
1.  **Deuda Técnica - "Mis Actividades":**
    * **Implementación:** Endpoint para que el usuario vea su historial de inscripciones.
    * **Desafío:** La entidad `ActivityParticipant` es una tabla de unión pura (solo IDs) sin relación `@ManyToOne`.
    * **Solución:** Lógica en dos pasos: 1) Buscar IDs en tabla intermedia, 2) Buscar entidades `Activity` completas.
    * **Endpoint:** `GET /api/activities/user/{userId}`.

---

## 3. Correcciones y Refactorizaciones
* **Limpieza de Dependencias:** Se corrigieron conflictos en `sponsor-service` para habilitar el envío de correos.
* **Mappers:** Se utilizó `ActivityMapper` existente para mantener limpio el servicio de actividades.
* **Aclaración de US:** Se re-alinearon las Historias de Usuario con la documentación real (US18-US30) para evitar programar funcionalidades duplicadas o inexistentes.

---

## 4. Checklist Pendiente (Frontend - Próxima Sesión)
El Backend está listo. La próxima sesión debe enfocarse 100% en HTML, CSS y JS.

- [ ] **Vistas de Reportes (Admin Dashboard):**
    - [ ] Tabla de Balance Financiero.
    - [ ] Tabla de Stock Unificado.
    - [ ] Tabla de Ranking de Usuarios.
- [ ] **Gestión de Sponsors (Coordinador):**
    - [ ] Vista de reporte de aportes por actividad.
    - [ ] Botón "Notificar Sponsor" (conectar con endpoint de email).
- [ ] **Perfil de Usuario:**
    - [ ] Vista "Mis Actividades" (consumiendo el nuevo endpoint de historial).
- [ ] **Exportación PDF (US22):**
    - [ ] Implementar librería JS (`jspdf` o `html2pdf`) en el cliente.
- [ ] **PWA (US26):**
    - [ ] Crear `manifest.json`.
    - [ ] Registrar Service Worker básico.
- [ ] **QR Acceso Rápido (US25):**
    - [ ] Generación visual del QR en el detalle del evento.

---

**Estado Final de la Sesión:** ✅ Exitoso. Backend listo para integración.



Documento de Avance de Sesión (04/12/2025 - Cierre de Proyecto)
1. Resumen Ejecutivo
Hito Alcanzado: ✅ Proyecto HugNet Finalizado (Feature Complete). Se completó la integración total del Frontend con el Backend, se implementó la seguridad "Gateway Offloading" en todos los servicios restantes y se refactorizó el Frontend para usar una arquitectura limpia basada en <template>. Se añadió soporte PWA y exportación a PDF.

2. Detalle de Implementaciones Técnicas
🛡️ Seguridad y Arquitectura
Seguridad Gateway-Offloading: Se estandarizó la seguridad en user-service, report-service, sponsor-service y exchange-service. Ahora todos confían en las cabeceras X-User-Id y X-User-Rol inyectadas por el Gateway, eliminando la validación redundante de tokens y solucionando los errores 403 Forbidden en llamadas internas.

Fix de Comunicación Inter-Servicios: Se actualizaron todos los clientes WebClient en report-service y sponsor-service para propagar las cabeceras de seguridad en las llamadas internas.

💻 Frontend (Refactorización y Mejoras)
Arquitectura de Templates: Se eliminó la inyección de HTML mediante strings en JS. Se implementaron etiquetas <template> en dashboard.html para las vistas de Actividades, Usuarios y Perfil, mejorando la mantenibilidad y limpieza del código.

PWA (Progressive Web App): Se configuró manifest.json y service-worker.js. Se corrigió el error de caché (referencia a style.css inexistente) logrando que la app sea instalable en Desktop y Móvil.

Exportación PDF (US22): Se integró html2pdf.js para permitir la descarga de cualquier reporte visible.

👤 Módulo de Usuarios (Admin y Personal)
Gestión de Usuarios (Admin):

Se creó la vista de lista de usuarios con buscador.

Backend: Se implementó GET /api/users (Listar todos) y PATCH /api/users/{id}/role (Cambiar Rol) en user-service.

Frontend: Se permite al administrador promover usuarios a COORDINADOR o eliminarlos.

Mi Perfil:

Se creó la vista de perfil personal.

Se implementó la lógica de "Eliminar mi cuenta" conectada al endpoint DELETE /api/users/{id}.

🤝 Módulo de Coordinación
Grilla de Actividades Mejorada:

Se implementó un menú contextual (Dropdown "3 puntitos") exclusivo para Coordinadores.

Lista de Asistentes (US06):

Se conectó el Frontend con report-service para obtener nombres reales de los participantes.

Se solucionó el conflicto de variables (userId vs participantId) en el bucle del servicio.

Asignación de Sponsors (US28):

Se implementó el Modal con <select> dinámico.

Backend: Se creó el endpoint GET /api/sponsors y se corrigió el POST /{id}/assign para validar la actividad de forma segura.

📊 Reportes
Stock Unificado (US21/US13): Se finalizó la lógica de agregación (Donaciones + Intercambios) y se implementó la carga automática en el Frontend.

Sponsors (US29/US30): Se implementó la búsqueda por ID de actividad y el botón de notificación por correo.

3. Estado del Código
Backend: Todos los microservicios (user, activity, sponsor, donation, report, exchange, gateway) están operativos, dockerizados y comunicados.

Frontend: app.js contiene toda la lógica de negocio, enrutamiento y manejo de errores. dashboard.html contiene la estructura y los templates.

4. Próximos Pasos (Post-Desarrollo)
Grabación de Demo: El sistema está listo para el recorrido completo de todas las Historias de Usuario.

Limpieza de Datos: Se recomienda borrar la base de datos H2 (reiniciar contenedores) antes de grabar para empezar con datos limpios. }