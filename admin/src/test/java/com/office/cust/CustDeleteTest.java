package com.office.cust;

import com.office.app.service.CustService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
class CustDeleteTest {
    @Autowired
    CustService custService;

    @Test
    void testUpdateCust() {
        try {

            custService.delete("id01");
        } catch (Exception e) {
            log.error("테스트 중 오류 발생", e);
            throw new RuntimeException(e);
        }
    }
}