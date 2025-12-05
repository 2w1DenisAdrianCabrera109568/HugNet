package com.hugnet.activity_service.dto;

import com.hugnet.activity_service.entity.ActivityTipe;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityTypeReportDTO {
    private ActivityTipe tipoActividad;
    private Long totalEventos;
    private Long totalParticipantes;
}
