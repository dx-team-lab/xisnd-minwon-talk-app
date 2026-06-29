package com.minwon.platform.domain.site.repository;

import com.minwon.platform.domain.site.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SiteRepository extends JpaRepository<Site, Long> {

    // use_yn='Y' + deleted_yn='N' 인 현장만 sort_order 오름차순으로 조회
    List<Site> findAllByUseYnAndDeletedYnOrderBySortOrderAsc(String useYn, String deletedYn);
}
