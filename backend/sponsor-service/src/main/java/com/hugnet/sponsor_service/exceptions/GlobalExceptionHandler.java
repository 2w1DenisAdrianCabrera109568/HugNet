package com.hugnet.sponsor_service.exceptions;


import com.hugnet.sponsor_service.dto.common.ErrorHandle;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorHandle> handleResourceNotFoundException(ResourceNotFoundException ex) {
        // Ahora creamos una instancia de ErrorHandle
        ErrorHandle errorHandle = new ErrorHandle(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return new ResponseEntity<>(errorHandle, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorHandle> handleIllegalArgumentException(IllegalArgumentException ex) {
        // Y aquí también
        ErrorHandle errorHandle = new ErrorHandle(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return new ResponseEntity<>(errorHandle, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorHandle> handleGenericException(Exception ex) {
        // Y finalmente aquí
        ErrorHandle errorHandle = new ErrorHandle(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Ocurrió un error inesperado en el servidor.");
        return new ResponseEntity<>(errorHandle, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}