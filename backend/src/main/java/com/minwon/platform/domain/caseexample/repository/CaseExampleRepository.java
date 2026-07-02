package com.minwon.platform.domain.caseexample.repository;

import com.minwon.platform.domain.caseexample.entity.CaseExample;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaseExampleRepository extends JpaRepository<CaseExample, Long> {

    /**
     * 목록 조회 — 자식 컬렉션(caseExampleTypes, caseExampleRequests)은 @BatchSize로 N+1 방지.
     * 엔티티에 @BatchSize(size=100)이 설정되어 있어 컬렉션 접근 시 IN절 배치 쿼리가 자동 실행됨.
     */
    List<CaseExample> findAllByUseYnAndDeletedYnOrderByCreatedAtDesc(String useYn, String deletedYn);
}
