package com.minwon.platform.domain.caseexample.service;

import com.minwon.platform.common.exception.BusinessException;
import com.minwon.platform.domain.caseexample.dto.CaseExampleResponse;
import com.minwon.platform.domain.caseexample.entity.CaseExample;
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

    /** 사례 목록 조회 — 활성(use_yn=Y) + 미삭제(deleted_yn=N) 사례만, 등록일 내림차순 */
    public List<CaseExampleResponse> getCaseExamples() {
        log.info("사례 목록 조회 시작");
        List<CaseExample> caseExamples =
                caseExampleRepository.findAllByUseYnAndDeletedYnOrderByCreatedAtDesc("Y", "N");
        log.info("사례 목록 조회 완료: {}건", caseExamples.size());
        return caseExamples.stream()
                .map(CaseExampleResponse::from)
                .toList();
    }

    /** 사례 상세 조회 — 비활성 또는 삭제된 사례는 404 처리 */
    public CaseExampleResponse getCaseExample(Long caseExampleId) {
        log.info("사례 상세 조회 시작: caseExampleId={}", caseExampleId);
        CaseExample caseExample = caseExampleRepository.findById(caseExampleId)
                .filter(c -> "Y".equals(c.getUseYn()) && "N".equals(c.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("CASE_EXAMPLE_NOT_FOUND", "사례를 찾을 수 없습니다."));
        log.info("사례 상세 조회 완료: caseExampleId={}, siteName={}",
                caseExample.getCaseExampleId(), caseExample.getSiteName());
        return CaseExampleResponse.from(caseExample);
    }
}
