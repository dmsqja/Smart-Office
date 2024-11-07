package com.office.item;

import com.office.app.service.ItemService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
class ItemSelectOneTest {
    @Autowired
    ItemService itemService;

    @Test
    void testSelectOneItem() {
        try {
            itemService.get(1);
        } catch (Exception e) {
            log.error("Error retrieving item", e);
            throw new RuntimeException(e);
        }
    }
}