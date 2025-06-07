package com.example.QuizRush.service;

import com.example.QuizRush.dto.LoginRequest;
import com.example.QuizRush.entities.User;
import com.example.QuizRush.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    public final UserRepository userRepository;
    public final PasswordEncoder passwordEncoder;
    public final JwtService jwtService;

    @Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public void registerUser(User user){
    // check if same username exists
        if(userRepository.findByUsername(user.getUsername()).isPresent())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Username already exists");

        user.setPassword(passwordEncoder.encode(user.getPassword())); //encode password
        userRepository.save(user);
    }

    public String authenticateUser(LoginRequest loginRequest){
        User user = userRepository.findByUsername(loginRequest.getUsername())
        .orElseThrow(() -> new RuntimeException("Invalid username"));

        if(passwordEncoder.matches(loginRequest.getPassword(),user.getPassword())){
            return jwtService.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        }
        else
            throw new RuntimeException("Invalid Password");
    }
}
