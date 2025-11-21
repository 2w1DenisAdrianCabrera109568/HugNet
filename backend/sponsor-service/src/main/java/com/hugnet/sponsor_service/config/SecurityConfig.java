package com.hugnet.sponsor_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Habilita @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    
    private final GatewayHeadersAuthenticationFilter gatewayHeadersFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                
                // Sin estado (Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                .authorizeHttpRequests(auth -> auth
                        // No hay endpoints públicos en Sponsor Service (todo pasa por Gateway autenticado)
                        .anyRequest().authenticated()
                )
                
                // Filtro de cabeceras antes del filtro de autenticación
                .addFilterBefore(gatewayHeadersFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
