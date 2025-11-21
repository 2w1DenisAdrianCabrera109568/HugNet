package com.hugnet.exchange_service.dto;

import com.hugnet.exchange_service.entity.ExchangeStatus;
import com.hugnet.exchange_service.entity.ItemType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExchangeDTO {
    // Este DTO devuelve la entidad completa
    private Long id;
    private String titulo;
    private String descripcion;
    private Long prestadorId;
    private ItemType itemType;
    private ExchangeStatus estado;
    private String itemDeseado;
    private LocalDateTime fechaPublicacion;
}