package com.hugnet.donation_service.dto;

import com.hugnet.donation_service.entity.DonationType;
import lombok.Data;

@Data
public class CreateDonationDTO {
    private DonationType tipo;
    private String descripcion;
    private Double monto;
    private Integer cantidad;
    private Long usuarioId;
    private Long activityId;
}