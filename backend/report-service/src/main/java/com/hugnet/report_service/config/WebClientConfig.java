package com.hugnet.report_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    // Sin @LoadBalanced porque no usamos Eureka para resolver, usamos DNS directo de Docker
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}