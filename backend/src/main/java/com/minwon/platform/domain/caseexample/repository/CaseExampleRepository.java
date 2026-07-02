package com.minwon.platform.domain.caseexample.repository;

import com.minwon.platform.domain.caseexample.entity.CaseExample;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaseExampleRepository extends JpaRepository<CaseExample, Long> {

    // use_yn='Y' + deleted_yn='N' 인 사례만 등록일 내림차순으로 조회
    List<CaseExample> findAllByUseYnAndDeletedYnOrderByCreatedAtDesc(String useYn, String deletedYn);
}
