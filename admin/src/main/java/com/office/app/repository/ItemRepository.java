package com.office.app.repository;

import com.office.app.dto.ItemDto;
import com.office.app.frame.SMRepository;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;


@Repository
@Mapper
public interface ItemRepository extends SMRepository<Integer, ItemDto> {
}