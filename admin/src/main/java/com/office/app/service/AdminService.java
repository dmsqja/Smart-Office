package com.office.app.service;


import com.office.app.dto.AdminDto;
import com.office.app.frame.SMService;
import com.office.app.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService implements SMService<String, AdminDto> {

    private final AdminRepository adminRepository;

    @Override
    public void add(AdminDto adminDto) throws Exception {
    }

    @Override
    public void delete(String s) throws Exception {
    }

    @Override
    public void modify(AdminDto adminDto) throws Exception {
    }

    @Override
    public AdminDto get(String s) throws Exception {
        return adminRepository.selectOne(s);
    }

    @Override
    public List<AdminDto> get() throws Exception {
        return adminRepository.select();
    }
}
