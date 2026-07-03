package com.minwon.platform.domain.site.repository;

import com.minwon.platform.domain.site.entity.SiteComplaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SiteComplaintRepository extends JpaRepository<SiteComplaint, Long> {

    // 특정 현장(siteId)의 미삭제(deleted_yn='N') 민원 목록 — sort_order 오름차순, 같은 순서면 최신 등록순
    List<SiteComplaint> findAllBySite_SiteIdAndDeletedYnOrderBySortOrderAscCreatedAtDesc(Long siteId, String deletedYn);

    // 특정 현장(siteId)에 속한 민원 단건 — 다른 현장의 민원 ID로는 조회되지 않도록 site_id 조건 포함
    Optional<SiteComplaint> findBySiteComplaintIdAndSite_SiteId(Long siteComplaintId, Long siteId);
}
