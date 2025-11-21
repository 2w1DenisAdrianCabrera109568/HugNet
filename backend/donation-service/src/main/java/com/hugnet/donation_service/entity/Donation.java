package com.hugnet.donation_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long donanteId; // El ID del User que dona

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationType tipoDonacion; // ESPECIE o MONETARIA

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus estado;

    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    // --- Campos para DONACIÓN EN ESPECIE (HU-12) ---
    @Enumerated(EnumType.STRING)
    private ItemType itemType; // BIEN o SERVICIO

    private String descripcionItem; // Ej: "Cuadernos" o "Taller de lectura"

    private Integer cantidad; // Ej: 50 (unidades)

    // ID de la actividad a la que se asigna (opcional)
    private Long activityId;

    /*
     * @PrePersist
     * public void setDefaults() {
     * if (fechaCreacion == null) {
     * fechaCreacion = LocalDateTime.now();
     * }
     * // El estado por defecto (PENDIENTE o PENDIENTE_PAGO)
     * // lo asignará el Servicio, ya que depende del tipo.
     * }
     */
    // --- Campos para DONACIÓN MONETARIA (HU-14) ---
    private Double monto; // Ej: 500.00

    @Column(name = "payment_gateway_id")
    private String paymentGatewayId; // ID de MercadoPago

    // NUEVO CAMPO: Estado técnico del pago ----Sprint 4

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    @PrePersist
    public void setDefaults() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }

        // Lógica defensiva para inicializar paymentStatus si es nulo
        if (paymentStatus == null) {
            // Si es monetaria, nace como PENDIENTE_PAGO (hasta que se genere el link)
            // Si es especie, nace como NA (No Aplica)
            paymentStatus = (tipoDonacion == DonationType.MONETARIA)
                    ? PaymentStatus.PENDIENTE_PAGO
                    : PaymentStatus.NA;
        }
    }

}