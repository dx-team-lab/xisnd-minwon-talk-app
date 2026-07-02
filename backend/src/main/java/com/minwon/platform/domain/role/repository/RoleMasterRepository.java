package com.minwon.platform.domain.role.repository;

import com.minwon.platform.domain.role.entity.RoleMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleMasterRepository extends JpaRepository<RoleMaster, Long> {

    Optional<RoleMaster> findByRoleCode(String roleCode);
}
