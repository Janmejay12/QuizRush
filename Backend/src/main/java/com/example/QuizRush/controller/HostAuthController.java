package com.example.QuizRush.controller;

import com.example.QuizRush.dto.ApiResponse;
import com.example.QuizRush.dto.LoginRequest;
import com.example.QuizRush.dto.LoginResponse;
import com.example.QuizRush.entities.User;
import com.example.QuizRush.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/host")
public class HostAuthController {

    private final AuthService authService;
    @Autowired
    public HostAuthController(AuthService authService) {
        this.authService = authService;

    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user)
    {
        try {
            this.authService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse(true,"User registered successfully"));
        }
        catch (Exception e)
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false,"Registration failed: " + e.getMessage()));
        } 
    
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginuser(@RequestBody LoginRequest loginrequest)
    {

        try{
            String token = authService.authenticateUser(loginrequest);
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new LoginResponse("Login Failed: " + e.getMessage()));
        }
    }
}
