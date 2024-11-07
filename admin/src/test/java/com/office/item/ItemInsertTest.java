package com.office.item;

import com.office.app.dto.ItemDto;
import com.office.app.service.ItemService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

@SpringBootTest
@Slf4j
class ItemInsertTest {
    @Autowired
    ItemService itemService;

    @Test
    void testInsertItem() {
        ItemDto itemDto = ItemDto.builder()
                .itemName("테스트 상품1")
                .itemPrice(10000)
                .imgName("test1.jpg")
                .regDate(LocalDateTime.now())
                .build();
        try {
            itemService.add(itemDto);
            log.info("Item inserted successfully");
        } catch (Exception e) {
            log.error("Error inserting item", e);
            throw new RuntimeException(e);
        }
    }
}