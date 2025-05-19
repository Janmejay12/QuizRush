package com.example.QuizRush.controller;

import com.example.QuizRush.dto.LoginResponse;
import com.example.QuizRush.dto.ParticipantLoginRequest;
import com.example.QuizRush.service.JwtService;
import com.example.QuizRush.service.ParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
            String token = participantService.joinQuiz(request);
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new LoginResponse("Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/leave")
    public ResponseEntity<Void> leaveQuiz(@PathVariable String roomCode, Authentication auth){
        try {
            participantService.leaveQuiz(roomCode,auth.getName());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
//http://localhost:8080/api/participant/join
/*{
        "nickname" : "virat",
        "quizRoomCode" : "456334"
        }*/