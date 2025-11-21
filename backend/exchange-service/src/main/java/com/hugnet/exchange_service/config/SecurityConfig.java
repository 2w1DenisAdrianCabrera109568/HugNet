package com.hugnet.exchange_service.config;

import lombok.RequiredArgsConstructor; // ¡Añade esto!
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
// ¡Añade esto!
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
// @EnableWebSecurity no es necesaria si usas Spring Boot 3 y defines un SecurityFilterChain bean
@EnableMethodSecurity(prePostEnabled = true) // Habilita @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayHeadersAuthenticationFilter gatewayHeadersFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Deshabilitamos CSRF (no usamos sesiones/cookies)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. ¡LA CURA PARA EL 404!
                // Deshabilitamos el login por formulario y el basic auth
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                // 3. Política de sesión STATELESS (sin estado)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 4. MÁS SEGURO: Exigimos que todas las peticiones estén autenticadas.
                // Nuestro filtro se encargará de proveer la autenticación desde las cabeceras.
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().authenticated()
                )

                // 5. Añadimos nuestro filtro ANTES del filtro de login estándar (que está deshabilitado)
                .addFilterBefore(gatewayHeadersFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}