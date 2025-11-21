package com.hugnet.donation_service.entity;

public enum PaymentStatus {
    NA,             // No Aplica (para donaciones en ESPECIE)
    PENDIENTE_PAGO, // Se generó el link de pago, pero el usuario aun no paga
    APROBADO,       // MercadoPago confirmó el cobro exitoso
    RECHAZADO,      // Tarjeta denegada o error en el pago
    EN_PROCESO      // El pago se está validando 
}