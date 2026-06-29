package com.minwon.platform.domain.site.service;

import com.minwon.platform.common.exception.BusinessException;
import com.minwon.platform.domain.site.dto.SiteResponse;
import com.minwon.platform.domain.site.entity.Site;
import com.minwon.platform.domain.site.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SiteService {

    private final SiteRepository siteRepository;

    /** 현장 목록 조회 — 활성(use_yn=Y) + 미삭제(deleted_yn=N) 현장만, sort_order 오름차순 */
    public List<SiteResponse> getSites() {
        log.info("현장 목록 조회 시작");
        List<Site> sites = siteRepository.findAllByUseYnAndDeletedYnOrderBySortOrderAsc("Y", "N");
        log.info("현장 목록 조회 완료: {}건", sites.size());
        return sites.stream()
                .map(SiteResponse::from)
                .toList();
    }

    /** 현장 상세 조회 — 비활성 또는 삭제된 현장은 404 처리 */
    public SiteResponse getSite(Long siteId) {
        log.info("현장 상세 조회 시작: siteId={}", siteId);
        Site site = siteRepository.findById(siteId)
                .filter(s -> "Y".equals(s.getUseYn()) && "N".equals(s.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("SITE_NOT_FOUND", "현장을 찾을 수 없습니다."));
        log.info("현장 상세 조회 완료: siteId={}, siteName={}", site.getSiteId(), site.getSiteName());
        return SiteResponse.from(site);
    }
}
