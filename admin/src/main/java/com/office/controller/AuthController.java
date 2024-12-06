package com.office.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@Slf4j
@RequiredArgsConstructor
public class AuthController {
    
    @GetMapping("/")
    public String root() {
        return "redirect:/admin/login";
    }

    @RequestMapping("/admin/login")
    public String loginPage() {
        log.info("admin login page");
        return "login";
    }
}