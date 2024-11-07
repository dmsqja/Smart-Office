
package com.office.app.repository;

import com.office.app.dto.CartDto;
import com.office.app.frame.SMRepository;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Mapper
public interface CartRepository extends SMRepository<CartDto, CartDto> {
    List<CartDto> findByName(CartDto cartDto);

}
