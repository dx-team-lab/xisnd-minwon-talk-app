package com.minwon.platform.domain.reference.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_reference_file (참고자료 파일) 테이블 매핑 엔티티
 * Firebase references/{id}/forms[], examples[] → 정규화된 파일 관리 테이블
 * file_type: FORM(양식 파일) / EXAMPLE(예시 파일) 구분
 */
@Entity
@Table(name = "tb_reference_file")
@Getter
@NoArgsConstructor
public class ReferenceFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reference_file_id")
    private Long referenceFileId;

    // LAZY: 조회 시 Reference를 즉시 로딩하지 않고 실제 접근 시점에만 쿼리 → N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_id", nullable = false)
    private Reference reference;

    // 파일 구분: FORM(양식 템플릿) / EXAMPLE(작성 예시)
    @Column(name = "file_type", length = 20, nullable = false)
    private String fileType;

    @Column(name = "file_name", length = 500, nullable = false)
    private String fileName;

    // Firebase Storage 또는 S3 URL
    @Column(name = "file_url", length = 2000, nullable = false)
    private String fileUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

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
