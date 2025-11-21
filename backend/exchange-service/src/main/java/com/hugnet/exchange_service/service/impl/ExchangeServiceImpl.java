package com.hugnet.exchange_service.service.impl;

import com.hugnet.exchange_service.dto.CreateExchangeDTO;
import com.hugnet.exchange_service.dto.ExchangeDTO;
import com.hugnet.exchange_service.dto.common.ExchangeMapper;
import com.hugnet.exchange_service.entity.Exchange;
import com.hugnet.exchange_service.entity.ExchangeStatus;
import com.hugnet.exchange_service.exceptions.ResourceNotFoundException;
import com.hugnet.exchange_service.repository.ExchangeRepository;
import com.hugnet.exchange_service.service.ExchangeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExchangeServiceImpl implements ExchangeService {

    private final ExchangeRepository exchangeRepository;
    private final ExchangeMapper exchangeMapper;

    // --- IMPLEMENTACIÓN DE HU-08 ---
    @Override
    public ExchangeDTO createExchange(CreateExchangeDTO dto, Long prestadorId) {

        // 1. Convertimos el DTO a Entidad
        Exchange newExchange = exchangeMapper.toEntity(dto);

        // 2. Añadimos la lógica de negocio (quién lo publica)
        newExchange.setPrestadorId(prestadorId);

        // 3. Guardamos en la BD
        // (El @PrePersist en la entidad asignará el estado DISPONIBLE
        // y la fecha de publicación automáticamente)
        Exchange savedExchange = exchangeRepository.save(newExchange);

        // 4. Devolvemos el DTO completo
        return exchangeMapper.toDTO(savedExchange);
    }

    // --- MÉTODO "solicitar" (HU-09) MODIFICADO ---
    @Override
    public ExchangeDTO solicitarExchange(Long exchangeId, Long solicitanteId) {

        Exchange exchange = exchangeRepository.findById(exchangeId)
                .orElseThrow(() -> new ResourceNotFoundException("Intercambio no encontrado con ID: " + exchangeId));

        if (exchange.getPrestadorId().equals(solicitanteId)) {
            throw new IllegalArgumentException("No puedes solicitar tu propio ítem.");
        }

        if (exchange.getEstado() != ExchangeStatus.DISPONIBLE) {
            throw new IllegalArgumentException("El ítem ya no está disponible.");
        }

        // --- ¡AQUÍ ESTÁ LA LÓGICA AÑADIDA! ---
        exchange.setEstado(ExchangeStatus.RESERVADO);
        exchange.setTokenConfirmacion(UUID.randomUUID());
        exchange.setSolicitanteId(solicitanteId); // Guardamos quién lo solicitó

        Exchange savedExchange = exchangeRepository.save(exchange);
        return exchangeMapper.toDTO(savedExchange);
    }

    // --- ¡NUEVA IMPLEMENTACIÓN DE HU-10! ---
    @Override
    public List<ExchangeDTO> getExchanges(Long prestadorId, ExchangeStatus estado) {
        List<Exchange> exchanges;

        // Lógica de filtrado
        if (prestadorId != null && estado != null) {
            exchanges = exchangeRepository.findByPrestadorIdAndEstado(prestadorId, estado);
        } else if (prestadorId != null) {
            exchanges = exchangeRepository.findByPrestadorId(prestadorId);
        } else if (estado != null) {
            exchanges = exchangeRepository.findByEstado(estado);
        } else {
            // Sin filtros, devuelve todo
            exchanges = exchangeRepository.findAll();
        }

        // Mapea la lista de Entidades a una lista de DTOs y la devuelve
        return exchanges.stream()
                .map(exchangeMapper::toDTO)
                .collect(Collectors.toList());
    }

    // --- ¡NUEVA IMPLEMENTACIÓN DE HU-11! ---
    @Override
    public ExchangeDTO confirmarEntrega(UUID token, Long receptorId) {

        // 1. Buscamos el ítem por el TOKEN (no por el ID)
        // (Ya creamos este método en el Repository)
        Exchange exchange = exchangeRepository.findByTokenConfirmacion(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token de confirmación inválido o no encontrado."));

        // 2. Verificamos la lógica de negocio (reglas)
        if (exchange.getEstado() != ExchangeStatus.RESERVADO) {
            // Regla: Solo se pueden confirmar entregas que están RESERVADAS.
            // Esto evita que un QR se escanee dos veces.
            throw new IllegalArgumentException("El ítem no está en estado RESERVADO. Ya fue entregado o está disponible.");
        }

        // (Opcional: podrías verificar si el receptorId coincide con quien lo solicitó,
        // si hubiéramos guardado el 'solicitanteId' en la entidad Exchange).
        // Por ahora, confiamos en que solo el receptor tiene el QR.

        // 3. Aplicamos el cambio final
        exchange.setEstado(ExchangeStatus.INTERCAMBIADO);
        exchange.setTokenConfirmacion(null); // Opcional: Invalidamos el token para que no se use más.

        // 4. Guardamos en la BD
        Exchange savedExchange = exchangeRepository.save(exchange);

        // 5. Devolvemos el DTO actualizado
        return exchangeMapper.toDTO(savedExchange);
    }
}