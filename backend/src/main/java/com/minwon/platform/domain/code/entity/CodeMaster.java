package com.minwon.platform.domain.code.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_code_master (공통 코드) 테이블 매핑 엔티티
 * 지역구분·공정단계·민원유형 등 전체 코드성 데이터를 관리하는 공통 코드 테이블
 */
@Entity
@Table(name = "tb_code_master")
@Getter
@NoArgsConstructor
public class CodeMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code_master_id")
    private Long codeMasterId;

    // 예: REGION_TYPE, PHASE, COMPLAINT_STATUS 등 코드 그룹 이름
    @Column(name = "code_group_name", length = 100, nullable = false)
    private String codeGroupName;

    // 예: RESIDENTIAL, IN_PROGRESS 등 실제 저장되는 코드값 (영문)
    @Column(name = "code_value", length = 100, nullable = false)
    private String codeValue;

    // 예: 주거지역, 진행중 등 화면에 보여줄 한글 이름
    @Column(name = "code_name", length = 100, nullable = false)
    private String codeName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "use_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String useYn = "Y";

    // 공통 감사 컬럼
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
