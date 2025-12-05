package com.hugnet.report_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ParticipantDetailDTO {
    private Long userId;
    private String nombre;
    private String apellido;
    private String email;
}