package com.minwon.platform.domain.guide.controller;

import com.minwon.platform.common.response.ApiResponse;
import com.minwon.platform.domain.guide.dto.ResponseGuideCreateRequest;
import com.minwon.platform.domain.guide.dto.ResponseGuideResponse;
import com.minwon.platform.domain.guide.dto.ResponseGuideUpdateRequest;
import com.minwon.platform.domain.guide.service.ResponseGuideService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "대응가이드 API", description = "민원 대응 가이드(tb_response_guide) 조회 및 등록/수정/삭제 API")
@RestController
@RequestMapping("/api/v1/response-guides")
@RequiredArgsConstructor
public class ResponseGuideController {

    private final ResponseGuideService responseGuideService;

    @Operation(summary = "대응가이드 목록 조회",
               description = "활성(use_yn=Y) 대응 가이드 전체 목록을 등록일 내림차순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ResponseGuideResponse>>> getResponseGuides() {
        return ResponseEntity.ok(ApiResponse.ok(responseGuideService.getResponseGuides()));
    }

    @Operation(summary = "대응가이드 상세 조회",
               description = "responseGuideId로 대응 가이드 상세 정보를 조회합니다. 존재하지 않으면 404를 반환합니다.")
    @GetMapping("/{responseGuideId}")
    public ResponseEntity<ApiResponse<ResponseGuideResponse>> getResponseGuide(
            @PathVariable Long responseGuideId) {
        return ResponseEntity.ok(ApiResponse.ok(responseGuideService.getResponseGuide(responseGuideId)));
    }

    @Operation(summary = "대응가이드 등록",
               description = "새 대응 가이드를 등록합니다. regionCode, phaseCode, causeContent, actionContent는 필수입니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<ResponseGuideResponse>> createResponseGuide(
            @Valid @RequestBody ResponseGuideCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(responseGuideService.createResponseGuide(request)));
    }

    @Operation(summary = "대응가이드 수정",
               description = "responseGuideId로 대응 가이드 정보를 수정합니다.")
    @PutMapping("/{responseGuideId}")
    public ResponseEntity<ApiResponse<ResponseGuideResponse>> updateResponseGuide(
            @PathVariable Long responseGuideId,
            @Valid @RequestBody ResponseGuideUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(responseGuideService.updateResponseGuide(responseGuideId, request)));
    }

    @Operation(summary = "대응가이드 삭제",
               description = "responseGuideId로 대응 가이드를 논리 삭제합니다. deleted_yn=Y로 처리되며 이후 목록에서 제외됩니다.")
    @DeleteMapping("/{responseGuideId}")
    public ResponseEntity<ApiResponse<Void>> deleteResponseGuide(@PathVariable Long responseGuideId) {
        responseGuideService.deleteResponseGuide(responseGuideId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
