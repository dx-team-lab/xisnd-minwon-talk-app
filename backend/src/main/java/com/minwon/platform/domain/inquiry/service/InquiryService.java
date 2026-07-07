package com.minwon.platform.domain.inquiry.service;

import com.minwon.platform.common.exception.BusinessException;
import com.minwon.platform.common.util.CurrentUserProvider;
import com.minwon.platform.domain.activitylog.service.ActivityLogService;
import com.minwon.platform.domain.inquiry.dto.InquiryCreateRequest;
import com.minwon.platform.domain.inquiry.dto.InquiryResponse;
import com.minwon.platform.domain.inquiry.dto.InquiryUpdateRequest;
import com.minwon.platform.domain.inquiry.entity.Inquiry;
import com.minwon.platform.domain.inquiry.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 문의(Inquiry) 서비스.
 * 접근 권한은 SecurityConfig 메서드별 규칙으로 처리:
 * 등록(POST)은 MANAGER+ADMIN, 조회/수정/삭제는 ADMIN 전용.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    // 활동로그 target_site_name — 문의는 현장 개념이 없으므로 고정 표기
    private static final String ACTIVITY_TARGET_NAME = "문의";

    private final InquiryRepository inquiryRepository;
    private final ActivityLogService activityLogService;

    /** 문의 목록 조회 — 미삭제(deleted_yn=N)만, 등록일 내림차순 (ADMIN 전용) */
    public List<InquiryResponse> getInquiries() {
        log.info("문의 목록 조회 시작");
        List<Inquiry> inquiries = inquiryRepository.findAllByDeletedYnOrderByCreatedAtDesc("N");
        log.info("문의 목록 조회 완료: {}건", inquiries.size());
        return inquiries.stream().map(InquiryResponse::from).toList();
    }

    /** 문의 단건 조회 — 삭제된 문의는 404 처리 (ADMIN 전용) */
    public InquiryResponse getInquiry(Long inquiryId) {
        log.info("문의 상세 조회 시작: inquiryId={}", inquiryId);
        Inquiry inquiry = findNotDeletedById(inquiryId);
        log.info("문의 상세 조회 완료: inquiryId={}, statusCode={}",
                inquiry.getInquiryId(), inquiry.getStatusCode());
        return InquiryResponse.from(inquiry);
    }

    /**
     * 문의 등록 (MANAGER, ADMIN 허용).
     * 문의자(inquirerName)는 요청 본문이 아닌 JWT actor로 기록한다 (위조 방지).
     * 문의 저장 + 활동로그 INSERT가 하나의 트랜잭션으로 묶인다.
     */
    @Transactional
    public InquiryResponse createInquiry(InquiryCreateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("문의 등록 시작: actor={}", actor);

        Inquiry inquiry = Inquiry.create(request, actor);
        Inquiry saved = inquiryRepository.save(inquiry);
        activityLogService.record("CREATE", "tb_inquiry",
                String.valueOf(saved.getInquiryId()), ACTIVITY_TARGET_NAME);
        log.info("문의 등록 완료: inquiryId={}", saved.getInquiryId());
        return InquiryResponse.from(saved);
    }

    /**
     * 문의 수정 — 답변 등록/상태 변경 전용 (ADMIN 전용). 문의 원문은 변경되지 않는다.
     * 문의 업데이트 + 활동로그 INSERT가 하나의 트랜잭션으로 묶인다.
     */
    @Transactional
    public InquiryResponse updateInquiry(Long inquiryId, InquiryUpdateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("문의 수정 시작: inquiryId={}, actor={}", inquiryId, actor);

        Inquiry inquiry = findNotDeletedById(inquiryId);
        inquiry.updateInfo(request, actor);

        activityLogService.record("UPDATE", "tb_inquiry",
                String.valueOf(inquiryId), ACTIVITY_TARGET_NAME);
        log.info("문의 수정 완료: inquiryId={}, statusCode={}", inquiryId, inquiry.getStatusCode());
        return InquiryResponse.from(inquiry);
    }

    /**
     * 문의 논리 삭제 (ADMIN 전용).
     * deleted_yn='Y', deleted_at=now(), deleted_by=actor 로 처리. 목록 조회에서 자동 제외된다.
     * 문의 삭제 + 활동로그 INSERT가 하나의 트랜잭션으로 묶인다. 물리 삭제 금지.
     */
    @Transactional
    public void deleteInquiry(Long inquiryId) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("문의 삭제 시작: inquiryId={}, actor={}", inquiryId, actor);

        Inquiry inquiry = findNotDeletedById(inquiryId);
        inquiry.softDelete(actor);

        activityLogService.record("DELETE", "tb_inquiry",
                String.valueOf(inquiryId), ACTIVITY_TARGET_NAME);
        log.info("문의 삭제 완료: inquiryId={}", inquiryId);
    }

    /** 미삭제(deleted_yn=N) 문의 단건 조회. 없으면 404. */
    private Inquiry findNotDeletedById(Long inquiryId) {
        return inquiryRepository.findById(inquiryId)
                .filter(i -> "N".equals(i.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("INQUIRY_NOT_FOUND", "문의를 찾을 수 없습니다."));
    }
}
