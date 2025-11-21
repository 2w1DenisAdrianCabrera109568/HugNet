package com.hugnet.exchange_service.controller;

import com.hugnet.exchange_service.dto.CreateExchangeDTO;
import com.hugnet.exchange_service.dto.ExchangeDTO;
import com.hugnet.exchange_service.entity.ExchangeStatus;
import com.hugnet.exchange_service.service.ExchangeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exchanges")
@RequiredArgsConstructor
public class ExchangeController {

    private final ExchangeService exchangeService;

    @PostMapping("/created")
    // 1. Solo los usuarios con rol PRESTADOR pueden crear intercambios
    @PreAuthorize("hasRole('PRESTADOR')")
    public ResponseEntity<ExchangeDTO> createExchange(
            // 2. Activamos la validación para el DTO
            @Valid @RequestBody CreateExchangeDTO dto,

            // 3. Leemos el ID del usuario desde la cabecera
            // (Esta cabecera la inyecta el Gateway)
            @RequestHeader("X-User-Id") Long userId
    ) {

        ExchangeDTO createdExchange = exchangeService.createExchange(dto, userId);

        // Devolvemos 201 Created (estándar REST para POST)
        return new ResponseEntity<>(createdExchange, HttpStatus.CREATED);
    }

    // --- ¡NUEVO ENDPOINT PARA HU-09! ---
    @PatchMapping("/{id}/solicitar")
    // Cualquier usuario autenticado (USUARIO, PRESTADOR, ADMIN) puede solicitar
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ExchangeDTO> solicitarExchange(
            @PathVariable("id") Long exchangeId,
            @RequestHeader("X-User-Id") Long solicitanteId
    ) {
        ExchangeDTO updatedExchange = exchangeService.solicitarExchange(exchangeId, solicitanteId);
        return ResponseEntity.ok(updatedExchange); // Devolvemos 200 OK
    }

    // --- ¡NUEVO ENDPOINT PARA HU-10! ---
    @GetMapping
    // Solo COORDINADOR y ADMIN pueden ver la lista completa
    @PreAuthorize("hasRole('COORDINADOR') or hasRole('PRESTADOR') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<ExchangeDTO>> getAllExchanges(
            // @RequestParam opcionales para filtrar
            @RequestParam(required = false) Long prestadorId,
            @RequestParam(required = false) ExchangeStatus estado
    ) {
        List<ExchangeDTO> exchanges = exchangeService.getExchanges(prestadorId, estado);
        return ResponseEntity.ok(exchanges);
    }

    // --- ¡NUEVO ENDPOINT PARA HU-11! ---
    @GetMapping("/confirmar/{token}")
    // Cualquier usuario autenticado (el que escanea el QR) puede confirmar
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ExchangeDTO> confirmarEntrega(
            @PathVariable("token") UUID token,
            @RequestHeader("X-User-Id") Long receptorId
    ) {
        ExchangeDTO updatedExchange = exchangeService.confirmarEntrega(token, receptorId);
        // Podríamos devolver solo un "OK", pero devolver el objeto
        // es útil para que el frontend confirme "¡Entregado!"
        return ResponseEntity.ok(updatedExchange);
    }

}