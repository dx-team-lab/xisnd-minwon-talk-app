package com.minwon.platform.domain.site.controller;

import com.minwon.platform.common.response.ApiResponse;
import com.minwon.platform.domain.site.dto.SiteResponse;
import com.minwon.platform.domain.site.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "현장 API", description = "현장(tb_site) 조회 API")
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
}
