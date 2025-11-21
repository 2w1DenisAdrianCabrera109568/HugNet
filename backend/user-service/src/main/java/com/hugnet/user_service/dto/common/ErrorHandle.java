package com.hugnet.user_service.dto.common;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorHandle {

    private int status;
    private String message;
    private LocalDateTime timestamp;

    // --- NUEVO CAMPO ---
    private List<Map<String, String>> errors;

    // Constructor original (para errores simples)
    public ErrorHandle(int status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.errors = null; // Importante: nulo por defecto
    }

    // --- NUEVO CONSTRUCTOR ---
    // (para errores de validación)
    public ErrorHandle(int status, String message, List<Map<String, String>> errors) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.errors = errors;
    }

    // Getters y Setters...
    // (Asegúrate de agregar getter y setter para 'errors')

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    // --- NUEVOS GETTER/SETTER ---
    public List<Map<String, String>> getErrors() { return errors; }
    public void setErrors(List<Map<String, String>> errors) { this.errors = errors; }
}