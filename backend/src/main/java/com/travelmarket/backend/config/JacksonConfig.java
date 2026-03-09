package com.travelmarket.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    /**
     * Explicit ObjectMapper bean.
     * This prevents "ObjectMapper bean not found" issues and supports Instant serialization.
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper om = new ObjectMapper();
        om.registerModule(new JavaTimeModule());
        //Force ISO-8601 strings for Instant/LocalDateTime instead of numeric timestamps
        om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return om;
    }
}