package com.hugnet.report_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BalanceReportDTO {
    private Long activityId;
    private String activityTitle;
    private Double totalIngresos; // Suma de donaciones monetarias
    private Double totalEgresos;  // Gastos (Por ahora 0.0, preparado para el futuro)
    private Double balanceNeto;   // Ingresos - Egresos
    private Integer cantidadDonaciones; // Cantidad de aportes recibidos
}
