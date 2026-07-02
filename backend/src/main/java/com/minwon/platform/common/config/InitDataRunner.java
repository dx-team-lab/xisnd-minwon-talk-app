package com.minwon.platform.common.config;

import com.minwon.platform.domain.role.entity.RoleMaster;
import com.minwon.platform.domain.role.repository.RoleMasterRepository;
import com.minwon.platform.domain.user.entity.UserMaster;
import com.minwon.platform.domain.user.entity.UserRole;
import com.minwon.platform.domain.user.repository.UserMasterRepository;
import com.minwon.platform.domain.user.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 애플리케이션 기동 시 테스트 초기 데이터를 생성하는 러너.
 * "prod" 프로파일에서는 자동 비활성화된다.
 *
 * TODO: 운영 배포 전 이 클래스를 제거하거나 @Profile("!prod")를 확인한다.
 */
@Slf4j
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class InitDataRunner implements CommandLineRunner {

    private final UserMasterRepository userMasterRepository;
    private final RoleMasterRepository roleMasterRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // 1단계: 역할 마스터 데이터 생성 (없으면 생성, 있으면 재사용)
        RoleMaster adminRole = createRoleIfAbsent("ADMIN", "관리자", 1);
        RoleMaster managerRole = createRoleIfAbsent("MANAGER", "매니저", 2);

        // 2단계: 테스트 계정 생성 및 역할 부여
        // TODO: 운영 전 이 메서드들을 제거한다. 절대 운영 DB에 남기지 않는다.
        createUserWithRoleIfAbsent("admin", "admin1234", "admin@test.com", "관리자", adminRole);
        createUserWithRoleIfAbsent("manager", "manager1234", "manager@test.com", "매니저", managerRole);
    }

    private RoleMaster createRoleIfAbsent(String roleCode, String roleName, int sortOrder) {
        return roleMasterRepository.findByRoleCode(roleCode)
                .orElseGet(() -> {
                    RoleMaster role = RoleMaster.create(roleCode, roleName, sortOrder);
                    RoleMaster saved = roleMasterRepository.save(role);
                    log.info("[InitData] 역할 생성 완료: roleCode={}", roleCode);
                    return saved;
                });
    }

    /**
     * 테스트 계정 생성 및 역할 부여 (멱등성 보장).
     * login_id가 이미 존재하면 계정 생성은 건너뛰고 역할 부여만 보정한다.
     * 비밀번호 해시값은 로그에 절대 출력하지 않는다.
     */
    private void createUserWithRoleIfAbsent(String loginId, String rawPassword, String email,
                                             String displayName, RoleMaster role) {
        UserMaster user;
        if (userMasterRepository.existsByLoginId(loginId)) {
            log.info("[InitData] 계정이 이미 존재합니다: loginId={}", loginId);
            user = userMasterRepository.findByLoginId(loginId).orElseThrow();
        } else {
            // 비밀번호는 BCrypt 해시로만 저장. 평문은 로그에 절대 출력하지 않는다.
            String hashedPassword = passwordEncoder.encode(rawPassword);
            user = UserMaster.create(loginId, hashedPassword, email, displayName);
            user = userMasterRepository.save(user);
            log.info("[InitData] 테스트 계정 생성 완료: loginId={}, email={}", loginId, email);
        }

        // 역할 중복 부여 방지 (멱등성)
        if (!userRoleRepository.existsByUserMasterAndRoleMaster(user, role)) {
            userRoleRepository.save(UserRole.create(user, role));
            log.info("[InitData] 역할 부여 완료: loginId={}, roleCode={}", loginId, role.getRoleCode());
        } else {
            log.info("[InitData] 역할이 이미 부여되어 있습니다: loginId={}, roleCode={}", loginId, role.getRoleCode());
        }
    }
}
