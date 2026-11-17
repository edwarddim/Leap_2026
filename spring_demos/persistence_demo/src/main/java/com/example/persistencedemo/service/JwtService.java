package com.example.persistencedemo.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

/**
 * Issues and validates HS256-signed JWTs.
 */
@Service
public class JwtService {

    private static final String ALGORITHM = "HmacSHA256";

    private final SecretKey signingKey;
    private final Duration expiration;
    private final Clock clock;

    // Multiple constructors exist, so tell Spring which one to use
    @Autowired
    public JwtService(@Value("${jwt.secret}") String base64Secret,
                      @Value("${jwt.expiration:PT1H}") Duration expiration) {
        this(base64Secret, expiration, Clock.systemUTC());
    }

    public JwtService(String base64Secret, Duration expiration, Clock clock) {
        byte[] keyBytes = Base64.getDecoder().decode(base64Secret);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("jwt.secret must decode to at least 256 bits for HmacSHA256");
        }
        this.signingKey = new SecretKeySpec(keyBytes, ALGORITHM);
        this.expiration = expiration;
        this.clock = clock;
    }

    public String generateToken(String subject) {
        return generateToken(subject, Map.of());
    }

    public String generateToken(String subject, Map<String, ?> extraClaims) {
        Instant now = clock.instant();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiration)))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Verifies the signature and expiry and returns the claims.
     *
     * @throws JwtException if the token is malformed, tampered with or expired
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .clock(() -> Date.from(clock.instant()))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String expectedSubject) {
        try {
            return expectedSubject.equals(extractSubject(token));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
