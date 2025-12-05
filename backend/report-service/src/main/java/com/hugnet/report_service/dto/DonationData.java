package com.hugnet.report_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor             // Vital para Jackson
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // Vital para evitar errores si la API cambia
public class DonationData {    // public (ya no static)
    private Long id;
    private Double monto;
    private String estado;
    private Long activityId;
    private String tipoDonacion;
}