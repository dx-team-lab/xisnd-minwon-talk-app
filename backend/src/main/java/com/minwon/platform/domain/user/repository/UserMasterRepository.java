package com.minwon.platform.domain.user.repository;

import com.minwon.platform.domain.user.entity.UserMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserMasterRepository extends JpaRepository<UserMaster, Long> {

    // login_id 중복 여부 확인 (초기 데이터 삽입 멱등성 보장)
    boolean existsByLoginId(String loginId);

    // 로그인 인증: login_id 로 사용자 조회
    Optional<UserMaster> findByLoginId(String loginId);
}
