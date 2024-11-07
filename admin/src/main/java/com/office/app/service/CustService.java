package com.office.app.service;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.office.app.dto.CustDto;
import com.office.app.dto.Search;
import com.office.app.frame.SMService;
import com.office.app.repository.CustRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustService implements SMService<String, CustDto> {

    final CustRepository custRepository;

    @Override
    public void add(CustDto custDto) throws Exception {
        custRepository.insert(custDto);
    }

    @Override
    public void modify(CustDto custDto) throws Exception {
        custRepository.update(custDto);
    }

    @Override
    public void delete(String s) throws Exception {
        custRepository.delete(s);
    }

    @Override
    public CustDto get(String s) throws Exception {
        return custRepository.selectOne(s);
    }

    @Override
    public List<CustDto> get() throws Exception {
        return custRepository.select();
    }

    public List<CustDto> findByName(String name) throws Exception {
        return custRepository.findByName(name);
    }

    public Page<CustDto> getPage(int pageNo) throws  Exception{
        PageHelper.startPage(pageNo,3);
        return custRepository.getPage();
    }
    public Page<CustDto> getFindPage(int pageNo, Search search) throws  Exception{
        PageHelper.startPage(pageNo,2);
        return custRepository.getFindPage(search);
    }

}