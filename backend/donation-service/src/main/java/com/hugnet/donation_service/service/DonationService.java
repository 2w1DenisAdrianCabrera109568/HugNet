package com.hugnet.donation_service.service;

import com.hugnet.donation_service.dto.CreateDonationDTO;
import com.hugnet.donation_service.dto.DonationDTO;

import java.util.List;

public interface DonationService {
    List<DonationDTO> getAllDonations();
    // --- HU-12: Un usuario ofrece una nueva donación en especie (BIEN o SERVICIO) ---
    /**
     * Un usuario ofrece una nueva donación en especie (BIEN o SERVICIO).
     * La donación se crea en estado PENDIENTE.
     *
     * @param dto El DTO con la información de la donación.
     * @param donanteId El ID del usuario (autenticado) que realiza la oferta.
     * @return El DTO de la donación recién creada.
     */
    DonationDTO createDonation(CreateDonationDTO dto, Long donanteId);

    // --- ¡NUEVOS MÉTODOS PARA HU-13! ---

    /**
     * Obtiene la lista de donaciones pendientes de aprobación.
     * @return Lista de donaciones con estado PENDIENTE.
     */
    List<DonationDTO> getPendingDonations();

    /**
     * Aprueba una donación pendiente.
     * @param donationId El ID de la donación a aprobar.
     * @param gestorId El ID del gestor que realiza la aprobación.
     * @return La donación actualizada (estado APROBADA).
     */
    DonationDTO approveDonation(Long donationId, Long gestorId);

    /**
     * Rechaza una donación pendiente.
     * @param donationId El ID de la donación a rechazar.
     * @param gestorId El ID del gestor que realiza el rechazo.
     * @return La donación actualizada (estado RECHAZADA).
     */
    DonationDTO rejectDonation(Long donationId, Long gestorId);

    // --- HU-14: Notificación de pago de donación monetaria ---
    void processPaymentNotification(String topic, Long id);
}
