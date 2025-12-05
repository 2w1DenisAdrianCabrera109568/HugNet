package com.hugnet.sponsor_service.controller;



import com.hugnet.sponsor_service.dto.AssignSponsorDTO;
import com.hugnet.sponsor_service.dto.CreateSponsorDTO;
import com.hugnet.sponsor_service.dto.SponsorDTO;
import com.hugnet.sponsor_service.dto.SponsorReportDTO;
import com.hugnet.sponsor_service.service.SponsorService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sponsors")
@RequiredArgsConstructor

public class SponsorController {

    private final SponsorService sponsorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMINISTRADOR')")
    public ResponseEntity<List<SponsorDTO>> getAllSponsors() {
        return ResponseEntity.ok(sponsorService.getAllSponsors());
    }

    // Endpoint para crear un nuevo sponsor
    @PostMapping
    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMINISTRADOR')")
    public ResponseEntity<SponsorDTO> createSponsor(@RequestBody CreateSponsorDTO dto) {
        SponsorDTO newSponsor = sponsorService.createSponsor(dto);
        return new ResponseEntity<>(newSponsor, HttpStatus.CREATED);
    }
   
    // Endpoint para asignar un sponsor a una actividad
    @PostMapping("/{sponsorId}/assign")
    @PreAuthorize("hasRole('COORDINADOR')") // Solo coordinadores organizan eventos
    public ResponseEntity<String> assignSponsor(
            @PathVariable Long sponsorId,
            @RequestBody AssignSponsorDTO dto,
            @RequestHeader("Authorization") String token,
            @RequestHeader("X-User-Id") String userId,   // <--- AGREGAR
            @RequestHeader("X-User-Rol") String userRol  // <--- AGREGAR
    ) {
      sponsorService.assignSponsorToActivity(sponsorId, dto, token, userId, userRol);
        return ResponseEntity.ok("Sponsor asignado correctamente a la actividad.");
    }
    
// --- US29: Reporte de Aportes (Para que el Coordinador vea qué dio cada quien) ---
    @GetMapping("/activity/{activityId}/report")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMINISTRADOR')")
    public ResponseEntity<List<SponsorReportDTO>> getActivitySponsorReport(
            @PathVariable Long activityId) {
        
        List<SponsorReportDTO> reporte = sponsorService.getSponsorReport(activityId);
        return ResponseEntity.ok(reporte);
    }

    // --- US30: Enviar Email de Transparencia (Botón "Notificar" en el Front) ---
    @PostMapping("/activity/{activityId}/notify/{sponsorId}")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMINISTRADOR')")
    public ResponseEntity<String> notifySponsor(
            @PathVariable Long activityId,
            @PathVariable Long sponsorId) {
        
        sponsorService.sendTransparencyEmail(activityId, sponsorId);
        return ResponseEntity.ok("Email de transparencia enviado con éxito.");
    }

}