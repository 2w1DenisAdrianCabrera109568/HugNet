package com.hugnet.exchange_service.repository;

import com.hugnet.exchange_service.entity.Exchange;
import com.hugnet.exchange_service.entity.ExchangeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExchangeRepository extends JpaRepository<Exchange, Long> {

    // --- Métodos de búsqueda ---

    // Necesitaremos esto para la lógica del QR (US11)
    Optional<Exchange> findByTokenConfirmacion(UUID token);
    // Buscar por estado (ej: solo DISPONIBLES)
    List<Exchange> findByEstado(ExchangeStatus estado);
    // Buscar por prestador
    List<Exchange> findByPrestadorId(Long prestadorId);
    // Buscar por ambos
    List<Exchange> findByPrestadorIdAndEstado(Long prestadorId, ExchangeStatus estado);
}