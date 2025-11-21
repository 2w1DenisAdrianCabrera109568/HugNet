package com.hugnet.user_service.config; // <-- ¡Cambia esto en cada servicio!


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtServiceUser jwtServiceUser;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // 1. Si no hay token o no empieza con "Bearer", pasamos al siguiente filtro.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7); // Quitamos "Bearer "
        final String userEmail = jwtServiceUser.extractUsername(jwt);

        // 2. Si tenemos email y el usuario NO está autenticado en esta sesión
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Cargamos el UserDetails (el "molde" de usuario de Spring)
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 3. Validamos el token
            if (jwtServiceUser.isTokenValid(jwt, userDetails)) {

                // --- ¡La Magia de la Autorización! ---
                // Extraemos el rol (sin 'e') del token
                String rol = jwtServiceUser.extractRol(jwt);

                // Creamos la lista de permisos para Spring (ej: "ROLE_ADMINISTRADOR")
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + rol));

                // Creamos el token de autenticación y le pasamos los permisos
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities // <-- Aquí van los roles
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 4. Guardamos al usuario en el Contexto de Seguridad
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 5. Continuamos con el resto de los filtros
        filterChain.doFilter(request, response);
    }
}