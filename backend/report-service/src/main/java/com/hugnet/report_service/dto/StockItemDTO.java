package com.hugnet.report_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockItemDTO {
    private String descripcion;     // Nombre del ítem
    private String origen;          // "DONACION" o "INTERCAMBIO"
    private String estado;          // DISPONIBLE, RESERVADO, ENTREGADO
    private String fechaIngreso;    // Fecha de creación (como String para simplificar reporte)
    private String categoria;       // (Opcional) Tipo de bien
}
