package com.hugnet.gateway.config; // Revisa tu package

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouterValidator {

    // Lista de endpoints que NO requieren token
    // (Asegúrate de que coincidan con tu SecurityConfigUser)
    public static final List<String> openApiEndpoints = List.of(
            "/api/users/register",
            "/api/users/login",
            "/v3/api-docs", // Para Swagger
            "/swagger-ui",
            "/api/donations/webhook/mp"
    );

    // Método que devuelve true si la petición es a un endpoint PRIVADO
    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints.stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));
}