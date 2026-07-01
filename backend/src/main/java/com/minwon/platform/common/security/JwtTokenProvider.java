package com.minwon.platform.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT Access Token 생성/검증 컴포넌트 (JJWT 0.12.x).
 * Secret Key 는 application.yml → ${JWT_SECRET} 에서 주입. 코드에 절대 하드코딩 금지.
 * 보안 정책: 토큰 값 자체는 로그에 절대 출력하지 않는다.
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

    /**
     * 토큰 유효성 검증 (서명 + 만료 + 형식).
     * 실패 원인은 서버 로그로만 구분하고, 클라이언트에는 401로 통일 응답한다.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("만료된 JWT 토큰입니다.");
        } catch (SignatureException e) {
            log.warn("JWT 서명 검증 실패 — 위·변조 가능성이 있습니다.");
        } catch (MalformedJwtException e) {
            log.warn("형식이 올바르지 않은 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.warn("지원하지 않는 JWT 토큰 형식입니다.");
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT 토큰 처리 중 오류가 발생했습니다.");
        }
        return false;
    }

    /**
     * 유효한 토큰에서 loginId(subject) 추출.
     * validateToken() 통과 후에만 호출한다.
     */
    public String getLoginId(String token) {
        return parseClaims(token).getSubject();
    }

    /** 공통 파싱 — 서명 검증과 만료 검증이 동시에 수행된다. */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
