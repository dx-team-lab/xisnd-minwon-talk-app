package com.minwon.platform.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * tb_user_master (사용자) 테이블 매핑 엔티티
 * Firebase users 컬렉션 → MySQL 전환
 * password_hash: BCrypt 단방향 해시값만 저장 (인증 로직은 Security 레이어에서 처리)
 */
@Entity
@Table(name = "tb_user_master")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_master_id")
    private Long userMasterId;

    @Column(name = "firebase_id", length = 100)
    private String firebaseId;

    // 로그인 식별자 (email과 별도 유지)
    @Column(name = "login_id", length = 100, nullable = false, unique = true)
    private String loginId;

    // BCrypt 해시값만 저장 — 평문 비밀번호 절대 금지
    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "email", length = 255, nullable = false)
    private String email;

    // 화면 표시명 (Firebase displayName)
    @Column(name = "display_name", length = 100)
    private String displayName;

    // 실명 (Firebase name, NULL 허용)
    @Column(name = "name", length = 100)
    private String name;

    // 관리자 승인 여부 (미승인 사용자는 데이터 접근 불가)
    @Builder.Default
    @Column(name = "approved_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String approvedYn = "N";

    @Builder.Default
    @Column(name = "use_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String useYn = "Y";

    @Builder.Default
    @Column(name = "deleted_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String deletedYn = "N";

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", length = 100)
    private String deletedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 사용자 생성 팩토리 메서드.
     * passwordHash는 반드시 BCrypt 해시값이어야 한다. 평문을 넘기면 안 된다.
     */
    public static UserMaster create(String loginId, String passwordHash, String email, String displayName) {
        return UserMaster.builder()
                .loginId(loginId)
                .passwordHash(passwordHash)
                .email(email)
                .displayName(displayName)
                .approvedYn("Y")
                .useYn("Y")
                .deletedYn("N")
                .createdBy("system")
                .updatedBy("system")
                .build();
    }
}
