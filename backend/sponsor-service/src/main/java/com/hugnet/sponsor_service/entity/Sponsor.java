package com.hugnet.sponsor_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "sponsors")
@NoArgsConstructor
@AllArgsConstructor
public class Sponsor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sponsorId;
    private String nombre;
    @Enumerated(EnumType.STRING)
    private SponsorType tipo; // Ej: "Empresa", "Particular"
    private String email;
    private String telefono;
}