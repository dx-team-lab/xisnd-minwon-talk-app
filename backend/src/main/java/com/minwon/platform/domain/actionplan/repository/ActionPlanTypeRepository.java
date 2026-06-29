package com.minwon.platform.domain.actionplan.repository;

import com.minwon.platform.domain.actionplan.entity.ActionPlanType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActionPlanTypeRepository extends JpaRepository<ActionPlanType, Long> {
}
