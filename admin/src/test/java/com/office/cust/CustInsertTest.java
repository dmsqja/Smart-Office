package com.office.cust;

import com.office.app.dto.CustDto;
import com.office.app.service.CustService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
class CustInsertTest {
    @Autowired
    CustService custService;

    @Test
    void contextLoads() {
        CustDto custDto = CustDto.builder().custId("id11").custPwd("pwd11").custName("최태산").build();
        try {
            custService.add(custDto);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}