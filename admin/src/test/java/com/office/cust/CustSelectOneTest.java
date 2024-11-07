package com.office.cust;

import com.office.app.service.CustService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;


@SpringBootTest
@Slf4j
class CustSelectOneTest {
    @Autowired
    CustService custService;
    @Test
    void contextLoads() {
        try {
            custService.get("id01");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
