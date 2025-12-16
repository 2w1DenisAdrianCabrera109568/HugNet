package com.hugnet.activity_service.dto.expense;

import java.time.LocalDateTime;

import lombok.Data;
@Data
public class CreateExpenseDTO {   
    
       
    private Long activityId; 
    private String descripcion;
    private Double monto;
    private LocalDateTime fechaGasto;
    private String nroFactura;
    
}