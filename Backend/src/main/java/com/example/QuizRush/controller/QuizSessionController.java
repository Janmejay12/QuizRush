package com.example.QuizRush.controller;

import com.example.QuizRush.entities.Participant;
import com.example.QuizRush.entities.Question;
import com.example.QuizRush.entities.Quiz;
import com.example.QuizRush.entities.enums.QuizStatus;
import com.example.QuizRush.service.QuizSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz-sessions")
public class QuizSessionController {
    private final QuizSessionService quizSessionService;
    @Autowired
    public QuizSessionController(QuizSessionService quizSessionService) {
        this.quizSessionService = quizSessionService;
    }
    @PostMapping("/{quizId}/start")
    public ResponseEntity<Quiz> startQuiz(@PathVariable Long quizId, @RequestParam Long hostId){
        try {
            return ResponseEntity.ok(quizSessionService.startQuiz(quizId,hostId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);        }
    }
    @PostMapping("/{quizId}/end")
    public ResponseEntity<Quiz> endquiz(@PathVariable Long quizId, @RequestParam Long hostId){
        try {
            return ResponseEntity.ok(quizSessionService.endQuiz(quizId,hostId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }
    @GetMapping("/{quizId}/current-question")
    public ResponseEntity<Question> getCurrentQuestion(@PathVariable Long quizId){
        try {
            return ResponseEntity.ok(quizSessionService.getCurrentQuestion(quizId));
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    @PostMapping("/{quizId}/next-question")
    public ResponseEntity<Question> nextQuestion(@PathVariable Long quizId, @RequestParam Long hostId) {
        try {
            Question question = quizSessionService.nextQuestion(quizId, hostId);
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    @GetMapping("/{quizId}/participants")
    public ResponseEntity<List<Participant>> getParticipants(@PathVariable Long quizId) {
        try {
            List<Participant> participants = quizSessionService.getParticipants(quizId);
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    @DeleteMapping("/{quizId}/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable Long quizId,
            @PathVariable Long participantId,
            @RequestParam Long hostId) {
        try {
            quizSessionService.removeParticipant(quizId, participantId, hostId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    @GetMapping("/{quizId}/status")
    public ResponseEntity<Map<String, String>> getQuizStatus(@PathVariable Long quizId) {
        try {
            QuizStatus status = quizSessionService.getQuizStatus(quizId);
            return ResponseEntity.ok(Map.of("status", status.name()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}
