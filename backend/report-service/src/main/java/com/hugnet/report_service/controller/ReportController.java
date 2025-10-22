package com.hugnet.report_service.controller;

import com.hugnet.report_service.dto.AttendanceReportDTO;
import com.hugnet.report_service.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor

public class ReportController {

    private final ReportService reportService;

    @GetMapping("/activity/{activityId}/attendance")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMINISTRADOR')")
    public ResponseEntity<AttendanceReportDTO> getAttendanceReport(
            @PathVariable Long activityId,
            @RequestHeader("Authorization") String authorizationHeader) { // <-- ¡NUEVO!

        // Pasamos el token al servicio
        AttendanceReportDTO report = reportService.getAttendanceReport(activityId, authorizationHeader);
        return ResponseEntity.ok(report);
    }
}