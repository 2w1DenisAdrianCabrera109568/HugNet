package com.hugnet.report_service.controller;

import com.hugnet.report_service.dto.AttendanceReportDTO;
import com.hugnet.report_service.dto.ReporteParticipacionDTO;
import com.hugnet.report_service.service.ReportService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor

public class ReportController {

    private final ReportService reportService;

    // Endpoint para obtener el reporte de asistencia a una actividad
    @GetMapping("/activity/{activityId}/attendance")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMINISTRADOR')")
    public ResponseEntity<AttendanceReportDTO> getAttendanceReport(
            @PathVariable Long activityId,
            @RequestHeader("Authorization") String authorizationHeader) { // <-- ¡NUEVO!

        // Pasamos el token al servicio
        AttendanceReportDTO report = reportService.getAttendanceReport(activityId, authorizationHeader);
        return ResponseEntity.ok(report);
    }
    // Endpoint para obtener el reporte de participación por tipo de actividad
    @GetMapping("/participation-by-type")
    @PreAuthorize("hasRole('ADMINISTRADOR')") // Solo admins ven estadísticas globales
    public ResponseEntity<List<ReporteParticipacionDTO>> getParticipationByType(
            @RequestHeader("Authorization") String token
    ) {
        return ResponseEntity.ok(reportService.getParticipationReport(token));
    }
}