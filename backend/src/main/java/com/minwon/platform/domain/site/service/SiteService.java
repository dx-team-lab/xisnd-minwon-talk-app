package com.minwon.platform.domain.site.service;

import com.minwon.platform.common.exception.BusinessException;
import com.minwon.platform.common.util.CurrentUserProvider;
import com.minwon.platform.domain.activitylog.service.ActivityLogService;
import com.minwon.platform.domain.site.dto.SiteCreateRequest;
import com.minwon.platform.domain.site.dto.SiteResponse;
import com.minwon.platform.domain.site.dto.SiteUpdateRequest;
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
    private final ActivityLogService activityLogService;

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

    /**
     * 현장 등록.
     * 현장 저장 + 활동로그 INSERT가 하나의 트랜잭션으로 묶인다.
     */
    @Transactional
    public SiteResponse createSite(SiteCreateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("현장 등록 시작: siteName={}, actor={}", request.getSiteName(), actor);
        Site site = Site.create(request, actor);
        Site saved = siteRepository.save(site);
        activityLogService.record("CREATE", "tb_site", String.valueOf(saved.getSiteId()), saved.getSiteName());
        log.info("현장 등록 완료: siteId={}", saved.getSiteId());
        return SiteResponse.from(saved);
    }

    /**
     * 현장 수정.
     * 현장 업데이트 + 활동로그 INSERT가 하나의 트랜잭션으로 묶인다.
     */
    @Transactional
    public SiteResponse updateSite(Long siteId, SiteUpdateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("현장 수정 시작: siteId={}, actor={}", siteId, actor);
        Site site = siteRepository.findById(siteId)
                .filter(s -> "N".equals(s.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("SITE_NOT_FOUND", "현장을 찾을 수 없습니다."));
        site.updateInfo(request, actor);
        activityLogService.record("UPDATE", "tb_site", String.valueOf(siteId), site.getSiteName());
        log.info("현장 수정 완료: siteId={}", siteId);
        return SiteResponse.from(site);
    }

    /**
     * 현장 논리 삭제.
     * deleted_yn='Y', deleted_at=now(), deleted_by=actor 로 처리. 목록 조회에서 자동 제외된다.
     * 현장 삭제 + 활동로그 INSERT가 하나의 트랜잭션으로 묶인다.
     */
    @Transactional
    public void deleteSite(Long siteId) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("현장 삭제 시작: siteId={}, actor={}", siteId, actor);
        Site site = siteRepository.findById(siteId)
                .filter(s -> "N".equals(s.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("SITE_NOT_FOUND", "현장을 찾을 수 없습니다."));
        String siteName = site.getSiteName();
        site.softDelete(actor);
        activityLogService.record("DELETE", "tb_site", String.valueOf(siteId), siteName);
        log.info("현장 삭제 완료: siteId={}", siteId);
    }
}
