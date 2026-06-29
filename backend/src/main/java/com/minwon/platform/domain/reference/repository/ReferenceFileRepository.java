package com.minwon.platform.domain.reference.repository;

import com.minwon.platform.domain.reference.entity.ReferenceFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReferenceFileRepository extends JpaRepository<ReferenceFile, Long> {
}
