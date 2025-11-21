package com.hugnet.gateway.config; // Asegúrate de que el package sea el de tu gateway

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtServiceValidator {

    @Value("${jwt.secret}") // Lee la clave del application.yml
    private String SECRET_KEY;

    // Extrae todos los "claims" (datos) del token
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Valida si el token ha expirado
    public boolean isTokenExpired(String token) {
        // Compara la fecha de expiración con "ahora"
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    // Obtiene la clave de firma a partir del secreto Base64
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}