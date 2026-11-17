package com.fidelity.firstspringdemo.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fidelity.firstspringdemo.entity.Book;
import com.fidelity.firstspringdemo.repository.BookRepository;

@Service 
public class BookService {
    private BookRepository repository;
    
    public BookService(BookRepository repository) {
        this.repository = repository;
    }
    public long getTotalBookCount(){
        return repository.count();
    }
    public List<Book> getAllBooks(){
        return repository.findAll();
    }
    public Book addNewBook(Book book) {
            return repository.save(book);
    }
    public Book updateBook(Book book) {
        Book savedBook = null;
        savedBook = repository.update(book);
        return savedBook;
    }
    public void deleteBook(int id) {
        repository.delete(id);
    }
    public List<Book> getBooksByAuthor(String author){
        return repository.findAllByAuthor(author);
    }
    public Book getBookById(int id)  {
        return repository.findBookById(id);
    }
}
