package com.minwon.platform.domain.code.repository;

import com.minwon.platform.domain.code.entity.CodeMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CodeMasterRepository extends JpaRepository<CodeMaster, Long> {
    // 현재 단계는 기본 CRUD만 선언. 코드 조회 메서드는 다음 단계에서 추가.
}
