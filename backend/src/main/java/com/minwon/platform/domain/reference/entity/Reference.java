package com.minwon.platform.domain.reference.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_reference (참고자료) 테이블 매핑 엔티티
 * Firebase references 컬렉션 → MySQL 전환
 * 파일(양식/예시)은 tb_reference_file(file_type: FORM/EXAMPLE)로 분리
 * when/who/why → SQL 예약어 충돌 방지를 위해 when_to_use/who_writes/why_written으로 변경
 */
@Entity
@Table(name = "tb_reference")
@Getter
@NoArgsConstructor
public class Reference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "firebase_id", length = 100)
    private String firebaseId;

    // 구분 (문서 제목)
    @Column(name = "title", length = 500, nullable = false)
    private String title;

    // 언제 사용하나요? (Firebase: when)
    @Column(name = "when_to_use", columnDefinition = "TEXT")
    private String whenToUse;

    // 누가 작성하나요? (Firebase: who)
    @Column(name = "who_writes", length = 500)
    private String whoWrites;

    // 왜 작성하나요? / 중요성 (Firebase: why)
    @Column(name = "why_written", columnDefinition = "TEXT")
    private String whyWritten;

    @Column(name = "use_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String useYn = "Y";

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
}
