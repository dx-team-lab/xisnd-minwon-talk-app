package com.minwon.platform.domain.inquiry.controller;

import com.minwon.platform.common.response.ApiResponse;
import com.minwon.platform.domain.inquiry.dto.InquiryCreateRequest;
import com.minwon.platform.domain.inquiry.dto.InquiryResponse;
import com.minwon.platform.domain.inquiry.dto.InquiryUpdateRequest;
import com.minwon.platform.domain.inquiry.service.InquiryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 문의 API — HTTP 메서드별 권한이 다르다 (SecurityConfig 메서드별 규칙).
 * 등록(POST): MANAGER, ADMIN 허용 / 조회·수정·삭제(GET, PUT, DELETE): ADMIN 전용.
 */
@Tag(name = "문의 API", description = "문의(tb_inquiry) 등록/조회/답변/삭제 API — 등록은 MANAGER+ADMIN, 그 외 ADMIN 전용")
@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @Operation(summary = "문의 등록 (MANAGER, ADMIN)",
               description = "새 문의를 등록합니다. 문의자 정보는 로그인 토큰에서 서버가 자동 기록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<InquiryResponse>> createInquiry(
            @Valid @RequestBody InquiryCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(inquiryService.createInquiry(request)));
    }

    @Operation(summary = "문의 목록 조회 (ADMIN 전용)",
               description = "문의 전체 목록을 등록일 내림차순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<InquiryResponse>>> getInquiries() {
        return ResponseEntity.ok(ApiResponse.ok(inquiryService.getInquiries()));
    }

    @Operation(summary = "문의 상세 조회 (ADMIN 전용)",
               description = "inquiryId로 문의 1건을 조회합니다. 존재하지 않으면 404를 반환합니다.")
    @GetMapping("/{inquiryId}")
    public ResponseEntity<ApiResponse<InquiryResponse>> getInquiry(@PathVariable Long inquiryId) {
        return ResponseEntity.ok(ApiResponse.ok(inquiryService.getInquiry(inquiryId)));
    }

    @Operation(summary = "문의 수정 — 답변/상태 변경 (ADMIN 전용)",
               description = "답변(replyContent) 등록 및 상태(statusCode) 변경을 처리합니다. 문의 원문은 수정할 수 없습니다.")
    @PutMapping("/{inquiryId}")
    public ResponseEntity<ApiResponse<InquiryResponse>> updateInquiry(
            @PathVariable Long inquiryId,
            @Valid @RequestBody InquiryUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(inquiryService.updateInquiry(inquiryId, request)));
    }

    @Operation(summary = "문의 삭제 (ADMIN 전용)",
               description = "inquiryId로 문의를 논리 삭제합니다. deleted_yn=Y로 처리되며 이후 목록에서 제외됩니다.")
    @DeleteMapping("/{inquiryId}")
    public ResponseEntity<ApiResponse<Void>> deleteInquiry(@PathVariable Long inquiryId) {
        inquiryService.deleteInquiry(inquiryId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
