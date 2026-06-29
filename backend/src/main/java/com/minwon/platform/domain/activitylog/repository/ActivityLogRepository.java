package com.minwon.platform.domain.activitylog.repository;

import com.minwon.platform.domain.activitylog.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
}
