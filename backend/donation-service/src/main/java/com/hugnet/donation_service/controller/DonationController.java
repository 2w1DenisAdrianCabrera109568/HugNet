package com.hugnet.donation_service.controller;

import com.hugnet.donation_service.dto.CreateDonationDTO;
import com.hugnet.donation_service.dto.DonationDTO;
import com.hugnet.donation_service.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor

public class DonationController {

    private final DonationService donationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DONATION_MANAGER', 'ADMINISTRADOR')")
    public ResponseEntity<List<DonationDTO>> getStock() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }

    // --- HU-12: Un usuario ofrece una nueva donación en especie (BIEN o SERVICIO) ---
    @PostMapping
    // 1. Cualquier usuario autenticado puede ofrecer una donación
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DonationDTO> createDonation(
            // 2. Activamos la validación para el DTO
            @Valid @RequestBody CreateDonationDTO dto,

            // 3. Leemos el ID del donante desde la cabecera (inyectada por el Gateway)
            @RequestHeader("X-User-Id") Long donanteId
    ) {
        DonationDTO createdDonation = donationService.createDonation(dto, donanteId);

        // Devolvemos 201 Created
        return new ResponseEntity<>(createdDonation, HttpStatus.CREATED);
    }

    // --- ¡NUEVOS ENDPOINTS PARA HU-13! ---

    /**
     * Endpoint para que el Gestor vea las donaciones pendientes.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('DONATION_MANAGER')")
    public ResponseEntity<List<DonationDTO>> getPendingDonations() {
        List<DonationDTO> pending = donationService.getPendingDonations();
        return ResponseEntity.ok(pending);
    }

    /**
     * Endpoint para que el Gestor APRUEBE una donación.
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('DONATION_MANAGER')")
    public ResponseEntity<DonationDTO> approveDonation(
            @PathVariable("id") Long donationId,
            @RequestHeader("X-User-Id") Long gestorId
    ) {
        DonationDTO approvedDonation = donationService.approveDonation(donationId, gestorId);
        return ResponseEntity.ok(approvedDonation);
    }

    /**
     * Endpoint para que el Gestor RECHACE una donación.
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('DONATION_MANAGER')")
    public ResponseEntity<DonationDTO> rejectDonation(
            @PathVariable("id") Long donationId,
            @RequestHeader("X-User-Id") Long gestorId
    ) {
        DonationDTO rejectedDonation = donationService.rejectDonation(donationId, gestorId);
        return ResponseEntity.ok(rejectedDonation);
    }

    /**
     * HU-14 (Parte 2): Webhook para recibir notificaciones de MercadoPago.
     * MercadoPago llama a este endpoint cuando el estado del pago cambia.
     * IMPORTANTE: Este endpoint debe ser público (configurar en SecurityConfig o Gateway).
     */
    @PostMapping("/webhook/mp")
    public ResponseEntity<String> receiveWebhook(
            @RequestParam(value = "topic", required = false) String topic, // payment
            @RequestParam(value = "type", required = false) String type,   // alternative to topic
            @RequestParam(value = "data.id", required = false) String dataId, // ID del pago
            @RequestParam(value = "id", required = false) String id // A veces viene como id directo
    ) {
        // Normalización: MP a veces manda 'topic' y a veces 'type'
        String eventType = (topic != null) ? topic : type;
        // Normalización: MP a veces manda 'id' y a veces 'data.id'
        String eventIdStr = (id != null) ? id : dataId;

        if (eventType == null || eventIdStr == null) {
            // Respondemos OK para que MP no se queje, pero no hacemos nada
            return ResponseEntity.ok("Ignored: Missing data");
        }

        try {
            Long eventId = Long.parseLong(eventIdStr);
            donationService.processPaymentNotification(eventType, eventId);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid ID format");
        }

        // SIEMPRE responder 200 OK a MercadoPago, o reintentará enviarlo miles de veces.
        return ResponseEntity.ok("Webhook received");
    }

}