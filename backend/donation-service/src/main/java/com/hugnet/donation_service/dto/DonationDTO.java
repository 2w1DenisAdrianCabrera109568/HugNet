package com.hugnet.donation_service.dto;



import com.hugnet.donation_service.entity.DonationType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DonationDTO {
    private Long donationId;
    private DonationType tipo;
    private String descripcion;
    private Double monto;
    private Integer cantidad;
    private LocalDateTime fecha;
    private Long usuarioId;
    private Long activityId;
}