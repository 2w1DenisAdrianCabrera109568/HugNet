package com.hugnet.report_service.entity;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    private String tipoReporte;

    private LocalDateTime fechaGeneracion;

    // @Lob es para campos de texto grandes (Large Object)
    // columnDefinition = "TEXT" es específico de Postgres para JSON
    @Lob
    @Column(columnDefinition = "TEXT")
    private String datosReporte;

    private Long usuarioGeneradorId;

    private Long activityId;

    @PrePersist
    public void prePersist() {
        if (fechaGeneracion == null) {
            fechaGeneracion = LocalDateTime.now();
        }
    }
}