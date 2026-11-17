package com.fidelity.firstspringdemo.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fidelity.firstspringdemo.dto.User;
import com.fidelity.firstspringdemo.repository.MainRepository;

@Service 
public class MainService {

    private MainRepository mainRepo;

    public MainService(MainRepository mainRepo){
        this.mainRepo = mainRepo;
    }

    public User findOne(Long id){
        return mainRepo.findUserById(id);
    }

    public List<User> findAll(){
        return mainRepo.findAll();
    }
    
}
