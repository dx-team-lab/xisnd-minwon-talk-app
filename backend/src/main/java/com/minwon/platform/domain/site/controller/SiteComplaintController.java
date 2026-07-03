package com.minwon.platform.domain.site.controller;

import com.minwon.platform.common.response.ApiResponse;
import com.minwon.platform.domain.site.dto.SiteComplaintCreateRequest;
import com.minwon.platform.domain.site.dto.SiteComplaintResponse;
import com.minwon.platform.domain.site.dto.SiteComplaintUpdateRequest;
import com.minwon.platform.domain.site.service.SiteComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 현장 민원 API — 현장(Site)의 하위 리소스 경로(/sites/{siteId}/complaints)로 제공.
 * 모든 작업에서 부모 현장 존재 여부를 서버에서 검증한다 (없으면 SITE_NOT_FOUND 404).
 */
@Tag(name = "현장 민원 API", description = "현장 하위 민원(tb_site_complaint) 조회 및 등록/수정/삭제 API")
@RestController
@RequestMapping("/api/v1/sites/{siteId}/complaints")
@RequiredArgsConstructor
public class SiteComplaintController {

    private final SiteComplaintService siteComplaintService;

    @Operation(summary = "현장 민원 목록 조회",
               description = "특정 현장(siteId)의 민원 목록을 조회합니다. 현장이 없으면 404를 반환합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SiteComplaintResponse>>> getSiteComplaints(
            @PathVariable Long siteId) {
        return ResponseEntity.ok(ApiResponse.ok(siteComplaintService.getSiteComplaints(siteId)));
    }

    @Operation(summary = "현장 민원 상세 조회",
               description = "특정 현장(siteId)의 민원 1건을 조회합니다. 현장 또는 민원이 없으면 404를 반환합니다.")
    @GetMapping("/{complaintId}")
    public ResponseEntity<ApiResponse<SiteComplaintResponse>> getSiteComplaint(
            @PathVariable Long siteId,
            @PathVariable Long complaintId) {
        return ResponseEntity.ok(ApiResponse.ok(siteComplaintService.getSiteComplaint(siteId, complaintId)));
    }

    @Operation(summary = "현장 민원 등록",
               description = "특정 현장(siteId)에 새 민원을 등록합니다. complaintNumber, complainant는 필수입니다. "
                       + "현장이 존재하지 않으면 404(SITE_NOT_FOUND)를 반환합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<SiteComplaintResponse>> createSiteComplaint(
            @PathVariable Long siteId,
            @Valid @RequestBody SiteComplaintCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(siteComplaintService.createSiteComplaint(siteId, request)));
    }

    @Operation(summary = "현장 민원 수정",
               description = "특정 현장(siteId)의 민원 정보를 수정합니다. 유사사례 목록은 전체 교체됩니다.")
    @PutMapping("/{complaintId}")
    public ResponseEntity<ApiResponse<SiteComplaintResponse>> updateSiteComplaint(
            @PathVariable Long siteId,
            @PathVariable Long complaintId,
            @Valid @RequestBody SiteComplaintUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(siteComplaintService.updateSiteComplaint(siteId, complaintId, request)));
    }

    @Operation(summary = "현장 민원 삭제",
               description = "특정 현장(siteId)의 민원을 논리 삭제합니다. deleted_yn=Y로 처리되며 이후 목록에서 제외됩니다.")
    @DeleteMapping("/{complaintId}")
    public ResponseEntity<ApiResponse<Void>> deleteSiteComplaint(
            @PathVariable Long siteId,
            @PathVariable Long complaintId) {
        siteComplaintService.deleteSiteComplaint(siteId, complaintId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
