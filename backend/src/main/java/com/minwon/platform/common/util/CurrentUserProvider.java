package com.minwon.platform.common.util;

/**
 * 현재 요청자(actor) 정보를 반환하는 공통 유틸.
 * Phase 3.3 JWT 연동 전까지 "system" 고정값을 반환한다.
 * JWT 도입 시 이 클래스만 수정하면 모든 쓰기 API에 자동 반영된다.
 */
public final class CurrentUserProvider {

    private CurrentUserProvider() {}

    /**
     * 현재 요청자 식별자 반환.
     * Phase 3.3: SecurityContextHolder.getContext().getAuthentication().getName() 으로 교체 예정.
     */
    public static String getCurrentActor() {
        return "system";
    }

    /**
     * 현재 요청자 이메일 반환.
     * Phase 3.3: SecurityContextHolder에서 실제 이메일로 교체 예정.
     */
    public static String getCurrentActorEmail() {
        return "system@system";
    }
}
