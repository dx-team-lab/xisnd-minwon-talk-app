package com.minwon.platform.domain.caseexample.repository;

import com.minwon.platform.domain.caseexample.entity.CaseExample;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseExampleRepository extends JpaRepository<CaseExample, Long> {
}
