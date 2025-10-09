package com.hugnet.activity_service.DTO;

import com.hugnet.activity_service.entity.TipoActividad;
import lombok.Data;

@Data
public class CreateActivityDTO {
    private String titulo;
    private String description;
    private String fechaInicio; // "yyyy-MM-dd"
    private String fechaFin;
    private TipoActividad tipoActividad;
    private Long coordinadorId;
}
