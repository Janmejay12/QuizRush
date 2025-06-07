package com.example.QuizRush.controller;

import com.example.QuizRush.dto.LoginResponse;
import com.example.QuizRush.dto.ParticipantJoinResponse;
import com.example.QuizRush.dto.ParticipantLoginRequest;
import com.example.QuizRush.entities.Participant;
import com.example.QuizRush.service.JwtService;
import com.example.QuizRush.service.ParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participant")
public class ParticipantController {

    @Autowired
    private ParticipantService participantService;
    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @PostMapping("/join")
    public ResponseEntity<ParticipantJoinResponse> joinQuiz(@RequestBody ParticipantLoginRequest request) {
        try {
            ParticipantJoinResponse response = participantService.joinQuiz(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ParticipantJoinResponse("Login failed: " + e.getMessage(), null, null));
        }
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Participant>> getParticipants(@PathVariable Long quizId){
        try{
            return ResponseEntity.ok(participantService.getParticipants(quizId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/leave/{roomcode}")
    public ResponseEntity<Void> leaveQuiz(@PathVariable String roomcode, Authentication auth){
        try {
            participantService.leaveQuiz(roomcode,auth.getName());
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