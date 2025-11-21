package com.hugnet.exchange_service.dto.common;

import com.hugnet.exchange_service.dto.CreateExchangeDTO;
import com.hugnet.exchange_service.dto.ExchangeDTO;
import com.hugnet.exchange_service.entity.Exchange;
import org.springframework.stereotype.Component;

@Component
public class ExchangeMapper {

    // Convertir Entidad -> DTO (para devolver al frontend)
    public ExchangeDTO toDTO(Exchange entity) {
        if (entity == null) return null;
        ExchangeDTO dto = new ExchangeDTO();
        dto.setId(entity.getId());
        dto.setTitulo(entity.getTitulo());
        dto.setDescripcion(entity.getDescripcion());
        dto.setPrestadorId(entity.getPrestadorId());
        dto.setItemType(entity.getItemType());
        dto.setEstado(entity.getEstado());
        dto.setItemDeseado(entity.getItemDeseado());
        dto.setFechaPublicacion(entity.getFechaPublicacion());
        return dto;
    }

    // Convertir DTO -> Entidad (para guardar en BD)
    public Exchange toEntity(CreateExchangeDTO dto) {
        if (dto == null) return null;
        // Usamos el builder de la entidad
        return Exchange.builder()
                .titulo(dto.getTitulo())
                .descripcion(dto.getDescripcion())
                .itemType(dto.getItemType())
                .itemDeseado(dto.getItemDeseado())
                .build();
        // Nota: No asignamos estado, fecha, o prestadorId aquí.
        // El @PrePersist se encarga del estado y la fecha.
        // El *Servicio* se encargará del prestadorId.
    }
}