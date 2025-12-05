package com.hugnet.sponsor_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SponsorReportDTO {
    private Long sponsorId;
    private String nombreEmpresa;
    private String email;
    private String descripcionAporte; // "Camisetas", "Aguas", etc.
    private String tipoSponsor;       // EMPRESA, PARTICULAR
}