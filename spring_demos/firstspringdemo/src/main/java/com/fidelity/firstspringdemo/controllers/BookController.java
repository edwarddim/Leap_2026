package com.fidelity.firstspringdemo.controllers;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fidelity.firstspringdemo.constants.AppConstants;
import com.fidelity.firstspringdemo.entity.Book;
import com.fidelity.firstspringdemo.services.BookService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/books")
public class BookController {
    private BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getBookById(@PathVariable  int id){
        Map<String, Object> map = new HashMap<>();
        try {
            map.put(AppConstants.STATUS, AppConstants.SUCCESS);
            map.put("book",bookService.getBookById(id) );
            System.out.println("get boook by id");
            return ResponseEntity.ok(map);
        }
        catch (RuntimeException e){
            System.out.println("get boook by id ERROR");
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Object> addBook(@Valid @RequestBody Book book){
        System.out.println("Book "+book);
        Map<String, Object> map = new HashMap<>();
        try {
            map.put(AppConstants.STATUS, AppConstants.SUCCESS);
            Book savedBook = bookService.addNewBook(book);
            map.put("book", savedBook );
            URI location = URI.create("/books/" + savedBook.getBookid());
            return ResponseEntity.created(location).body(savedBook);
        }
        catch (RuntimeException e){
            map.put(AppConstants.STATUS, AppConstants.FAILURE);
            map.put("error",e.getMessage());
            return ResponseEntity.badRequest().body(map);
        }
    }
    
}
