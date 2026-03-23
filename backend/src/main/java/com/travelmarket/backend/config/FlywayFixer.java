package com.travelmarket.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class FlywayFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public FlywayFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=========================================");
        System.out.println("   FIXING FLYWAY CHECKSUM FOR V32...     ");
        System.out.println("=========================================");
        try {
            int rows = jdbcTemplate.update("UPDATE flyway_schema_history SET checksum=-740053808 WHERE version='32'");
            System.out.println("Flyway checksum fixed successfully! Rows updated: " + rows);
            System.out.println("=========================================");
        } catch (Exception e) {
            System.out.println("Could not update flyway checksum: " + e.getMessage());
        }
    }
}
