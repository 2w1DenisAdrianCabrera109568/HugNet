package com.hugnet.donation_service.dto.mapper;

import com.hugnet.donation_service.dto.CreateDonationDTO;
import com.hugnet.donation_service.dto.DonationDTO;
import com.hugnet.donation_service.entity.Donation;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DonationMapper {

    public DonationDTO toDTO(Donation donation) {
        if (donation == null) return null;

        DonationDTO dto = new DonationDTO();
        dto.setDonationId(donation.getDonationId());
        dto.setTipo(donation.getTipo());
        dto.setDescripcion(donation.getDescripcion());
        dto.setMonto(donation.getMonto());
        dto.setCantidad(donation.getCantidad());
        dto.setFecha(donation.getFecha());
        dto.setUsuarioId(donation.getUsuarioId());
        dto.setActivityId(donation.getActivityId());

        return dto;
    }

    public Donation toEntity(CreateDonationDTO dto) {
        if (dto == null) return null;

        Donation donation = new Donation();
        donation.setTipo(dto.getTipo());
        donation.setDescripcion(dto.getDescripcion());
        donation.setMonto(dto.getMonto());
        donation.setCantidad(dto.getCantidad());
        donation.setUsuarioId(dto.getUsuarioId());
        donation.setActivityId(dto.getActivityId());
        // La 'fecha' no se setea aquí, se encarga @PrePersist

        return donation;
    }

    public List<DonationDTO> toDTOList(List<Donation> donations) {
        return donations.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}