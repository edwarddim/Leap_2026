package com.fidelity.firstspringdemo.repository;

import java.util.List;

import com.fidelity.firstspringdemo.entity.Book;


public interface BookRepository {
    public long count();
    public List<Book> findAll();
    public Book save(Book book);
    public Book update(Book book);
    public List<Book>  findAllByAuthor(String author);
    public void delete(int id);
    public Book findBookById(int id);
}
