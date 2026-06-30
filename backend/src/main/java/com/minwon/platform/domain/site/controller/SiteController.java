package com.minwon.platform.domain.site.controller;

import com.minwon.platform.common.response.ApiResponse;
import com.minwon.platform.domain.site.dto.SiteCreateRequest;
import com.minwon.platform.domain.site.dto.SiteResponse;
import com.minwon.platform.domain.site.dto.SiteUpdateRequest;
import com.minwon.platform.domain.site.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "현장 API", description = "현장(tb_site) 조회 및 등록/수정/삭제 API")
@RestController
@RequestMapping("/api/v1/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @Operation(summary = "현장 목록 조회", description = "활성(use_yn=Y) 현장 전체 목록을 sort_order 오름차순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SiteResponse>>> getSites() {
        return ResponseEntity.ok(ApiResponse.ok(siteService.getSites()));
    }

    @Operation(summary = "현장 상세 조회", description = "siteId로 현장 상세 정보를 조회합니다. 존재하지 않으면 404를 반환합니다.")
    @GetMapping("/{siteId}")
    public ResponseEntity<ApiResponse<SiteResponse>> getSite(@PathVariable Long siteId) {
        return ResponseEntity.ok(ApiResponse.ok(siteService.getSite(siteId)));
    }

    @Operation(summary = "현장 등록", description = "새 현장을 등록합니다. siteName은 필수입니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<SiteResponse>> createSite(@Valid @RequestBody SiteCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(siteService.createSite(request)));
    }

    @Operation(summary = "현장 수정", description = "siteId로 현장 정보를 수정합니다. 존재하지 않거나 삭제된 현장이면 404를 반환합니다.")
    @PutMapping("/{siteId}")
    public ResponseEntity<ApiResponse<SiteResponse>> updateSite(
            @PathVariable Long siteId,
            @Valid @RequestBody SiteUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(siteService.updateSite(siteId, request)));
    }

    @Operation(summary = "현장 삭제", description = "siteId로 현장을 논리 삭제합니다. deleted_yn=Y로 처리되며, 이후 목록 조회에서 제외됩니다.")
    @DeleteMapping("/{siteId}")
    public ResponseEntity<ApiResponse<Void>> deleteSite(@PathVariable Long siteId) {
        siteService.deleteSite(siteId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
