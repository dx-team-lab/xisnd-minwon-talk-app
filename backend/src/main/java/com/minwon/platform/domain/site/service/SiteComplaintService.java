package com.minwon.platform.domain.site.service;

import com.minwon.platform.common.exception.BusinessException;
import com.minwon.platform.common.util.CurrentUserProvider;
import com.minwon.platform.domain.activitylog.service.ActivityLogService;
import com.minwon.platform.domain.site.dto.SiteComplaintCreateRequest;
import com.minwon.platform.domain.site.dto.SiteComplaintResponse;
import com.minwon.platform.domain.site.dto.SiteComplaintSimilarCaseDto;
import com.minwon.platform.domain.site.dto.SiteComplaintUpdateRequest;
import com.minwon.platform.domain.site.entity.Site;
import com.minwon.platform.domain.site.entity.SiteComplaint;
import com.minwon.platform.domain.site.entity.SiteComplaintSimilarCase;
import com.minwon.platform.domain.site.repository.SiteComplaintRepository;
import com.minwon.platform.domain.site.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 현장 민원(SiteComplaint) 서비스.
 * 현장(Site)에 종속된 자식 리소스이므로 모든 작업에서 부모 현장의 존재·미삭제를 먼저 검증한다.
 * 잘못된 siteId로 자식 데이터가 생성/조회되는 것을 서버에서 차단 (SITE_NOT_FOUND 404).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SiteComplaintService {

    private final SiteRepository siteRepository;
    private final SiteComplaintRepository siteComplaintRepository;
    private final ActivityLogService activityLogService;

    /** 특정 현장의 민원 목록 조회 — 미삭제(deleted_yn=N)만, sort_order 오름차순. 유사사례 포함. */
    public List<SiteComplaintResponse> getSiteComplaints(Long siteId) {
        log.info("현장 민원 목록 조회 시작: siteId={}", siteId);
        findParentSite(siteId);
        List<SiteComplaint> complaints = siteComplaintRepository
                .findAllBySite_SiteIdAndDeletedYnOrderBySortOrderAscCreatedAtDesc(siteId, "N");
        log.info("현장 민원 목록 조회 완료: siteId={}, {}건", siteId, complaints.size());
        return complaints.stream().map(SiteComplaintResponse::from).toList();
    }

    /** 특정 현장의 민원 단건 조회 — 삭제되었거나 다른 현장 소속이면 404 처리. 유사사례 포함. */
    public SiteComplaintResponse getSiteComplaint(Long siteId, Long complaintId) {
        log.info("현장 민원 상세 조회 시작: siteId={}, complaintId={}", siteId, complaintId);
        findParentSite(siteId);
        SiteComplaint complaint = findComplaint(siteId, complaintId);
        log.info("현장 민원 상세 조회 완료: complaintId={}, complaintNumber={}",
                complaint.getSiteComplaintId(), complaint.getComplaintNumber());
        return SiteComplaintResponse.from(complaint);
    }

    /**
     * 현장 민원 등록.
     * 부모 현장 존재 검증 → 민원 본체 INSERT + 유사사례 배열 INSERT + 활동로그 INSERT
     * 이 전체가 하나의 @Transactional 으로 묶인다 (부분 저장 방지).
     */
    @Transactional
    public SiteComplaintResponse createSiteComplaint(Long siteId, SiteComplaintCreateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("현장 민원 등록 시작: siteId={}, complaintNumber={}, actor={}",
                siteId, request.getComplaintNumber(), actor);

        Site site = findParentSite(siteId);
        SiteComplaint complaint = SiteComplaint.create(request, site);

        // 유사사례 배열 등록 — cascade ALL로 complaint 저장 시 함께 INSERT, 입력 순서(index)를 sort_order로 사용
        List<SiteComplaintSimilarCaseDto> similarCases = request.getSimilarCases();
        for (int i = 0; i < similarCases.size(); i++) {
            complaint.getSimilarCases().add(SiteComplaintSimilarCase.of(
                    complaint, similarCases.get(i).getCaseText(), similarCases.get(i).getCaseUrl(), i));
        }

        SiteComplaint saved = siteComplaintRepository.save(complaint);
        activityLogService.record("CREATE", "tb_site_complaint",
                String.valueOf(saved.getSiteComplaintId()), site.getSiteName());
        log.info("현장 민원 등록 완료: complaintId={}", saved.getSiteComplaintId());
        return SiteComplaintResponse.from(saved);
    }

    /**
     * 현장 민원 수정.
     * 부모 현장 존재 검증 → 본체 UPDATE + 유사사례 Replace-all(기존 전체 삭제 → 새 목록 삽입) + 활동로그 INSERT.
     * orphanRemoval=true 설정으로 clear() 시 자식 레코드가 자동 DELETE된다.
     */
    @Transactional
    public SiteComplaintResponse updateSiteComplaint(Long siteId, Long complaintId,
                                                     SiteComplaintUpdateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("현장 민원 수정 시작: siteId={}, complaintId={}, actor={}", siteId, complaintId, actor);

        Site site = findParentSite(siteId);
        SiteComplaint complaint = findComplaint(siteId, complaintId);
        complaint.updateInfo(request);

        // 유사사례 배열 Replace-all
        complaint.getSimilarCases().clear();
        List<SiteComplaintSimilarCaseDto> similarCases = request.getSimilarCases();
        for (int i = 0; i < similarCases.size(); i++) {
            complaint.getSimilarCases().add(SiteComplaintSimilarCase.of(
                    complaint, similarCases.get(i).getCaseText(), similarCases.get(i).getCaseUrl(), i));
        }

        activityLogService.record("UPDATE", "tb_site_complaint",
                String.valueOf(complaintId), site.getSiteName());
        log.info("현장 민원 수정 완료: complaintId={}", complaintId);
        return SiteComplaintResponse.from(complaint);
    }

    /**
     * 현장 민원 논리 삭제.
     * deleted_yn='Y', deleted_at=now(), deleted_by=actor 로 처리. 목록 조회에서 자동 제외된다.
     * 부모 현장 검증 + 민원 삭제 + 활동로그 INSERT가 하나의 트랜잭션으로 묶인다. 물리 삭제 금지.
     */
    @Transactional
    public void deleteSiteComplaint(Long siteId, Long complaintId) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("현장 민원 삭제 시작: siteId={}, complaintId={}, actor={}", siteId, complaintId, actor);

        Site site = findParentSite(siteId);
        SiteComplaint complaint = findComplaint(siteId, complaintId);
        complaint.softDelete(actor);

        activityLogService.record("DELETE", "tb_site_complaint",
                String.valueOf(complaintId), site.getSiteName());
        log.info("현장 민원 삭제 완료: complaintId={}", complaintId);
    }

    /**
     * 부모 현장 검증 — 존재하고 삭제되지 않았는지(deleted_yn=N) 확인. 없으면 404.
     * use_yn(비활성)은 조건에 넣지 않는다: 비활성 현장의 민원도 조회·관리 가능하도록 (SiteService 수정/삭제와 동일 기준).
     */
    private Site findParentSite(Long siteId) {
        return siteRepository.findById(siteId)
                .filter(s -> "N".equals(s.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("SITE_NOT_FOUND", "현장을 찾을 수 없습니다."));
    }

    /** 해당 현장 소속 + 미삭제(deleted_yn=N) 민원 단건 조회. 없으면 404. */
    private SiteComplaint findComplaint(Long siteId, Long complaintId) {
        return siteComplaintRepository.findBySiteComplaintIdAndSite_SiteId(complaintId, siteId)
                .filter(c -> "N".equals(c.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("SITE_COMPLAINT_NOT_FOUND", "현장 민원을 찾을 수 없습니다."));
    }
}
