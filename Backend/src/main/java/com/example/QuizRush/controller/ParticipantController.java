package com.example.QuizRush.controller;

import com.example.QuizRush.dto.LoginResponse;
import com.example.QuizRush.dto.ParticipantLoginRequest;
import com.example.QuizRush.service.JwtService;
import com.example.QuizRush.service.ParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/participant")
public class ParticipantController {

    @Autowired
    private ParticipantService participantService;
    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @PostMapping("/join")
    public ResponseEntity<LoginResponse> joinQuiz(@RequestBody ParticipantLoginRequest request) {
        try {
            System.out.println("in PC try");
            String token = participantService.joinQuiz(request);
            System.out.println("in PC try");
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception e) {
            System.out.println("in PC catch");
            return ResponseEntity.badRequest().body(new LoginResponse("Login failed: " + e.getMessage()));
        }
    }
}