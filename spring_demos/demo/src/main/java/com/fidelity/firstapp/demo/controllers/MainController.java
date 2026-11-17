package com.fidelity.firstapp.demo.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController 
public class MainController {

    
    @GetMapping("/")
    public String getMethodName() {
        return "Hello World";
    }
}
