\# HugNet — Documento Maestro Final (v5.1 - Proyecto Terminado)



\## 1. Descripción y Objetivo

HugNet es una plataforma digital basada en microservicios para la gestión integral de actividades solidarias. Conecta a voluntarios, coordinadores, sponsors y gestores de donaciones en un ecosistema colaborativo, permitiendo administrar usuarios, eventos, financiamiento y reportes con transparencia y seguridad.



---



\## 2. Alcance Funcional Completo

La plataforma cubre los siguientes módulos operativos:

\* \*\*Gestión de Identidad:\*\* Registro, Login, Roles, Perfil y Gestión de Usuarios.

\* \*\*Gestión de Eventos:\*\* Creación, validación, inscripción y control de asistencia.

\* \*\*Gestión de Recursos:\*\* Donaciones monetarias (MercadoPago), donaciones en especie y trueques (Intercambios).

\* \*\*Gestión de Patrocinio:\*\* Registro de sponsors, asignación a eventos y reportes de transparencia.

\* \*\*Inteligencia de Negocio:\*\* Reportes agregados, rankings, balances y exportación a PDF.

\* \*\*Accesibilidad:\*\* Aplicación Web Progresiva (PWA) instalable.



---



\## 3. Arquitectura Técnica

El sistema implementa una arquitectura de \*\*Microservicios Puros\*\* orquestada con Docker Compose.



\### 3.1. Stack Tecnológico

\* \*\*Backend:\*\* Java 17, Spring Boot 3.

\* \*\*Frontend:\*\* HTML5, CSS3 (Bootstrap 5), JavaScript Vanilla (ES6+).

\* \*\*Base de Datos:\*\* \*\*PostgreSQL\*\* (Producción/Docker). Cada microservicio posee su propio contenedor de base de datos aislado.

\* \*\*Seguridad:\*\* JWT (Json Web Tokens) con patrón \*\*Gateway Offloading\*\*.

\* \*\*Comunicación:\*\*

&nbsp;   \* \*\*Externa:\*\* REST API.

&nbsp;   \* \*\*Interna:\*\* `WebClient` (Reactiva/Asíncrona) con propagación de headers de seguridad (`X-User-Id`, `X-User-Rol`).

\* \*\*Integraciones:\*\* MercadoPago SDK, Mailtrap (SMTP), HTML2PDF, ZXing (QRs).



\### 3.2. Mapa de Microservicios

| Servicio | Puerto | Responsabilidad |

| :--- | :--- | :--- |

| \*\*gateway\*\* | `8080` | Punto de entrada, Validación JWT, CORS, Enrutamiento. |

| \*\*user-service\*\* | `8081` | Usuarios, Roles, Auth y Emails. |

| \*\*activity-service\*\* | `8082` | Actividades, Inscripciones, Asistencia. |

| \*\*sponsor-service\*\* | `8083` | Sponsors, Asignaciones (llama a Activity). |

| \*\*donation-service\*\* | `8084` | Donaciones, MercadoPago, Webhooks. |

| \*\*report-service\*\* | `8085` | Agregador de datos (Ranking, Balance, Listas). |

| \*\*exchange-service\*\* | `8086` | Intercambios (Trueques) y QRs de entrega. |



---



\## 4. Estado de Historias de Usuario (Checklist Final)



Todas las historias de usuario planificadas han sido implementadas y validadas técnicamente.



\### ✅ Sprint 1: Fundamentos

\* ✅ \*\*US01:\*\* Registro de usuario.

\* ✅ \*\*US02:\*\* Inicio de sesión (JWT).

\* ✅ \*\*US03:\*\* Asignación de roles (Sistema base).

\* ✅ \*\*US04:\*\* Crear actividades solidarias.

\* ✅ \*\*US05:\*\* Inscripción en actividades.

\* ✅ \*\*US06:\*\* Ver inscriptos (Coordinador).

\* ✅ \*\*US07:\*\* Consultar "Mis Inscripciones".



\### ✅ Sprint 2: Administración y Control

\* ✅ \*\*US16:\*\* Gestión de roles (Admin promueve a Coordinador).

\* ✅ \*\*US17:\*\* Validar/Aprobar actividades (Admin).

\* ✅ \*\*US19:\*\* Reporte de asistencia (Lógica de backend).

\* ✅ \*\*US21:\*\* Ver stock de donaciones (Gestor).

\* ✅ \*\*US24:\*\* Email de bienvenida/confirmación (Infraestructura Mailtrap lista).

\* ✅ \*\*US27:\*\* Registro de Sponsors.



\### ✅ Sprint 3: Economía Circular (Intercambios)

\* ✅ \*\*US08:\*\* Publicar bien/servicio (Prestador).

\* ✅ \*\*US09:\*\* Solicitar bien (Reserva).

\* ✅ \*\*US10:\*\* Control de stock de intercambio.

\* ✅ \*\*US11:\*\* Confirmar entrega mediante QR (Lógica Token/Estado).

\* ✅ \*\*US12:\*\* Donación en especie (Materiales).

\* ✅ \*\*US13:\*\* Aprobar stock de donaciones.



\### ✅ Sprint 4: Financiamiento

\* ✅ \*\*US14:\*\* Donación monetaria (Integración MercadoPago).

\* ✅ \*\*US15:\*\* Validar donaciones monetarias (Webhooks).

\* ✅ \*\*US20:\*\* Reporte de participación por tipo.

\* ✅ \*\*US28:\*\* Asignar Sponsor a Evento (Lógica N:M).



\### ✅ Sprint 5: Cierre, Reportes y UX

\* ✅ \*\*US18:\*\* Reporte de Balance Financiero/Stock Unificado.

\* ✅ \*\*US22:\*\* Exportar reportes a PDF.

\* ✅ \*\*US23:\*\* Ranking de usuarios más activos.

\* ✅ \*\*US25:\*\* QR de acceso rápido a eventos.

\* ✅ \*\*US26:\*\* Instalación como PWA.

\* ✅ \*\*US29:\*\* Reporte de aportes de Sponsors.

\* ✅ \*\*US30:\*\* Notificación de transparencia a Sponsors (Email).



---



\## 5. Análisis de Deuda Técnica y Mejoras Futuras



El sistema es completamente funcional y cumple con los requisitos del TFI. A continuación se detallan puntos de mejora para una eventual fase de mantenimiento o puesta en producción a gran escala:



1\.  \*\*Resiliencia (Circuit Breakers):\*\*

&nbsp;   \* Actualmente manejamos errores de conexión con `try/catch` y `onStatus` en WebClient.

&nbsp;   \* \*Mejora:\* Implementar \*\*Resilience4j\*\* para manejar Circuit Breakers y Retries automáticos si un microservicio cae.



2\.  \*\*Tests Automatizados:\*\*

&nbsp;   \* El código tiene estructura para JUnit, pero la cobertura de pruebas unitarias y de integración se puede ampliar para cubrir casos de borde (edge cases).



3\.  \*\*Google Maps API:\*\*

&nbsp;   \* Mencionada en el documento V1 para geolocalización de eventos. Podría implementarse en el futuro para mostrar mapas en el detalle de la actividad.



4\.  \*\*Validación de Frontend Robusta:\*\*

&nbsp;   \* Reforzar las validaciones en los formularios modales (fechas, montos, tipos de archivo) antes de enviar la petición al servidor para reducir carga innecesaria.



---



\## 6. Conclusión

El proyecto \*\*HugNet\*\* ha alcanzado el estado de \*\*"Code Complete"\*\*. Cumple con la arquitectura de microservicios distribuida, implementa patrones de seguridad modernos (Gateway Offloading), integra servicios externos reales (MercadoPago, Mailtrap), utiliza bases de datos PostgreSQL en contenedores y ofrece una experiencia de usuario progresiva (PWA).

