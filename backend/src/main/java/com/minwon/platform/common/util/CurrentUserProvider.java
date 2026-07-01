package com.minwon.platform.common.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * 현재 요청자(actor) 정보를 반환하는 공통 유틸.
 * JWT 인증이 완료된 경우 SecurityContextHolder에서 loginId를 꺼내 반환한다.
 * 인증 정보가 없는 경우(시스템 배치, 초기화 등)는 "system"으로 fallback한다.
 * 이 클래스만 수정하면 모든 쓰기 API의 created_by/updated_by에 자동 반영된다.
 */
public final class CurrentUserProvider {

    private CurrentUserProvider() {}

    /**
     * 현재 요청자 식별자(loginId) 반환.
     * 인증 완료: JWT의 subject(loginId) 반환.
     * 인증 없음: "system" 반환 (배치/시스템 작업 fallback).
     */
    public static String getCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName();
        }
        return "system";
    }

    /**
     * 현재 요청자 이메일 반환.
     * Phase 3.2-d에서 UserDetails와 연동 후 실제 이메일로 교체 예정.
     */
    public static String getCurrentActorEmail() {
        return "system@system";
    }
}
