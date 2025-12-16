package com.hugnet.activity_service.entity;


import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_id")    
    private Long expenseId;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "activity_id", nullable = false) 
    @JsonIgnore 
    @ToString.Exclude
    private Activity activity;
   
    @Column(name = "descripcion", nullable = false)
    private String descripcion;
    @Column(name = "monto", nullable = false)
    private Double monto;
    @Column(name = "fecha_gasto", nullable = false)
    private LocalDateTime fechaGasto;
    @Column(name = "nro_factura", nullable = false)
    private String nroFactura;

    public Long getActivityId() {
        return activity != null ? activity.getActivityId() : null;
    }
    
}
