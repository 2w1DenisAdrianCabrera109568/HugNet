package com.hugnet.report_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReporteParticipacionDTO {
    private String tipoActividad;
    private Long totalEventos;
    private Long totalParticipantes;
}