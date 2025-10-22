package com.hugnet.donation_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Collections;

@Configuration
public class ApplicationConfig {

    @Bean
    public UserDetailsService userDetailsService() {
        // Devuelve una implementación simple que crea un UserDetails básico.
        // Los roles se añadirán en el filtro.
        return username -> new User(username, "", Collections.emptyList());
    }
}