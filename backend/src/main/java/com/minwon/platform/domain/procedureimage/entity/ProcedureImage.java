package com.minwon.platform.domain.procedureimage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_procedure_image (절차 이미지) 테이블 매핑 엔티티
 * Base64 DB 저장 제거, 파일 스토리지(S3 등) URL 방식으로 전환된 이미지 관리 테이블
 */
@Entity
@Table(name = "tb_procedure_image")
@Getter
@NoArgsConstructor
public class ProcedureImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "procedure_image_id")
    private Long procedureImageId;

    // S3 또는 파일 스토리지 URL
    @Column(name = "image_url", length = 2000, nullable = false)
    private String imageUrl;

    @Column(name = "file_name", length = 500)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

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
