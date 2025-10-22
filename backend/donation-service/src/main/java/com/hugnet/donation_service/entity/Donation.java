package com.hugnet.donation_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long donationId;

    @Enumerated(EnumType.STRING)
    private DonationType tipo;

    private String descripcion;
    private Double monto;
    private Integer cantidad;
    private LocalDateTime fecha;
    private Long usuarioId;
    private Long activityId;

    @PrePersist
    public void prePersist() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }
}