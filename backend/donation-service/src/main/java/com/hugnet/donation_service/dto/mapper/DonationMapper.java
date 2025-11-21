package com.hugnet.donation_service.dto.mapper;

import com.hugnet.donation_service.dto.CreateDonationDTO;
import com.hugnet.donation_service.dto.DonationDTO;
import com.hugnet.donation_service.entity.Donation;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DonationMapper {

    // Convertir Entidad -> DTO (para devolver al frontend)
    public DonationDTO toDTO(Donation entity) {
        if (entity == null) return null;
        DonationDTO dto = new DonationDTO();
        dto.setId(entity.getId());
        dto.setDonanteId(entity.getDonanteId());
        dto.setTipoDonacion(entity.getTipoDonacion());
        dto.setEstado(entity.getEstado());
        dto.setFechaCreacion(entity.getFechaCreacion());
        dto.setMonto(entity.getMonto());
        dto.setPaymentGatewayId(entity.getPaymentGatewayId());
        dto.setItemType(entity.getItemType());
        dto.setDescripcionItem(entity.getDescripcionItem());
        dto.setCantidad(entity.getCantidad());
        dto.setActivityId(entity.getActivityId());
        dto.setPaymentStatus(entity.getPaymentStatus());
        return dto;
    }

    // Convertir CreateDonationDTO -> Entidad (para guardar en BD)
    public Donation toEntity(CreateDonationDTO dto) {
        if (dto == null) return null;

        return Donation.builder()
                .tipoDonacion(dto.getTipoDonacion())
                .monto(dto.getMonto()) // Para Sprint 4
                .itemType(dto.getItemType())
                .descripcionItem(dto.getDescripcionItem())
                .cantidad(dto.getCantidad())
                .activityId(dto.getActivityId())
                .build();

        // Nota: El donanteId y el estado se asignarán en el Servicio.
    }
}