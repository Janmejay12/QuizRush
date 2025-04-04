//package com.example.QuizRush.controller;
//
//import com.example.QuizRush.dto.LoginResponse;
//import com.example.QuizRush.service.JwtService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/participant")
//public class ParticipantController {
//
//    @Autowired
//    private JwtService jwtService;
//
//    @PostMapping("/login")
//    public ResponseEntity<LoginResponse> login(@RequestParam String nickname) {
//        // Generate a token for the participant
//        String token = jwtService.generateToken(nickname, "PARTICIPANT");
//        return ResponseEntity.ok(new LoginResponse(token));
//    }
//}