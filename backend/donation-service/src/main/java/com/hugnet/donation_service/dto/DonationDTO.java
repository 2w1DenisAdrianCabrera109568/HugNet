package com.hugnet.donation_service.dto;

import com.hugnet.donation_service.entity.DonationStatus;
import com.hugnet.donation_service.entity.DonationType;
import com.hugnet.donation_service.entity.ItemType;
import com.hugnet.donation_service.entity.PaymentStatus;

import lombok.Data;
import java.time.LocalDateTime;
@Data
public class DonationDTO {

    private Long id;
    private Long donanteId;
    private DonationType tipoDonacion;
    private DonationStatus estado;
    private LocalDateTime fechaCreacion;
    private PaymentStatus paymentStatus; 

    // Campos Monetaria
    private Double monto;
    private String paymentGatewayId; // (Para Sprint 4)
    private String paymentUrl; // (Para Sprint 4)

    // Campos Especie
    private ItemType itemType;
    private String descripcionItem;
    private Integer cantidad;
    private Long activityId;
}