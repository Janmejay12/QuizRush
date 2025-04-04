package com.example.QuizRush.controller;

import com.example.QuizRush.entities.Question;
import com.example.QuizRush.entities.Quiz;
import com.example.QuizRush.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {
    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/host/{hostId}")
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz, @PathVariable Long hostId){
        try {
            Quiz createdQuiz = quizService.createQuiz(quiz,hostId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdQuiz);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id,@RequestParam Long hostId){
        try {
            return quizService.getQuizById(id, hostId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes(@RequestParam Long hostId){
        try {
            return ResponseEntity.ok(quizService.getAllQuizes(hostId));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz (@PathVariable Long id, @RequestBody Quiz quiz, @RequestParam Long hostId){
        try {
            quiz.setId(id);
            return ResponseEntity.ok(quizService.updateQuiz(quiz,hostId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id, @RequestParam Long hostId){
        try {
            quizService.deleteQuiz(id,hostId);
           return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    @GetMapping("/questions/quiz/{quizId}")
    public ResponseEntity<List<Question>> getAllQuestionByQuizId(@PathVariable Long quizId,@RequestParam Long hostId){
        try {
            return ResponseEntity.ok(quizService.getAllQuestionByQuizId(quizId,hostId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
