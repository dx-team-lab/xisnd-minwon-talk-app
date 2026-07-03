package com.minwon.platform.domain.guide.repository;

import com.minwon.platform.domain.guide.entity.ResponseGuide;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResponseGuideRepository extends JpaRepository<ResponseGuide, Long> {

    /**
     * 목록 조회 — 활성(use_yn=Y) + 미삭제(deleted_yn=N), 등록일 내림차순.
     * tb_response_guide는 자식 배열 테이블이 없으므로 @BatchSize/@EntityGraph 불필요.
     */
    List<ResponseGuide> findAllByUseYnAndDeletedYnOrderByCreatedAtDesc(String useYn, String deletedYn);
}
