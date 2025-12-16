package com.hugnet.report_service.dto;



import lombok.Data;

@Data
public class SponsorData {
    private Long sponsorId;
    private String nombreEmpresa;
    private String tipoSponsor;
    private String email;
    private String descripcionAporte;
    private Long activityId;
}