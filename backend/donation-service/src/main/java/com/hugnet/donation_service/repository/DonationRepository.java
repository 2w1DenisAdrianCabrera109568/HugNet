package com.hugnet.donation_service.repository;

import com.hugnet.donation_service.entity.Donation;
import com.hugnet.donation_service.entity.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    // --- ¡NUEVO MÉTODO PARA HU-13! ---
    /**
     * Busca todas las donaciones que coincidan con un estado específico.
     * (Lo usaremos para buscar PENDIENTE, APROBADA, etc.)
     */
    List<Donation> findByEstado(DonationStatus estado);
    // Opcional: Si alguna vez necesitamos buscar por el ID de la preferencia de MP
    Optional<Donation> findByPaymentGatewayId(String paymentGatewayId);
}
