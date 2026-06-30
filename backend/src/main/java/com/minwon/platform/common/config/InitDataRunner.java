package com.minwon.platform.common.config;

import com.minwon.platform.domain.user.entity.UserMaster;
import com.minwon.platform.domain.user.repository.UserMasterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminUserIfAbsent();
    }

    /**
     * 테스트 관리자 계정 초기화.
     * login_id="admin" 이 이미 존재하면 건너뛴다 (멱등성 보장).
     *
     * TODO: 운영 전 이 메서드를 제거한다. 절대 운영 DB에 남기지 않는다.
     */
    private void createAdminUserIfAbsent() {
        if (userMasterRepository.existsByLoginId("admin")) {
            log.info("[InitData] 테스트 관리자 계정이 이미 존재합니다. 초기화 건너뜀.");
            return;
        }

        // 비밀번호는 BCrypt 해시로만 저장. 평문은 로그에 절대 출력하지 않는다.
        String hashedPassword = passwordEncoder.encode("admin1234");
        UserMaster admin = UserMaster.create("admin", hashedPassword, "admin@test.com", "관리자");
        userMasterRepository.save(admin);

        log.info("[InitData] 테스트 관리자 계정 생성 완료: login_id=admin, email=admin@test.com");
        // 보안 정책: 비밀번호 해시값을 로그에 출력하지 않는다.
    }
}
