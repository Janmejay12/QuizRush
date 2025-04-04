package com.example.QuizRush.controller;

import com.example.QuizRush.entities.Question;
import com.example.QuizRush.exception.CustomException;
import com.example.QuizRush.service.QuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping("/quiz/{quizId}")
    public ResponseEntity<Question> createQuestion(@RequestBody Question question, @PathVariable Long quizId) {
        try {
            Question createdQuestion = questionService.createQuestion(question, quizId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdQuestion);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id, @RequestParam Long quizId) {
        try {
            return questionService.getQuestionById(id, quizId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions(@RequestParam Long quizId) {
        try {
            return ResponseEntity.ok(questionService.getAllQuestions(quizId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question question, @RequestParam Long quizId) {
        try {
            question.setId(id);
            return ResponseEntity.ok(questionService.updateQuestion(question, quizId));
        } catch (Exception e) {
            e.printStackTrace();
            throw new CustomException("Failed to update question: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id, @RequestParam Long quizId) {
        try {
            questionService.deleteQuestion(id, quizId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
