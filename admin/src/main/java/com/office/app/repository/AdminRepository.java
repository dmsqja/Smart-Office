package com.office.app.repository;

import com.office.app.dto.AdminDto;
import com.office.app.frame.SMRepository;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;


@Repository
@Mapper
public interface AdminRepository extends SMRepository<String, AdminDto> {
}
