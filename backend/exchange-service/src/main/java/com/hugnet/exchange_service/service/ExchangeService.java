package com.hugnet.exchange_service.service;

import com.hugnet.exchange_service.dto.CreateExchangeDTO;
import com.hugnet.exchange_service.dto.ExchangeDTO;
import com.hugnet.exchange_service.entity.ExchangeStatus;

import java.util.List;
import java.util.UUID;

public interface ExchangeService {
    /**
     * Crea un nuevo ítem de intercambio.
     * @param dto El DTO con la información del ítem.
     * @param prestadorId El ID del usuario (Rol.PRESTADOR) que crea el ítem.
     * @return El DTO del ítem recién creado.
     */
    ExchangeDTO createExchange(CreateExchangeDTO dto, Long prestadorId);

    
    // --- ¡NUEVO MÉTODO PARA HU-09! ---
    /**
     * Un usuario solicita un ítem de intercambio disponible.
     * Esto lo mueve a estado "RESERVADO" y genera el token de QR.
     * @param exchangeId El ID del ítem a solicitar.
     * @param solicitanteId El ID del usuario que lo está solicitando.
     * @return El DTO del ítem actualizado (ahora en estado RESERVADO).
     */
    ExchangeDTO solicitarExchange(Long exchangeId, Long solicitanteId);

    // --- ¡NUEVO MÉTODO PARA HU-10! ---
    /**
     * Obtiene una lista de todos los ítems de intercambio,
     * con filtros opcionales.
     * @param prestadorId (Opcional) Filtra por el ID del prestador.
     * @param estado (Opcional) Filtra por el estado (DISPONIBLE, RESERVADO, etc.).
     * @return Una lista de ExchangeDTO.
     */
    List<ExchangeDTO> getExchanges(Long prestadorId, ExchangeStatus estado);

    // --- ¡NUEVO MÉTODO PARA HU-11! ---
    /**
     * Confirma la entrega de un ítem de intercambio.
     * Busca por el token (del QR) y cambia el estado a INTERCAMBIADO.
     * @param token El UUID único generado durante la solicitud.
     * @param receptorId El ID del usuario que escanea el QR.
     * @return El DTO del ítem actualizado (ahora en estado INTERCAMBIADO).
     */
    ExchangeDTO confirmarEntrega(UUID token, Long receptorId);

}