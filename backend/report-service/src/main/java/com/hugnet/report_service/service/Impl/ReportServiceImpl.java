package com.hugnet.report_service.service.Impl;

import com.hugnet.report_service.dto.ActivitySummaryDTO;
import com.hugnet.report_service.dto.AttendanceReportDTO;
import com.hugnet.report_service.dto.BalanceReportDTO;
import com.hugnet.report_service.dto.DonationData;
import com.hugnet.report_service.dto.ExchangeData;
import com.hugnet.report_service.dto.ActivityAttendanceData;
import com.hugnet.report_service.dto.ParticipantDetailDTO;
import com.hugnet.report_service.dto.ReporteParticipacionDTO;
import com.hugnet.report_service.dto.StockItemDTO;
import com.hugnet.report_service.dto.UserData;
import com.hugnet.report_service.dto.UserRankingDTO;
import com.hugnet.report_service.service.ReportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final WebClient.Builder webClientBuilder;


    // --- HU-19: Reporte de asistencia por actividad ---
    @Override
    public AttendanceReportDTO getAttendanceReport(Long activityId, String token) {
        
        try {
            // CORRECCIÓN: Puerto 8082 explícito
            ActivityAttendanceData reportData = webClientBuilder.build()
                    .get()
                    .uri("http://activity-service:8082/api/activities/{id}/attendance-data", activityId)
                    .header("Authorization", token)
                    .retrieve()
                    .bodyToMono(ActivityAttendanceData.class)
                    .block();

            if (reportData == null) {
                throw new RuntimeException("No se recibieron datos de asistencia.");
            }

            // Mapear los datos al DTO de salida
            AttendanceReportDTO report = new AttendanceReportDTO();
            report.setActivityId(reportData.getActivityId());
            report.setActivityTitle(reportData.getActivityTitle());
            report.setTotalParticipants(reportData.getTotalParticipants());
            report.setParticipantUserIds(reportData.getParticipantUserIds());

            return report;

        } catch (Exception e) {
            log.error("Error al obtener reporte de asistencia para actividad {}", activityId, e);
            throw new RuntimeException("Error de comunicación con activity-service");
        }
    }

    // --- Listado de participantes con detalles ---
    @Override
    public List<ParticipantDetailDTO> getParticipantsList(Long activityId, String token, String userId, String userRol) {
        // 1. Obtener la lista de IDs desde activity-service (Usando el endpoint que tú me pasaste)
        Long[] participantIds;
        try {
            participantIds = webClientBuilder.build()
                    .get()
                    .uri("http://activity-service:8082/api/activities/{id}/participants", activityId)
                    .header("Authorization", token)
                    .header("X-User-Id", userId)     // <--- CRÍTICO PARA EVITAR 403
                    .header("X-User-Rol", userRol)
                    .retrieve()
                    .bodyToMono(Long[].class)
                    .block();
        } catch (Exception e) {
            log.error("Error obteniendo IDs de participantes", e);
            return Collections.emptyList();
        }

        if (participantIds == null || participantIds.length == 0) {
            return Collections.emptyList();
        }

        // 2. Iterar los IDs y buscar los nombres en user-service
        List<ParticipantDetailDTO> detalles = new ArrayList<>();

        for (Long participantId : participantIds) {
            try {
                UserData user = webClientBuilder.build()
                        .get()
                        .uri("http://user-service:8081/api/users/{id}", participantId) // Asumimos que existe este endpoint
                        .header("Authorization", token)
                        .header("X-User-Id", userId)     // <--- CRÍTICO PARA EVITAR 403
                        .header("X-User-Rol", userRol)
                        .retrieve()
                        .bodyToMono(UserData.class)
                        .block();

                if (user != null) {
                    detalles.add(new ParticipantDetailDTO(
                            user.getId(),
                            user.getNombre(),
                            user.getApellido(),
                            user.getEmail()
                    ));
                }
            } catch (Exception e) {
                // Si falla un usuario puntual, lo agregamos como desconocido o lo omitimos
                log.warn("No se pudo obtener datos para userId: " + participantId);
                detalles.add(new ParticipantDetailDTO(participantId, "Desconocido", "", ""));
            }
        }

        return detalles;
    }

    // --- HU-20: Reporte de participación por tipo de actividad ---
    @Override
    public List<ReporteParticipacionDTO> getParticipationType(String token, String userId, String userRol) {
        log.info("Iniciando obtención de estadísticas pre-calculadas desde Activity-Service...");

        // Usamos una clase auxiliar interna o un DTO existente para recibir la respuesta.
        // Dado que ActivityService devuelve una lista de objetos con {tipo, totalEventos, totalParticipantes},
        // podemos mapearlo directamente a ReporteParticipacionDTO si los nombres de campos coinciden en el JSON.
        
        ReporteParticipacionDTO[] statsArray;

        try {
            statsArray = webClientBuilder.build()
                    .get()
                    // OJO: Llamamos al NUEVO endpoint
                    .uri("http://activity-service:8082/api/activities/stats/participation")
                    .header("Authorization", token)
                    .header("X-User-Id", userId)
                    .header("X-User-Rol", userRol)
                    .retrieve()
                    .bodyToMono(ReporteParticipacionDTO[].class)
                    .block();
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas de actividades", e);
            return Collections.emptyList();
        }

        if (statsArray == null || statsArray.length == 0) {
            return Collections.emptyList();
        }

        return Arrays.asList(statsArray);
    }
    
    // --- HU-21/22: Reporte de Balance Financiero por Evento ---
@Override
    public List<BalanceReportDTO> getBalanceReport(String token, String userId, String userRol) {
        log.info("Generando reporte de balance financiero...");

        // CHEQUEO DE SEGURIDAD 1: WebClient
        if (webClientBuilder == null) {
            log.error("FATAL: webClientBuilder es NULL. Verifica la inyección de dependencias.");
            throw new RuntimeException("Error interno: Cliente web no inicializado.");
        }

        // 1. Obtener Actividades
        ActivitySummaryDTO[] activitiesArray;
        try {
            activitiesArray = webClientBuilder.build()
                    .get()
                    .uri("http://activity-service:8082/api/activities")
                    .header("Authorization", token)
                    .header("X-User-Id", userId)
                    .header("X-User-Rol", userRol)
                    .retrieve()
                    .bodyToMono(ActivitySummaryDTO[].class)
                    .block();
        } catch (Exception e) {
            log.error("Error al obtener actividades.", e);
            return Collections.emptyList();
        }

        List<ActivitySummaryDTO> activities = (activitiesArray != null) 
                                              ? Arrays.asList(activitiesArray) 
                                              : Collections.emptyList();

        // 2. Obtener Donaciones
        DonationData[] donationsArray;
        try {
            donationsArray = webClientBuilder.build()
                    .get()
                    .uri("http://donation-service:8084/api/donations")
                    .header("Authorization", token)
                    .header("X-User-Id", userId)
                    .header("X-User-Rol", userRol)
                    .retrieve()
                    .bodyToMono(DonationData[].class)
                    .block();
        } catch (Exception e) {
            // Logueamos pero NO detenemos el reporte, asumimos 0 donaciones.
            log.warn("No se pudieron obtener donaciones (o lista vacía). Causa: " + e.getMessage());
            donationsArray = new DonationData[0];
        }

        List<DonationData> donations = (donationsArray != null) 
                                       ? Arrays.asList(donationsArray) 
                                       : Collections.emptyList();

         // --- INICIO BLOQUE DEBUG ---
        log.info(">>> DIAGNÓSTICO DE DONACIONES <<<");
        log.info("Total donaciones recibidas del servicio: {}", donations.size());
        for (DonationData d : donations) {
            log.info("ID: {}, Monto: {}, Estado: '{}', ActivityId: {}", 
                     d.getId(), d.getMonto(), d.getEstado(), d.getActivityId());
        }
        // --- FIN BLOQUE DEBUG ---                              

        // 3. Cálculo
        Map<Long, List<DonationData>> donacionesPorActividad = donations.stream()
                .filter(d -> d != null && 
                             d.getEstado() != null && 
                             "APROBADA".equalsIgnoreCase(d.getEstado()) && // "APROBADA" (femenino)
                             d.getActivityId() != null)
                .collect(Collectors.groupingBy(DonationData::getActivityId));

        // LOG DEBUG: Ver qué claves quedaron en el mapa
        log.info(">>> CLAVES EN EL MAPA (IDs de Actividades con dinero): {}", donacionesPorActividad.keySet());

        List<BalanceReportDTO> balanceReport = new ArrayList<>();

        log.info(">>> INICIANDO CRUCE CON ACTIVIDADES (Total: {}) <<<", activities.size());

        for (ActivitySummaryDTO activity : activities) {
            if (activity == null) continue;

// TRAMPA DE DEBUG: Si es la actividad 2, gritar en el log
            if (activity.getActivityId() != null && activity.getActivityId() == 2L) {
                 log.info("!!! ENCONTRADA ACTIVIDAD 2 !!! Buscando sus donaciones...");
            }

            // Buscamos las donaciones para esta actividad
            List<DonationData> aportes = donacionesPorActividad.getOrDefault(activity.getActivityId(), Collections.emptyList());

            if (activity.getActivityId() == 2L) {
                 log.info("!!! ACTIVIDAD 2 - Cantidad de aportes encontrados: {}", aportes.size());
            }

            Double totalIngresos = aportes.stream()
                    .mapToDouble(d -> (d.getMonto() != null) ? d.getMonto() : 0.0)
                    .sum();

            BalanceReportDTO dto = new BalanceReportDTO();
            dto.setActivityId(activity.getActivityId());
            dto.setActivityTitle(activity.getTitulo());
            dto.setTotalIngresos(totalIngresos);
            dto.setTotalEgresos(0.0);
            dto.setBalanceNeto(totalIngresos);
            dto.setCantidadDonaciones(aportes.size());

            balanceReport.add(dto);
        }

        return balanceReport;
    }

    // --- HU-23: Reporte de Stock Unificado (Donaciones + Intercambios) ---
    @Override
    /* public List<StockItemDTO> getStockReport(String token) */ 
    public List<StockItemDTO> getStockReport(String token, String userId, String userRol){
        log.info("Generando reporte de stock unificado...");
        List<StockItemDTO> stockUnificado = new ArrayList<>();

        // 1. Obtener Donaciones en Especie (donation-service:8084)
        try {
            DonationData[] donationsArray = webClientBuilder.build()
                    .get()
                    .uri("http://donation-service:8084/api/donations")
                    .header("Authorization", token)
                    .header("X-User-Id", userId)   // <--- AGREGAR POR PREVENCIÓN
                    .header("X-User-Rol", userRol)
                    .retrieve()
                    .bodyToMono(DonationData[].class)
                    .block();

            if (donationsArray != null) {
                // Filtramos y mapeamos a StockItemDTO
                List<StockItemDTO> donacionesStock = Arrays.stream(donationsArray)
                        // Solo nos interesan las donaciones MATERIALES que ya fueron APROBADAS
                        .filter(d -> "ESPECIE".equalsIgnoreCase(d.getTipoDonacion()) 
                                  && "APROBADO".equalsIgnoreCase(d.getEstado())) 
                        .map(d -> new StockItemDTO(
                                d.getTipoDonacion() + " - ID: " + d.getId(), // Descripción genérica si no tiene título
                                "DONACION",
                                d.getEstado(),
                                "N/A", // Fecha, si el DTO de donación no la trae
                                "VARIOS"
                        ))
                        .collect(Collectors.toList());
                
                stockUnificado.addAll(donacionesStock);
            }
        } catch (Exception e) {
            log.error("Error al obtener stock de donaciones", e);
            // No lanzamos error para permitir que se cargue al menos la otra parte del reporte
        }

        // 2. Obtener Ítems de Intercambio (exchange-service:8086)
        try {
            ExchangeData[] exchangesArray = webClientBuilder.build()
                    .get()
                    // NOTA: Asumo que este endpoint existe en tu exchange-service (Sprint 3)
                    .uri("http://exchange-service:8086/api/exchanges") 
                    .header("Authorization", token)
                    .header("X-User-Id", userId)   // <--- AGREGAR POR PREVENCIÓN
                    .header("X-User-Rol", userRol)
                    .retrieve()
                    .bodyToMono(ExchangeData[].class)
                    .block();

            if (exchangesArray != null) {
                List<StockItemDTO> intercambiosStock = Arrays.stream(exchangesArray)
                        .map(e -> new StockItemDTO(
                                e.getTitulo(),
                                "INTERCAMBIO",
                                e.getEstado(),
                                e.getFechaPublicacion(),
                                e.getItemType()
                        ))
                        .collect(Collectors.toList());

                stockUnificado.addAll(intercambiosStock);
            }
        } catch (Exception e) {
            log.error("Error al obtener stock de intercambios (Revisar puerto 8086)", e);
        }

        return stockUnificado;
    }

    // --- HU-29: Ranking de Usuarios más activos ---
    @Override
    /* public List<UserRankingDTO> getUserRanking(String token) */ 
     public List<UserRankingDTO> getUserRanking(String token, String userId, String userRol){
        log.info("Generando ranking de usuarios...");

        // 1. Obtener todas las actividades
        ActivitySummaryDTO[] activitiesArray;
        try {
            activitiesArray = webClientBuilder.build()
                    .get()
                    .uri("http://activity-service:8082/api/activities")
                    .header("Authorization", token)
                    .header("X-User-Id", userId)    
                    .header("X-User-Rol", userRol)
                    .retrieve()
                    .bodyToMono(ActivitySummaryDTO[].class)
                    .block();
        } catch (Exception e) {
            log.error("Error al obtener actividades para ranking", e);
            return Collections.emptyList();
        }

        if (activitiesArray == null) return Collections.emptyList();

        // 2. Contar participaciones (Iteramos para obtener los IDs de participantes)
        // Nota: Esto hace varias llamadas HTTP. En un entorno real se usaría una base de datos de analítica,
        // pero para microservicios académicos, esto demuestra orquestación.
        Map<Long, Long> contadorParticipaciones = new HashMap<>();

        for (ActivitySummaryDTO activity : activitiesArray) {
            try {
                // Reutilizamos la lógica de llamada de asistencia que ya tenías
                // o llamamos directamente al endpoint si es público/accesible
                ActivityAttendanceData attendance = webClientBuilder.build()
                        .get()
                        .uri("http://activity-service:8082/api/activities/{id}/attendance-data", activity.getActivityId())
                        .header("Authorization", token)
                        .header("X-User-Id", userId)    
                        .header("X-User-Rol", userRol)
                        .retrieve()
                        .bodyToMono(ActivityAttendanceData.class)
                        .block();

                if (attendance != null && attendance.getParticipantUserIds() != null) {
                    for (Long participantId : attendance.getParticipantUserIds()) {
                        contadorParticipaciones.put(participantId, contadorParticipaciones.getOrDefault(participantId, 0L) + 1);
                    }
                }
            } catch (Exception e) {
                log.warn("No se pudo obtener asistencia para actividad ID: " + activity.getActivityId());
            }
        }

        // 3. Ordenar y tomar el Top 10 (Java Streams)
        List<Map.Entry<Long, Long>> topUsers = contadorParticipaciones.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed()) // Mayor a menor
                .limit(10) // Solo los 10 mejores
                .collect(Collectors.toList());
        

        // 4. Enriquecer con Nombres (Llamada a user-service)
        List<UserRankingDTO> rankingFinal = new ArrayList<>();
        int posicion = 1;

        for (Map.Entry<Long, Long> entry : topUsers) {
            Long targetUserId = entry.getKey(); // El ID del usuario que queremos consultar
            Long total = entry.getValue();

            String nombreCompleto = "Usuario Desconocido";
            String email = "N/A";

            try {
                UserData userData = webClientBuilder.build()
                        .get()
                        .uri("http://user-service:8081/api/users/{id}", targetUserId)                        
                        .header("Authorization", token) 
                        .header("X-User-Id", userId)     // <--- CRÍTICO
                        .header("X-User-Rol", userRol)   // <--- CRÍTICO
                        // ------------------------
                        
                        .retrieve()
                        .bodyToMono(UserData.class)
                        .block();

                if (userData != null) {
                    // Usamos los Getters seguros (recuerda que UserData ahora es public static)
                    nombreCompleto = userData.getNombre() + " " + userData.getApellido();
                    email = userData.getEmail();
                }
            } catch (Exception e) {
                // Ahora sí deberíamos ver éxito, pero mantenemos el log por seguridad
                log.error("FALLO al obtener usuario ID " + targetUserId + ". Causa: " + e.getMessage());
            }

            rankingFinal.add(new UserRankingDTO(targetUserId, nombreCompleto, email, total, posicion++));
        }

        return rankingFinal;
    }
}