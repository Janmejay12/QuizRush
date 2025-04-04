package com.example.QuizRush.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Secure {
    @GetMapping("/secure")
    public String secureEndpoint(){
        return "Your secure endpoint";
    }
}
