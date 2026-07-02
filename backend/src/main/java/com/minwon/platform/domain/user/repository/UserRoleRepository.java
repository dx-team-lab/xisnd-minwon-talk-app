package com.minwon.platform.domain.user.repository;

import com.minwon.platform.domain.role.entity.RoleMaster;
import com.minwon.platform.domain.user.entity.UserMaster;
import com.minwon.platform.domain.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    /**
     * loginId로 활성 역할 코드 목록 조회.
     * JWT 필터에서 매 요청마다 호출하여 SecurityContext GrantedAuthority 세팅에 사용.
     * INNER JOIN으로 LAZY roleMaster를 함께 로딩하여 N+1 방지.
     */
    @Query("SELECT r.roleCode FROM UserRole ur INNER JOIN ur.roleMaster r " +
           "WHERE ur.userMaster.loginId = :loginId AND ur.useYn = 'Y'")
    List<String> findRoleCodesByLoginId(@Param("loginId") String loginId);

    /** 역할 중복 부여 방지용 존재 여부 확인 */
    boolean existsByUserMasterAndRoleMaster(UserMaster userMaster, RoleMaster roleMaster);
}
