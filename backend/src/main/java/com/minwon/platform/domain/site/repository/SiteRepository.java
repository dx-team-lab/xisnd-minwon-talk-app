package com.minwon.platform.domain.site.repository;

import com.minwon.platform.domain.site.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteRepository extends JpaRepository<Site, Long> {
    // 현재 단계는 기본 CRUD만 선언. 조회 메서드는 다음 단계에서 추가.
}
