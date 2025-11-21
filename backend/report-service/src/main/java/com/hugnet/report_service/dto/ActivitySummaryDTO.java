package com.hugnet.report_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true) 
public class ActivitySummaryDTO {
    
    private Long activityId; 
    private String titulo;       
    // Lo mapeamos como String para que sea fácil de agrupar, aunque venga de un Enum.
    private String tipoActividad;     
    private String estado; // Mapeamos el Enum ActivityStatus a String automáticamente
}