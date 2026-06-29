package com.minwon.platform.domain.user.entity;

import com.minwon.platform.domain.role.entity.RoleMaster;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_user_role (사용자-역할 매핑) 테이블 매핑 엔티티
 * 사용자 1명이 여러 역할을 가질 수 있는 다대다 연결 테이블
 * FK 2개: user_master_id(tb_user_master), role_id(tb_role_master)
 */
@Entity
@Table(name = "tb_user_role")
@Getter
@NoArgsConstructor
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_role_id")
    private Long userRoleId;

    // LAZY: 조회 시 UserMaster를 즉시 로딩하지 않고 실제 접근 시점에만 쿼리 → N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_master_id", nullable = false)
    private UserMaster userMaster;

    // LAZY: 조회 시 RoleMaster를 즉시 로딩하지 않고 실제 접근 시점에만 쿼리 → N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private RoleMaster roleMaster;

    @Column(name = "use_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String useYn = "Y";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
