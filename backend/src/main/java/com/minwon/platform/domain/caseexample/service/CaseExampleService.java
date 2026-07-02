package com.minwon.platform.domain.caseexample.service;

import com.minwon.platform.common.exception.BusinessException;
import com.minwon.platform.common.util.CurrentUserProvider;
import com.minwon.platform.domain.activitylog.service.ActivityLogService;
import com.minwon.platform.domain.caseexample.dto.CaseExampleCreateRequest;
import com.minwon.platform.domain.caseexample.dto.CaseExampleResponse;
import com.minwon.platform.domain.caseexample.dto.CaseExampleUpdateRequest;
import com.minwon.platform.domain.caseexample.entity.CaseExample;
import com.minwon.platform.domain.caseexample.entity.CaseExampleRequest;
import com.minwon.platform.domain.caseexample.entity.CaseExampleType;
import com.minwon.platform.domain.caseexample.repository.CaseExampleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CaseExampleService {

    private final CaseExampleRepository caseExampleRepository;
    private final ActivityLogService activityLogService;

    /** 사례 목록 조회 — 활성(use_yn=Y) + 미삭제(deleted_yn=N), 등록일 내림차순. 배열 포함. */
    public List<CaseExampleResponse> getCaseExamples() {
        log.info("사례 목록 조회 시작");
        List<CaseExample> caseExamples =
                caseExampleRepository.findAllByUseYnAndDeletedYnOrderByCreatedAtDesc("Y", "N");
        log.info("사례 목록 조회 완료: {}건", caseExamples.size());
        return caseExamples.stream().map(CaseExampleResponse::from).toList();
    }

    /** 사례 상세 조회 — 비활성 또는 삭제된 사례는 404 처리. 배열 포함. */
    public CaseExampleResponse getCaseExample(Long caseExampleId) {
        log.info("사례 상세 조회 시작: caseExampleId={}", caseExampleId);
        CaseExample caseExample = findActiveById(caseExampleId);
        log.info("사례 상세 조회 완료: caseExampleId={}, siteName={}",
                caseExample.getCaseExampleId(), caseExample.getSiteName());
        return CaseExampleResponse.from(caseExample);
    }

    /**
     * 사례 등록.
     * 사례 본체 INSERT + 유형 배열 INSERT + 요청내용 배열 INSERT + 활동로그 INSERT
     * 이 전체가 하나의 @Transactional 으로 묶인다 (부분 저장 방지).
     */
    @Transactional
    public CaseExampleResponse createCaseExample(CaseExampleCreateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("사례 등록 시작: siteName={}, actor={}", request.getSiteName(), actor);

        CaseExample caseExample = CaseExample.create(request);

        // 유형 배열 등록 — cascade ALL로 caseExample 저장 시 함께 INSERT
        for (String typeCode : request.getTypeCodes()) {
            caseExample.getCaseExampleTypes().add(CaseExampleType.of(caseExample, typeCode));
        }

        // 요청내용 배열 등록 — 입력 순서(index)를 sort_order로 사용
        List<String> requestContents = request.getRequestContents();
        for (int i = 0; i < requestContents.size(); i++) {
            caseExample.getCaseExampleRequests().add(
                    CaseExampleRequest.of(caseExample, requestContents.get(i), i));
        }

        CaseExample saved = caseExampleRepository.save(caseExample);
        activityLogService.record("CREATE", "tb_case_example",
                String.valueOf(saved.getCaseExampleId()), saved.getSiteName());
        log.info("사례 등록 완료: caseExampleId={}", saved.getCaseExampleId());
        return CaseExampleResponse.from(saved);
    }

    /**
     * 사례 수정.
     * 본체 UPDATE + 배열 Replace-all(기존 전체 삭제 → 새 목록 삽입) + 활동로그 INSERT.
     * orphanRemoval=true 설정으로 clear() 시 자식 레코드가 자동 DELETE된다.
     * 배열 전체 교체 방식 선택 이유: 구현 단순, 버그 위험 낮음. 현재 규모에 적합.
     */
    @Transactional
    public CaseExampleResponse updateCaseExample(Long caseExampleId, CaseExampleUpdateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("사례 수정 시작: caseExampleId={}, actor={}", caseExampleId, actor);

        // 삭제된 사례는 수정 불가 (use_yn 조건 없이 deleted_yn만 확인 — 비활성도 수정 가능하게)
        CaseExample caseExample = caseExampleRepository.findById(caseExampleId)
                .filter(c -> "N".equals(c.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("CASE_EXAMPLE_NOT_FOUND", "사례를 찾을 수 없습니다."));

        caseExample.updateInfo(request);

        // 유형 배열 Replace-all
        caseExample.getCaseExampleTypes().clear();
        for (String typeCode : request.getTypeCodes()) {
            caseExample.getCaseExampleTypes().add(CaseExampleType.of(caseExample, typeCode));
        }

        // 요청내용 배열 Replace-all
        caseExample.getCaseExampleRequests().clear();
        List<String> requestContents = request.getRequestContents();
        for (int i = 0; i < requestContents.size(); i++) {
            caseExample.getCaseExampleRequests().add(
                    CaseExampleRequest.of(caseExample, requestContents.get(i), i));
        }

        activityLogService.record("UPDATE", "tb_case_example",
                String.valueOf(caseExampleId), caseExample.getSiteName());
        log.info("사례 수정 완료: caseExampleId={}", caseExampleId);
        return CaseExampleResponse.from(caseExample);
    }

    /**
     * 사례 논리 삭제.
     * deleted_yn='Y', deleted_at=now(), deleted_by=actor 로 처리.
     * 이후 목록 조회에서 자동 제외된다. 물리 삭제 금지.
     */
    @Transactional
    public void deleteCaseExample(Long caseExampleId) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("사례 삭제 시작: caseExampleId={}, actor={}", caseExampleId, actor);

        CaseExample caseExample = caseExampleRepository.findById(caseExampleId)
                .filter(c -> "N".equals(c.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("CASE_EXAMPLE_NOT_FOUND", "사례를 찾을 수 없습니다."));

        String siteName = caseExample.getSiteName();
        caseExample.softDelete(actor);
        activityLogService.record("DELETE", "tb_case_example",
                String.valueOf(caseExampleId), siteName);
        log.info("사례 삭제 완료: caseExampleId={}", caseExampleId);
    }

    /** 활성(use_yn=Y) + 미삭제(deleted_yn=N) 사례 단건 조회. 없으면 404. */
    private CaseExample findActiveById(Long caseExampleId) {
        return caseExampleRepository.findById(caseExampleId)
                .filter(c -> "Y".equals(c.getUseYn()) && "N".equals(c.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("CASE_EXAMPLE_NOT_FOUND", "사례를 찾을 수 없습니다."));
    }
}
