package com.hugnet.gateway.config; // Asegúrate de que el package sea el de tu gateway

import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
// 1. La clase extiende AbstractGatewayFilterFactory y usa ".Config"
public class AuthenticationGatewayFilterFactory
        extends AbstractGatewayFilterFactory<AuthenticationGatewayFilterFactory.Config> {

    // --- DEPENDENCIAS ---
    @Autowired
    private RouterValidator routerValidator;
    @Autowired
    private JwtServiceValidator jwtService;

    // --- 2. CONSTRUCTOR ---
    // Le dice a Spring cómo manejar la clase Config
    public AuthenticationGatewayFilterFactory() {
        super(Config.class);
    }

    // --- 3. MÉTODO APPLY (Aquí va la lógica del filtro) ---
    @Override
    public GatewayFilter apply(Config config) {

        // Aquí va la lógica del filtro
        return (exchange, chain) -> {

            ServerHttpRequest request = exchange.getRequest();

            // 1. Revisa si la ruta es PRIVADA
            if (routerValidator.isSecured.test(request)) {

                // 2. Si es privada, busca la cabecera "Authorization"
                if (!request.getHeaders().containsKey("Authorization")) {
                    return this.onError(exchange, "Falta la cabecera de autorización", HttpStatus.UNAUTHORIZED);
                }

                final String authHeader = request.getHeaders().getOrEmpty("Authorization").get(0);

                // 3. Valida el formato "Bearer <token>"
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    return this.onError(exchange, "Formato de token inválido", HttpStatus.UNAUTHORIZED);
                }

                final String token = authHeader.substring(7);

                // 4. Valida la firma y la expiración del token
                try {
                    if (jwtService.isTokenExpired(token)) {
                        return this.onError(exchange, "Token expirado", HttpStatus.UNAUTHORIZED);
                    }
                } catch (Exception e) {
                    return this.onError(exchange, "Token inválido", HttpStatus.UNAUTHORIZED);
                }

                // 5. Extrae los claims y añade las cabeceras personalizadas
                Claims claims = jwtService.extractAllClaims(token);
                String userId = claims.get("userId").toString();
                String userRol = (String) claims.get("rol");

                exchange.getRequest().mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Rol", userRol)
                        .build();
            }

            // 6. Deja pasar la petición
            return chain.filter(exchange);
        };
    }

    // --- 7. CLASE DE CONFIGURACIÓN
    public static class Config {
        // Puede estar vacía
    }

    // --- 8. MÉTODO AUXILIAR PARA MANEJO DE ERRORES ---
    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }
}