package com.office.controller;


import com.office.app.dto.CartDto;
import com.office.app.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;
    String dir = "cart/";

    @RequestMapping("/add")
    public String add(Model model) throws Exception {
        model.addAttribute("center",dir+"add");
        return "index";
    }
    @RequestMapping("/add_impl")
    public String addimpl(Model model, CartDto cartDto) throws Exception {
        // 데이터 입력
//        cartDto.setImgName(cartDto.getImage().getOriginalFilename());
        cartService.add(cartDto);

        return "redirect:/cart/get";
    }

    @ResponseBody
    @RequestMapping("/update_quantity")
    public String  update(Model model, CartDto cartDto) {
        // id, name, price, imgname, or newimg
        try {
            cartService.modify(cartDto);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }

    }
    @RequestMapping("/delete")
    public String delete(Model model, CartDto cartDto) throws Exception {
        cartService.delete(cartDto);
        return "redirect:/cart/get";
    }

    @RequestMapping("/get")
    public String get(Model model) throws Exception {
        List<CartDto> list = new ArrayList<>();
        list = cartService.get();
        model.addAttribute("cartlist",list);
        model.addAttribute("center",dir+"get");


        return "index";
    }
    @RequestMapping("/detail")
    public String detail(Model model, CartDto cartDto) throws Exception {
        CartDto cart = cartService.get(cartDto);
        log.info("===================================================" + cart);
        model.addAttribute("cart",cart);
        model.addAttribute("center",dir+"detail");


        return "index";
    }
}
