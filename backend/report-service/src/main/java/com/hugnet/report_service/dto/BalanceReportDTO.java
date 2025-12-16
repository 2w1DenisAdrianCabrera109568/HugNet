package com.hugnet.report_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BalanceReportDTO {
    // Cabecera de Actividad
    private String tituloActividad;
    private Long actividadId;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String estado;

    // Secciones
    private List<DonationData> ingresosMonetarios;
    private Double totalIngresosMonetarios;

    private List<DonationData> ingresosBienes;

    private List<ExpenseData> egresosGastos;
    private Double totalGastos;

    private List<SponsorData> aportesSponsors;
}