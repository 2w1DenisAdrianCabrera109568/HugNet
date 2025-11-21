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