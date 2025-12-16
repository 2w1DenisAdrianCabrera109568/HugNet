package com.hugnet.report_service.controller;

import com.hugnet.report_service.dto.AttendanceReportDTO;
import com.hugnet.report_service.dto.BalanceReportDTO;
import com.hugnet.report_service.dto.ParticipantDetailDTO;
import com.hugnet.report_service.dto.ReporteParticipacionDTO;
import com.hugnet.report_service.dto.StockItemDTO;
import com.hugnet.report_service.dto.UserRankingDTO;
import com.hugnet.report_service.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
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
            @RequestHeader("Authorization") String token,
            @RequestHeader("X-User-Id") String userId,   // <--- NUEVO
            @RequestHeader("X-User-Rol") String userRol  // <--- NUEVO
    ) {
        return ResponseEntity.ok(reportService.getParticipationType(token, userId, userRol));
    }

    //Endpoint para Reporte Financiero (Balance)
     @GetMapping("/financial-balance")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<BalanceReportDTO>> getBalanceReport(
            @RequestHeader("Authorization") String token,
            @RequestHeader("X-User-Id") String userId,   // <--- NUEVO
            @RequestHeader("X-User-Rol") String userRol  // <--- NUEVO
    ) {
        return ResponseEntity.ok(reportService.getBalanceReport(token, userId, userRol));
    }
     
    // Endpoint para Detalle de Balance de una Actividad
@GetMapping("/balance-detail/{activityId}")
    public ResponseEntity<?> getBalanceDetail(
            @PathVariable Long activityId,
            @RequestHeader(value = "Authorization", required = false) String token, // required=false para probar si llega
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Rol", required = false) String userRol
    ) {
        log.info(">>> RECIBIDA PETICIÓN DETALLE para Actividad ID: {}", activityId);
        log.info(">>> HEADERS: Auth present? {}, UserID: {}, Role: {}", (token != null), userId, userRol);

        try {
            // Llamamos al servicio
            BalanceReportDTO reporte = reportService.getBalanceDetail(activityId, token, userId, userRol);
            return ResponseEntity.ok(reporte);

        } catch (Exception e) {
            // ESTO ES LO QUE NECESITAMOS VER
            log.error(">>> ERROR FATAL EN CONTROLADOR DETALLE:", e);
            e.printStackTrace(); 
            
            // Devolvemos el error al Postman/Navegador para verlo ahí también
            return ResponseEntity.status(500).body("ERROR INTERNO: " + e.getMessage() + " | Clase: " + e.getClass().getName());
        }
    }
    
    
    // Endpoint para Reporte de Stock (Donaciones + Intercambios)
    @GetMapping("/stock")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DONATION_MANAGER')")
    /* public ResponseEntity<List<StockItemDTO>> getStockReport(
            @RequestHeader("Authorization") String token) */ 
    public ResponseEntity<List<StockItemDTO>> getStockReport(
    @RequestHeader("Authorization") String token,
    @RequestHeader("X-User-Id") String userId,  // <--- NUEVO
    @RequestHeader("X-User-Rol") String userRol // <--- NUEVO
    ){
        
        return ResponseEntity.ok(reportService.getStockReport(token, userId, userRol));
    }
    
    // Endpoint para Ranking de Usuarios
    @GetMapping("/user-ranking")
    // Agregamos userId y userRol a la firma del método
    public ResponseEntity<List<UserRankingDTO>> getUserRanking(
            @RequestHeader("Authorization") String token,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Rol") String userRol
    ) {
        // Se las pasamos al servicio
        return ResponseEntity.ok(reportService.getUserRanking(token, userId, userRol));
    }

    // Endpoint para Lista de Participantes de una Actividad
    @GetMapping("/activity/{activityId}/participants-list")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMINISTRADOR')")
    public ResponseEntity<List<ParticipantDetailDTO>> getParticipantsList(
            @PathVariable Long activityId,
            @RequestHeader("Authorization") String token,
            @RequestHeader("X-User-Id") String userId,   // <--- AGREGAR
            @RequestHeader("X-User-Rol") String userRol  // <--- AGREGAR
    ) {
        
        return ResponseEntity.ok(reportService.getParticipantsList(activityId, token, userId, userRol));
    }

}