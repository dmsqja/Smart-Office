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
class ItemUpdateTest {
    @Autowired
    ItemService itemService;

    @Test
    void testUpdateItem() {
        try {
            ItemDto itemDto = ItemDto.builder()
                    .itemId(2)
                    .itemName("Updated Item")
                    .itemPrice(15000)
                    .imgName("updated.jpg")
                    .updateDate(LocalDateTime.now())
                    .build();

            itemService.modify(itemDto);
        } catch (Exception e) {
            log.error("Error updating item", e);
            throw new RuntimeException(e);
        }
    }
}