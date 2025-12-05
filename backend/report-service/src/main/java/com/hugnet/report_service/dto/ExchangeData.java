package com.hugnet.report_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // Ignora campos extra si exchange-service cambia
public class ExchangeData {
    private Long id;
    private String titulo;
    private String descripcion;
    private String estado;      // DISPONIBLE, INTERCAMBIADO
    private String itemType;    // LIBRO, APUNTE, etc.
    private String fechaPublicacion;
}
