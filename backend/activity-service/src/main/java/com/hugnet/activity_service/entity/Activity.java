package com.hugnet.activity_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activity_id")
    private Long activityId;

    @Column(nullable = false)
    private String titulo;


    @Column(name = "description")
    private String description;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Enumerated(EnumType.STRING)
    private ActivityTipe tipoActividad;

    @Column(name = "estado_actividad")
    @Enumerated(EnumType.STRING)
    private ActivityStatus estado;

    @Column(name = "coordinador_id")
    private Long coordinadorId;
    @PrePersist
    public void setDefaultStatus() {
        if (this.estado == null) {
            this.estado = ActivityStatus.PENDIENTE;
        }
    }
}