package com.hugnet.sponsor_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;


@Component
public class GatewayHeadersAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Extraer las cabeceras inyectadas por el Gateway
        final String userId = request.getHeader("X-User-Id");
        final String userRol = request.getHeader("X-User-Rol");

        // 2. Si existen y el usuario no está autenticado
        if (userId != null && userRol != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 3. Creamos la lista de permisos (ej: "ROLE_PRESTADOR")
            List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + userRol));

            // 4. Creamos un token de autenticación "virtual"
            // No usamos un UserDetails real, solo el ID (Long) y los permisos.
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    Long.parseLong(userId), // El "Principal" es ahora el ID del usuario
                    null,
                    authorities
            );

            // 5. Establecemos el usuario en el Contexto de Seguridad
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        // 6. Continuamos con el siguiente filtro
        filterChain.doFilter(request, response);
    }
}