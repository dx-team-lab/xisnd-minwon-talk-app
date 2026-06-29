package com.minwon.platform.domain.procedureimage.repository;

import com.minwon.platform.domain.procedureimage.entity.ProcedureImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcedureImageRepository extends JpaRepository<ProcedureImage, Long> {
}
