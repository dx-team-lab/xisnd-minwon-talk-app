package com.minwon.platform.domain.guide.service;

import com.minwon.platform.common.exception.BusinessException;
import com.minwon.platform.common.util.CurrentUserProvider;
import com.minwon.platform.domain.activitylog.service.ActivityLogService;
import com.minwon.platform.domain.guide.dto.ResponseGuideCreateRequest;
import com.minwon.platform.domain.guide.dto.ResponseGuideResponse;
import com.minwon.platform.domain.guide.dto.ResponseGuideUpdateRequest;
import com.minwon.platform.domain.guide.entity.ResponseGuide;
import com.minwon.platform.domain.guide.repository.ResponseGuideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResponseGuideService {

    private final ResponseGuideRepository responseGuideRepository;
    private final ActivityLogService activityLogService;

    /** 대응가이드 목록 조회 — 활성(use_yn=Y) + 미삭제(deleted_yn=N), 등록일 내림차순. */
    public List<ResponseGuideResponse> getResponseGuides() {
        log.info("대응가이드 목록 조회 시작");
        List<ResponseGuide> guides =
                responseGuideRepository.findAllByUseYnAndDeletedYnOrderByCreatedAtDesc("Y", "N");
        log.info("대응가이드 목록 조회 완료: {}건", guides.size());
        return guides.stream().map(ResponseGuideResponse::from).toList();
    }

    /** 대응가이드 상세 조회 — 비활성 또는 삭제된 항목은 404 처리. */
    public ResponseGuideResponse getResponseGuide(Long responseGuideId) {
        log.info("대응가이드 상세 조회 시작: responseGuideId={}", responseGuideId);
        ResponseGuide guide = findActiveById(responseGuideId);
        log.info("대응가이드 상세 조회 완료: responseGuideId={}, regionCode={}",
                guide.getResponseGuideId(), guide.getRegionCode());
        return ResponseGuideResponse.from(guide);
    }

    /**
     * 대응가이드 등록.
     * 본체 INSERT + 활동로그 INSERT가 하나의 @Transactional로 묶인다.
     */
    @Transactional
    public ResponseGuideResponse createResponseGuide(ResponseGuideCreateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("대응가이드 등록 시작: regionCode={}, phaseCode={}, actor={}",
                request.getRegionCode(), request.getPhaseCode(), actor);

        ResponseGuide guide = ResponseGuide.create(request);
        ResponseGuide saved = responseGuideRepository.save(guide);

        activityLogService.record("CREATE", "tb_response_guide",
                String.valueOf(saved.getResponseGuideId()),
                saved.getRegionCode() + "-" + saved.getPhaseCode());
        log.info("대응가이드 등록 완료: responseGuideId={}", saved.getResponseGuideId());
        return ResponseGuideResponse.from(saved);
    }

    /**
     * 대응가이드 수정.
     * 본체 UPDATE + 활동로그 INSERT가 하나의 @Transactional로 묶인다.
     */
    @Transactional
    public ResponseGuideResponse updateResponseGuide(Long responseGuideId, ResponseGuideUpdateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("대응가이드 수정 시작: responseGuideId={}, actor={}", responseGuideId, actor);

        ResponseGuide guide = responseGuideRepository.findById(responseGuideId)
                .filter(g -> "N".equals(g.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("RESPONSE_GUIDE_NOT_FOUND", "대응 가이드를 찾을 수 없습니다."));

        guide.updateInfo(request);

        activityLogService.record("UPDATE", "tb_response_guide",
                String.valueOf(responseGuideId),
                guide.getRegionCode() + "-" + guide.getPhaseCode());
        log.info("대응가이드 수정 완료: responseGuideId={}", responseGuideId);
        return ResponseGuideResponse.from(guide);
    }

    /**
     * 대응가이드 논리 삭제.
     * deleted_yn='Y', deleted_at=now(), deleted_by=actor로 처리.
     * 물리 삭제 금지.
     */
    @Transactional
    public void deleteResponseGuide(Long responseGuideId) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("대응가이드 삭제 시작: responseGuideId={}, actor={}", responseGuideId, actor);

        ResponseGuide guide = responseGuideRepository.findById(responseGuideId)
                .filter(g -> "N".equals(g.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("RESPONSE_GUIDE_NOT_FOUND", "대응 가이드를 찾을 수 없습니다."));

        String label = guide.getRegionCode() + "-" + guide.getPhaseCode();
        guide.softDelete(actor);
        activityLogService.record("DELETE", "tb_response_guide",
                String.valueOf(responseGuideId), label);
        log.info("대응가이드 삭제 완료: responseGuideId={}", responseGuideId);
    }

    /** 활성(use_yn=Y) + 미삭제(deleted_yn=N) 대응가이드 단건 조회. 없으면 404. */
    private ResponseGuide findActiveById(Long responseGuideId) {
        return responseGuideRepository.findById(responseGuideId)
                .filter(g -> "Y".equals(g.getUseYn()) && "N".equals(g.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("RESPONSE_GUIDE_NOT_FOUND", "대응 가이드를 찾을 수 없습니다."));
    }
}
