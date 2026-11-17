package com.demo.SpringSecurityDemo.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
public class MainController {

    @GetMapping("/greets")
    public String all(){
        return "Greet method called";
    }

    @GetMapping("/user")
    public String user(){
        return "User method called";
    }

    @GetMapping("/admin")
    public String admin(){
        return "Admin method called";
    }



}
