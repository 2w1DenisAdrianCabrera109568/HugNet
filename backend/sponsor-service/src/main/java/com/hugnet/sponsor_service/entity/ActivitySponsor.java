package com.hugnet.sponsor_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity_sponsors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivitySponsor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Sponsor (Local)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sponsor_id", nullable = false)
    private Sponsor sponsor;

    // Referencia a la Actividad (Remota en activity-service)
    @Column(name = "activity_id", nullable = false)
    private Long activityId;

    // Detalles del aporte (HU-28: "visibilizar su apoyo" 
    @Column(nullable = false)
    private String descripcionAporte; // Ej: "Donación de 50 botellas de agua"

    @Builder.Default
    private LocalDateTime fechaAsignacion = LocalDateTime.now();
}
