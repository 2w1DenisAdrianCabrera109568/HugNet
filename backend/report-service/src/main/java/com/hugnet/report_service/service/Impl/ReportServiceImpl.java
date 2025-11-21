package com.hugnet.report_service.service.Impl;

import com.hugnet.report_service.dto.ActivitySummaryDTO;
import com.hugnet.report_service.dto.AttendanceReportDTO;
import com.hugnet.report_service.dto.ReporteParticipacionDTO;
import com.hugnet.report_service.service.ReportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final WebClient.Builder webClientBuilder;

    // DTO temporal interno para la respuesta del webclient (asistencia)
    @Data
    private static class ActivityAttendanceData {
        private Long activityId;
        private String activityTitle;
        private int totalParticipants;
        private List<Long> participantUserIds;
    }

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

    // --- HU-20: Reporte de participación por tipo de actividad ---
    @Override
    public List<ReporteParticipacionDTO> getParticipationReport(String token) {
        log.info("Iniciando generación de reporte de participación por tipo...");

        ActivitySummaryDTO[] activitiesArray;
        try {
            // CORRECCIÓN: Puerto 8082 explícito
            activitiesArray = webClientBuilder.build()
                    .get()
                    .uri("http://activity-service:8082/api/activities")
                    .header("Authorization", token)
                    .retrieve()
                    .bodyToMono(ActivitySummaryDTO[].class)
                    .block();
        } catch (Exception e) {
            log.error("Error obteniendo lista de actividades", e);
            return Collections.emptyList();
        }

        if (activitiesArray == null || activitiesArray.length == 0) {
            return Collections.emptyList();
        }

        List<ActivitySummaryDTO> activities = Arrays.asList(activitiesArray);

        // Lógica de Agregación
        Map<String, Long> conteoPorTipo = activities.stream()
                .filter(a -> a.getTipoActividad() != null)
                .collect(Collectors.groupingBy(
                        ActivitySummaryDTO::getTipoActividad,
                        Collectors.counting()
                ));

        // Mapear al DTO de respuesta
        return conteoPorTipo.entrySet().stream()
                .map(entry -> new ReporteParticipacionDTO(
                        entry.getKey(),
                        entry.getValue(),
                        0L // Total participantes 0 por ahora
                ))
                .collect(Collectors.toList());
    }
}