package com.minwon.platform.domain.caseexample.controller;

import com.minwon.platform.common.response.ApiResponse;
import com.minwon.platform.domain.caseexample.dto.CaseExampleResponse;
import com.minwon.platform.domain.caseexample.service.CaseExampleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "사례 API", description = "민원 사례(tb_case_example) 조회 API")
@RestController
@RequestMapping("/api/v1/case-examples")
@RequiredArgsConstructor
public class CaseExampleController {

    private final CaseExampleService caseExampleService;

    @Operation(summary = "사례 목록 조회",
               description = "활성(use_yn=Y) 민원 사례 전체 목록을 등록일 내림차순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CaseExampleResponse>>> getCaseExamples() {
        return ResponseEntity.ok(ApiResponse.ok(caseExampleService.getCaseExamples()));
    }

    @Operation(summary = "사례 상세 조회",
               description = "caseExampleId로 사례 상세 정보를 조회합니다. 존재하지 않으면 404를 반환합니다.")
    @GetMapping("/{caseExampleId}")
    public ResponseEntity<ApiResponse<CaseExampleResponse>> getCaseExample(
            @PathVariable Long caseExampleId) {
        return ResponseEntity.ok(ApiResponse.ok(caseExampleService.getCaseExample(caseExampleId)));
    }
}
