package com.example.QuizRush.controller;

import com.example.QuizRush.dto.AnswerResult;
import com.example.QuizRush.dto.AnswerSubmission;
import com.example.QuizRush.service.AnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz-sessions")
public class AnswerController {

    private final AnswerService answerService;

    @Autowired
    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    @PostMapping("/{quizId}/submit-answer")
    public ResponseEntity<AnswerResult> submitAnswer(
            @PathVariable Long quizId,
            @RequestBody AnswerSubmission submission,
            Authentication authentication) {
        try {
            AnswerResult result = answerService.processAnswer(quizId, submission, authentication);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AnswerResult(false, 0, 0, e.getMessage(),null));
        }
    }
}
//http://localhost:8080/api/quiz-sessions/4/submit-answer
/*{
        "participantId" : "5",
        "questionId" : "4",
        "selectedOptionIndices" : [0,2]
        }
*/