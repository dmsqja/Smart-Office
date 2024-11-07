package com.office.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;


@ControllerAdvice
@Slf4j
public class SMExceptionHandler {
    @ExceptionHandler(DuplicateKeyException.class)
    public String ex2(DuplicateKeyException e, Model model) {
        model.addAttribute("msg", "ID 중복..!!");
        model.addAttribute("center", "error");
        return "index";
    }
    @ExceptionHandler(Exception.class)
    public String ex1(Exception e, Model model) {
        model.addAttribute("msg", e.getMessage());
        model.addAttribute("center", "error");
        return "index";
    }


}
