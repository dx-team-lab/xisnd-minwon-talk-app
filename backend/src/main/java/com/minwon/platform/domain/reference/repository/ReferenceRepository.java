package com.minwon.platform.domain.reference.repository;

import com.minwon.platform.domain.reference.entity.Reference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReferenceRepository extends JpaRepository<Reference, Long> {
}
