package com.minwon.platform.domain.inquiry.repository;

import com.minwon.platform.domain.inquiry.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    // 미삭제(deleted_yn='N') 문의만 등록일 내림차순으로 조회 (Firebase 목록 정렬과 동일)
    List<Inquiry> findAllByDeletedYnOrderByCreatedAtDesc(String deletedYn);
}
