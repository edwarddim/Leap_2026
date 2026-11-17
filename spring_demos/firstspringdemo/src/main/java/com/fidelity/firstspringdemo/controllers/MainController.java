package com.fidelity.firstspringdemo.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fidelity.firstspringdemo.services.MainService;


@RestController
@RequestMapping("/user")
public class MainController {

    private MainService mainService;

    public MainController(MainService mainServ){
        this.mainService = mainServ;
    }
    
    @RequestMapping
    public String mainPage(){
        System.out.println(mainService.findAll());
        return "Hello String";
    }

    @GetMapping("/{id}")
    public String home(@PathVariable Long id){
        System.out.println(mainService.findOne(id));
        return "Home";
    }

    @GetMapping
    public String allUsers(){
        return "All users";
    }

    @PostMapping
    public String createUser(){
        return "Created a new user";
    }


}
