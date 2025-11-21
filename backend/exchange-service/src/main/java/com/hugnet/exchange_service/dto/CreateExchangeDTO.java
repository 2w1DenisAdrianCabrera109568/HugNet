package com.hugnet.exchange_service.dto;

// Importa el Enum que creaste
import com.hugnet.exchange_service.entity.ItemType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateExchangeDTO {

    @NotEmpty(message = "El título no puede estar vacío.")
    @Size(min = 3, max = 100, message = "El título debe tener entre 3 y 100 caracteres.")
    private String titulo;

    private String descripcion; // Opcional

    @NotNull(message = "Debes especificar el tipo (BIEN o SERVICIO).")
    private ItemType itemType; // Usando tu renombrado "ItemType"

    @NotEmpty(message = "Debes especificar qué buscas a cambio.")
    private String itemDeseado;
}