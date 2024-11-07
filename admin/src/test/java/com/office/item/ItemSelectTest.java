package com.office.item;

import com.office.app.service.ItemService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
class ItemSelectTest {
    @Autowired
    ItemService itemService;

    @Test
    void testSelectAllItems() {
        try {
            itemService.get();
        } catch (Exception e) {
            log.error("Error retrieving all items", e);
            throw new RuntimeException(e);
        }
    }
}