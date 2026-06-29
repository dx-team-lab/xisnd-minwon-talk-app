package com.minwon.platform.domain.site.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_site_image (현장 이미지) 테이블 매핑 엔티티
 * Base64 DB 저장 제거, S3/파일 스토리지 URL 방식으로 전환된 현장 이미지 관리 테이블
 */
@Entity
@Table(name = "tb_site_image")
@Getter
@NoArgsConstructor
public class SiteImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "site_image_id")
    private Long siteImageId;

    @Column(name = "firebase_id", length = 100)
    private String firebaseId;

    // LAZY: 조회 시 Site를 즉시 로딩하지 않고 실제 접근 시점에만 쿼리 → N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    // S3 또는 백엔드 파일 스토리지 URL
    @Column(name = "image_url", length = 2000, nullable = false)
    private String imageUrl;

    @Column(name = "file_name", length = 500, nullable = false)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

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
