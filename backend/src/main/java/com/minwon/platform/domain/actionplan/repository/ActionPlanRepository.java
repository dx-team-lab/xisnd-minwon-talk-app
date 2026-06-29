package com.minwon.platform.domain.actionplan.repository;

import com.minwon.platform.domain.actionplan.entity.ActionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActionPlanRepository extends JpaRepository<ActionPlan, Long> {
}
