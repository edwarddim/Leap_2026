package com.fidelity.firstspringdemo.repository;

import java.util.List;

import com.fidelity.firstspringdemo.dto.User;


public interface MainRepository {
    public User findUserById(Long id);
    public List<User> findAll();
}
