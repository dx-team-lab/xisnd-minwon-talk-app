package com.minwon.platform.domain.caseexample.controller;

import com.minwon.platform.common.response.ApiResponse;
import com.minwon.platform.domain.caseexample.dto.CaseExampleCreateRequest;
import com.minwon.platform.domain.caseexample.dto.CaseExampleResponse;
import com.minwon.platform.domain.caseexample.dto.CaseExampleUpdateRequest;
import com.minwon.platform.domain.caseexample.service.CaseExampleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "사례 API", description = "민원 사례(tb_case_example) 조회 및 등록/수정/삭제 API")
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

    @Operation(summary = "사례 등록",
               description = "새 민원 사례를 등록합니다. siteName, regionCode, phaseCode, complainant는 필수입니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<CaseExampleResponse>> createCaseExample(
            @Valid @RequestBody CaseExampleCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(caseExampleService.createCaseExample(request)));
    }

    @Operation(summary = "사례 수정",
               description = "caseExampleId로 사례 정보를 수정합니다. 유형/요청내용은 전체 교체됩니다.")
    @PutMapping("/{caseExampleId}")
    public ResponseEntity<ApiResponse<CaseExampleResponse>> updateCaseExample(
            @PathVariable Long caseExampleId,
            @Valid @RequestBody CaseExampleUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(caseExampleService.updateCaseExample(caseExampleId, request)));
    }

    @Operation(summary = "사례 삭제",
               description = "caseExampleId로 사례를 논리 삭제합니다. deleted_yn=Y로 처리되며 이후 목록에서 제외됩니다.")
    @DeleteMapping("/{caseExampleId}")
    public ResponseEntity<ApiResponse<Void>> deleteCaseExample(@PathVariable Long caseExampleId) {
        caseExampleService.deleteCaseExample(caseExampleId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
