---



\# HugNet — Documento Maestro (v4 - Cierre Backend Sprint 4)



\## 1. Descripción y Objetivo

HugNet es una plataforma digital destinada a la gestión y coordinación de actividades solidarias en instituciones educativas y organizaciones sociales. Su objetivo es conectar a voluntarios, coordinadores, sponsors y gestores de donaciones dentro de un mismo ecosistema colaborativo. El propósito funcional es brindar una solución modular y escalable basada en microservicios, permitiendo administrar usuarios, actividades, donaciones y reportes de forma eficiente y segura.



---



\## 2. Alcance y Funcionalidades

El proyecto abarca el desarrollo de una plataforma web funcional que contemple las siguientes gestiones:

\- Gestión de usuarios y roles.

\- Gestión de actividades solidarias.

\- Gestión de donaciones en especie y monetarias.

\- Gestión de sponsors y sus aportes.

\- Generación de reportes administrativos y operativos.

\- Envío de correos electrónicos y notificaciones (futuro).



---



\## 3. Roles del Sistema

\- \*\*Usuario:\*\* Se registra, inicia sesión, participa en actividades y realiza donaciones.

\- \*\*Coordinador:\*\* Crea y gestiona actividades, asigna sponsors y genera reportes.

\- \*\*Gestor de Donaciones:\*\* Supervisa el stock y valida donaciones materiales o monetarias.

\- \*\*Sponsor:\*\* Apoya las actividades mediante aportes o recursos.

\- \*\*Administrador:\*\* Supervisa usuarios, roles, actividades y reportes globales.



> ### 3.1. Aclaración de Roles (Acumulado Sprints 3-4)

>

> - \*\*Prestador:\*\* Rol introducido en Sprint 3 para usuarios que ofrecen servicios o bienes de intercambio.

> - \*\*Coordinador (Sponsors):\*\* En el Sprint 4 se reforzó su rol para permitirle asignar patrocinadores a las actividades que organiza.



---



\## 4. Arquitectura General

El sistema está basado en una arquitectura de \*\*microservicios con Spring Boot\*\*, utilizando un API Gateway para la comunicación. Cada servicio es autónomo y posee su propia base de datos relacional (PostgreSQL en producción, H2 para desarrollo).



\### 4.1. Seguridad (Gateway Pattern)

La seguridad utiliza \*\*JSON Web Tokens (JWT)\*\* pero con validación centralizada:

1\.  \*\*Gateway:\*\* Valida la firma del token. Si es correcto, extrae `userId` y `rol`.

2\.  \*\*Inyección:\*\* Añade cabeceras `X-User-Id` y `X-User-Rol` a la petición.

3\.  \*\*Servicios Internos:\*\* Confían en las cabeceras y autorizan mediante `@PreAuthorize`.



> ### 4.2. Aclaración Arquitectónica Sprint 4 (Comunicación)

>

> Debido a problemas de inestabilidad en la resolución de nombres dinámica en el entorno Docker local:

> - \*\*Se elimina\*\* el uso de `@LoadBalanced` y Eureka para llamadas internas.

> - \*\*Se implementa\*\* la resolución directa por DNS de Docker (ej: `http://activity-service:8082`).

> - \*\*Webhooks:\*\* Se configuraron excepciones de seguridad públicas para recibir notificaciones de MercadoPago.



---



\## 5. Microservicios y Puertos (Configuración Definitiva v4)



Debido a conflictos de puertos detectados durante el Sprint 4, se reestructuró el mapa de puertos para evitar choques con el Gateway.



| Servicio | Puerto Docker | Responsabilidad Principal |

| :--- | :--- | :--- |

| \*\*gateway\*\* | `8080` | Punto de entrada y Seguridad Centralizada. |

| \*\*user-service\*\* | `8081` | Autenticación y Usuarios. |

| \*\*activity-service\*\* | `8082` | Actividades e Inscripciones. |

| \*\*sponsor-service\*\* | `8083` | Sponsors y Asignaciones (Llama a activity-service). |

| \*\*donation-service\*\* | `8084` | Donaciones y MercadoPago (Movido del 8085). |

| \*\*report-service\*\* | `8085` | Reportes Agregados (Movido del 8084). |

| \*\*exchange-service\*\* | `8086` | Intercambios y QRs. |



---



\## 6. Estructura de Paquetes

Estándar: `config`, `controller`, `dto`, `entity`, `repository`, `service`.



---



\## 7. Estructura de la Base de Datos (Nuevas Entidades)



\### 7.1. Modificaciones Sprint 4



\*\*1. `Donation` (donation-service)\*\*

Se actualizó para soportar el flujo híbrido (Monetario/Especie):

\- `monto` (Double): Cuantía de la donación.

\- `payment\_gateway\_id` (String): ID de la preferencia de MP.

\- `payment\_status` (Enum): `PENDIENTE\_PAGO`, `APROBADO`, `RECHAZADO`.

\- \*Nota:\* Los campos de especie (`itemType`) ahora aceptan nulos.



\*\*2. `ActivitySponsor` (sponsor-service)\*\*

Nueva entidad intermedia para la relación N:M lógica:

\- `id` (PK).

\- `sponsor\_id` (FK Local).

\- `activity\_id` (Long): Referencia remota a la actividad.

\- `descripcion\_aporte` (String).



---



\## 8. Tecnologías

\- \*\*Backend:\*\* Java 17, Spring Boot, Spring Cloud Gateway.

\- \*\*Integraciones:\*\*

&nbsp;   - \*\*MercadoPago SDK (v2.1.28):\*\* Checkout Pro (Bypass de `auto\_return` aplicado).

&nbsp;   - \*\*WebClient:\*\* Comunicación reactiva interna.

\- \*\*Frontend:\*\* HTML5, CSS3, JS Vanilla.

\- \*\*Infraestructura:\*\* Docker Compose.



---



\## 9. Frontend

SPA simulada con `app.js`.

\*(Pendiente de integración Sprint 4).\*



---



\## 10. Historias de Usuario (Estado)



✅ \*\*Sprint 1:\*\* Usuarios + Actividades.

✅ \*\*Sprint 2:\*\* Administración básica.

✅ \*\*Sprint 3:\*\* Intercambio + Donaciones en Especie.



\### ⚠ Sprint 4 (En Progreso - Backend Terminado)

\*(Historias: US14, US15, US20, US28)\*



> ### 10.1. Implementación Técnica Sprint 4

>

> \*\*US14: Donación Monetaria\*\*

> - Integración completa con MercadoPago (Sandbox).

> - Endpoint: `POST /api/donations` devuelve `paymentUrl`.

>

> \*\*US28: Asignar Sponsors\*\*

> - Endpoint: `POST /api/sponsors/{id}/assign`.

> - Valida existencia de actividad vía HTTP directo (`:8082`).

>

> \*\*US20: Reportes Agregados\*\*

> - Endpoint: `GET /api/reports/participation-by-type`.

> - Agrega datos en memoria usando Java Streams.



---



\## 11. Estado de Avance



| Sprint | Estado | Notas |

| :--- | :--- | :--- |

| Sprint 1 | ✔ Completado | Funcional. |

| Sprint 2 | ✔ Completado | Funcional. |

| Sprint 3 | ✔ Completado | Funcional (QRs pendientes de validar en video). |

| Sprint 4 | ⚠ Backend Ready | \*\*Backend:\*\* 100% Código y Pruebas (Postman).<br>\*\*Frontend:\*\* Pendiente integración visual. |

| Sprint 5 | ⬜ Planificado | Reportes finales y PWA. |



---



\## 12. Próximos Pasos (Inmediatos)



1\.  \*\*Integración Frontend (Prioridad):\*\* Conectar botón "Donar" y formulario "Asignar Sponsor".

2\.  \*\*Validación QR:\*\* Demostrar funcionamiento de QRs (Sprint 3) en la interfaz.

3\.  \*\*Demo:\*\* Grabación de video final.

