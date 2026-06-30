package com.minwon.platform.domain.user.repository;

import com.minwon.platform.domain.user.entity.UserMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserMasterRepository extends JpaRepository<UserMaster, Long> {

    // login_id 중복 여부 확인 (초기 데이터 삽입 멱등성 보장)
    boolean existsByLoginId(String loginId);
}
