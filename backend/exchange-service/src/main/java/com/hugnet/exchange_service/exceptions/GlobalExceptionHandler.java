package com.hugnet.exchange_service.exceptions;

import com.hugnet.exchange_service.dto.common.ErrorHandle;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorHandle> handleResourceNotFoundException(ResourceNotFoundException ex) {
        ErrorHandle errorHandle = new ErrorHandle(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return new ResponseEntity<>(errorHandle, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorHandle> handleIllegalArgumentException(IllegalArgumentException ex) {
        ErrorHandle errorHandle = new ErrorHandle(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return new ResponseEntity<>(errorHandle, HttpStatus.BAD_REQUEST);
    }

    // --- MANEJADOR DE VALIDACIÓN MODIFICADO ---
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorHandle> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        // 1. Extraemos los errores de validación en una lista de mapas
        List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> {
                    Map<String, String> errorMap = new HashMap<>();
                    errorMap.put("field", error.getField());
                    errorMap.put("message", error.getDefaultMessage());
                    return errorMap;
                })
                .collect(Collectors.toList());

        // 2. Creamos un ErrorHandle que incluya la lista de errores
        ErrorHandle errorHandle = new ErrorHandle(
                HttpStatus.BAD_REQUEST.value(),
                "Error de validación", // Mensaje general
                errors // La lista de errores específicos
        );

        // 3. Devolvemos el ErrorHandle unificado
        return new ResponseEntity<>(errorHandle, HttpStatus.BAD_REQUEST);
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorHandle> handleGenericException(Exception ex) {
        // Imprime el error real en la consola para que puedas depurarlo
        ex.printStackTrace();

        ErrorHandle errorHandle = new ErrorHandle(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Ocurrió un error inesperado en el servidor.");
        return new ResponseEntity<>(errorHandle, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}