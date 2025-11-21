package com.hugnet.user_service.dto;

import com.hugnet.user_service.entity.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserDTO {
    // @NotEmpty asegura que el string no sea null Y que su .trim() no esté vacío.
    @NotEmpty(message = "El nombre no puede estar vacío.")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres.")
    private String nombre;

    @NotEmpty(message = "El apellido no puede estar vacío.")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres.")
    private String apellido;

    @NotEmpty(message = "El email no puede estar vacío.")
    @Email(message = "El formato del email no es válido (ej. usuario@dominio.com).")
    private String email;

    @NotEmpty(message = "La contraseña no puede estar vacía.")
    @Pattern(
            // Esta es la RegEx que valida tus reglas:
            // (?=.*[a-z]) -> al menos una minúscula
            // (?=.*[A-Z]) -> al menos una mayúscula
            // (?=.*\d)   -> al menos un número
            // [a-zA-Z\d\S]{8,16} -> 8 a 16 caracteres (letras, números o símbolos)
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\S]{8,16}$",
            message = "La contraseña debe tener entre 8 y 16 caracteres, e incluir al menos una mayúscula, una minúscula y un número."
    )
    private String password;


}
