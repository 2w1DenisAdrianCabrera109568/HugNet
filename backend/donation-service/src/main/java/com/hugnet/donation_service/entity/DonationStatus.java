package com.hugnet.donation_service.entity;
/**
 * Define el estado de la donación en su ciclo de vida.
 */

public enum DonationStatus {
    PENDIENTE,  // Ofrecida por el usuario, pendiente de revisión
    APROBADA,   // Aceptada por el Gestor, entra en stock
    RECHAZADA,  // Rechazada por el Gestor
    ASIGNADA,   // Asignada a una actividad (futuro)
    ENTREGADA   // Entregada al beneficiario (futuro)
}
