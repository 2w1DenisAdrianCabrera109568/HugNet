package com.hugnet.activity_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;


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
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    private TipoActividad tipoActividad;

    @Column(name = "coordinador_id")
    private Long coordinadorId;
}