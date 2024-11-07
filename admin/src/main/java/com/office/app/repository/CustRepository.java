package com.office.app.repository;

import com.github.pagehelper.Page;
import com.office.app.dto.CustDto;
import com.office.app.dto.Search;
import com.office.app.frame.SMRepository;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Mapper
public interface CustRepository extends SMRepository<String, CustDto> {
    List<CustDto> findByName(String name);
    Page<CustDto> getPage() throws Exception;
    Page<CustDto> getFindPage(Search search) throws Exception;

}