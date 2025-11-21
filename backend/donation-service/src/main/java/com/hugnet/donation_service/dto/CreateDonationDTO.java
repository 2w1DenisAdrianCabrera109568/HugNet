package com.hugnet.donation_service.dto;

import com.hugnet.donation_service.entity.DonationType;
import com.hugnet.donation_service.entity.ItemType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CreateDonationDTO {

    @NotNull(message = "El tipo de donación no puede ser nulo.")
    private DonationType tipoDonacion;

    // --- Campos para DONACIÓN EN ESPECIE (HU-12) ---   
    private ItemType itemType; 
    private String descripcionItem; 
    // Mantenemos @Min solo si el valor no es nulo
    @Min(value = 1, message = "La cantidad debe ser al menos 1.")
    private Integer cantidad;
    // Opcional
    private Long activityId;
    // --- Campos para DONACIÓN MONETARIA (HU-14) ---
    @Positive(message = "El monto debe ser mayor a cero.")    
    private Double monto;
}