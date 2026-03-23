package com.travelmarket.backend.config;

import com.fasterxml.jackson.core.StreamReadConstraints;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        System.out.println("JACKSON_CONFIG: Creating PRIMARY ObjectMapper with 100MB String Limit...");
        
        // Use the standard builder to get all Spring Boot default modules (Time, Security, ParameterNames, etc.)
        ObjectMapper mapper = Jackson2ObjectMapperBuilder.json().build();
        
        // Apply the 100MB max string length limit to fix video upload issues
        StreamReadConstraints constraints = StreamReadConstraints.builder()
                .maxStringLength(100_000_000) // 100MB
                .build();
        mapper.getFactory().setStreamReadConstraints(constraints);
        
        // Log verification
        int currentLimit = mapper.getFactory().streamReadConstraints().getMaxStringLength();
        System.out.println("JACKSON_CONFIG_VERIFY: ObjectMapper MaxStringLength = " + currentLimit);
        
        return mapper;
    }
}