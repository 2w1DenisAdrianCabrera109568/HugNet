package com.hugnet.report_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient activityServiceWebClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8082/api/activities") // URL base del activity-service
                .build();
    }
}
