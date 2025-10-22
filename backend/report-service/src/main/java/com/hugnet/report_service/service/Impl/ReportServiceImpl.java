package com.hugnet.report_service.service.Impl;

import com.hugnet.report_service.dto.AttendanceReportDTO;
import com.hugnet.report_service.service.ReportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final WebClient activityServiceWebClient;

    // DTO temporal para la respuesta del webclient
    // (es idéntico al DTO del activity-service)
    @Data
    private static class ActivityAttendanceData {
        private Long activityId;
        private String activityTitle;
        private int totalParticipants;
        private List<Long> participantUserIds;
    }

    @Override
    public AttendanceReportDTO getAttendanceReport(Long activityId, String token) {

        ActivityAttendanceData reportData = activityServiceWebClient
                .get()
                .uri("/{id}/attendance-data", activityId)
                .header("Authorization", token) // Pasar el token de autorización
                .retrieve()
                .bodyToMono(ActivityAttendanceData.class)
                .block();

        // 2. Mapear los datos al DTO de este servicio
        AttendanceReportDTO report = new AttendanceReportDTO();
        report.setActivityId(reportData.getActivityId());
        report.setActivityTitle(reportData.getActivityTitle());
        report.setTotalParticipants(reportData.getTotalParticipants());
        report.setParticipantUserIds(reportData.getParticipantUserIds());

        // Aquí podrías guardar el reporte en tu BBDD si quisieras

        return report;
    }
}