package com.minwon.platform.domain.user.repository;

import com.minwon.platform.domain.user.entity.UserMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserMasterRepository extends JpaRepository<UserMaster, Long> {
}
