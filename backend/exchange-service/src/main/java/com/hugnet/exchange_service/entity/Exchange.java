package com.hugnet.exchange_service.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exchanges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exchange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo; // Ej: "Apuntes de Psicoanálisis"

    @Column(columnDefinition = "TEXT") // Usamos TEXT para descripciones largas
    private String descripcion; // Detalles de los apuntes

    @Column(nullable = false)
    private Long prestadorId; // ID del User (Rol.PRESTADOR) que lo publica

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType itemType; // Resuelve si es BIEN o SERVICIO

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExchangeStatus estado; // DISPONIBLE, RESERVADO, INTERCAMBIADO

    @Column(name = "item_deseado")
    private String itemDeseado; // "Busco apuntes de Matemática"

    @Column(name = "token_confirmacion", unique = true)
    private UUID tokenConfirmacion; // Token único para la lógica del QR (US11)

    @Builder.Default
    private LocalDateTime fechaPublicacion = LocalDateTime.now();

    @Column(name = "solicitante_id")
    private Long solicitanteId;

    // Método de ayuda para asignar el estado inicial al crear
    @PrePersist
    public void setDefaults() {
        if (estado == null) {
            estado = ExchangeStatus.DISPONIBLE;
        }
        if (fechaPublicacion == null) {
            fechaPublicacion = LocalDateTime.now();
        }
    }
}