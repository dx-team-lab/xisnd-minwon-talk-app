package com.minwon.platform.common.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT Access Token 생성 컴포넌트 (JJWT 0.12.x).
 * Secret Key 는 application.yml → ${JWT_SECRET} 에서 주입. 코드에 절대 하드코딩 금지.
 * Phase 3.2-c에서 토큰 검증(parseToken) 메서드를 이 클래스에 추가한다.
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;

    @Getter
    private final long accessTokenExpirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration-ms}") long accessTokenExpirationMs) {
        // Base64로 인코딩된 secret을 디코딩하여 HMAC-SHA 키 생성
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
    }

    /**
     * JWT Access Token 생성.
     * payload: sub=loginId, userId=userMasterId, iat=발급시각, exp=만료시각.
     * 비밀번호, 이메일 등 민감 정보는 payload에 절대 담지 않는다.
     */
    public String generateAccessToken(String loginId, Long userMasterId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpirationMs);

        String token = Jwts.builder()
                .subject(loginId)
                .claim("userId", userMasterId)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();

        // 보안 정책: 토큰 값은 로그에 절대 출력하지 않는다
        log.debug("Access Token 생성 완료: loginId={}, expiresAt={}", loginId, expiry);
        return token;
    }
}
