package com.example.persistencedemo.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Checks Spring can build JwtService from application.properties, without starting the database.
 */
@SpringBootTest(classes = JwtService.class)
class JwtServiceContextTest {

    @Autowired
    private JwtService jwtService;

    @Test
    void springCreatesBeanFromProperties() {
        String token = jwtService.generateToken("alice");

        assertThat(jwtService.isTokenValid(token, "alice")).isTrue();
    }
}
