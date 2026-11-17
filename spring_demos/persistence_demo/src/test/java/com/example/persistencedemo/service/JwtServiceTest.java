package com.example.persistencedemo.service;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "NDBqDN41FmSxWBjdjIYxNd9DRTSHdp9HoECWt9th2tc=";
    private static final String OTHER_SECRET = "c2VjcmV0LXRoYXQtaXMtYXQtbGVhc3QtMzItYnl0ZXMhIQ==";

    private final JwtService jwtService = new JwtService(SECRET, Duration.ofHours(1));

    @Test
    void roundTripsSubjectAndClaims() {
        String token = jwtService.generateToken("alice", Map.of("role", "admin"));

        assertThat(jwtService.extractSubject(token)).isEqualTo("alice");
        assertThat(jwtService.parseClaims(token).get("role", String.class)).isEqualTo("admin");
        assertThat(jwtService.isTokenValid(token, "alice")).isTrue();
        assertThat(jwtService.isTokenValid(token, "bob")).isFalse();
    }

    @Test
    void rejectsTokenSignedWithDifferentKey() {
        String token = new JwtService(OTHER_SECRET, Duration.ofHours(1)).generateToken("alice");

        assertThatThrownBy(() -> jwtService.parseClaims(token)).isInstanceOf(SignatureException.class);
        assertThat(jwtService.isTokenValid(token, "alice")).isFalse();
    }

    @Test
    void rejectsExpiredToken() {
        Instant issued = Instant.parse("2026-01-01T00:00:00Z");
        JwtService issuer = new JwtService(SECRET, Duration.ofMinutes(5), Clock.fixed(issued, ZoneOffset.UTC));
        JwtService later = new JwtService(SECRET, Duration.ofMinutes(5),
                Clock.fixed(issued.plus(Duration.ofMinutes(6)), ZoneOffset.UTC));
        String token = issuer.generateToken("alice");

        assertThatThrownBy(() -> later.parseClaims(token)).isInstanceOf(ExpiredJwtException.class);
        assertThat(later.isTokenValid(token, "alice")).isFalse();
    }

    @Test
    void rejectsShortSecret() {
        assertThatThrownBy(() -> new JwtService("c2hvcnQ=", Duration.ofHours(1)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsGarbage() {
        assertThat(jwtService.isTokenValid("not.a.jwt", "alice")).isFalse();
    }
}
