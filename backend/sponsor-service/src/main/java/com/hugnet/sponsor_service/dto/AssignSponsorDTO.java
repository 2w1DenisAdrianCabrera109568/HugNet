package com.hugnet.sponsor_service.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignSponsorDTO {
    
    @NotNull(message = "El ID de la actividad es obligatorio")
    private Long activityId;

    @NotEmpty(message = "Debe indicar qué aporta el sponsor")
    private String descripcionAporte;
}