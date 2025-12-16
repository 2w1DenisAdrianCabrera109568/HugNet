package com.hugnet.report_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ExpenseData {
    private Long expenseId;
    private Long activityId;
    private String descripcion;
    private Double monto;
    private LocalDateTime fechaGasto;
    private String nroFactura;
}