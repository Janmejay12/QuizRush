package com.example.QuizRush.service;

import com.example.QuizRush.entities.Question;
import com.example.QuizRush.entities.Quiz;
import com.example.QuizRush.exception.CustomException;
import com.example.QuizRush.repository.QuestionRepository;
import com.example.QuizRush.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    public QuestionService(QuestionRepository questionRepository, QuizRepository quizRepository) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }

    public Question createQuestion(Question question, Long quizId) {
        try {
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new CustomException("Quiz not found"));
            //setting quizId in question table
            question.setQuiz(quiz);
            return questionRepository.save(question);
        } catch (Exception e) {
            throw new CustomException("Failed to create question: " + e.getMessage());
        }
    }

    public Optional<Question> getQuestionById(Long id, Long quizId) {
        try {
            return questionRepository.findById(id)
                    .filter(question -> question.getQuiz().getId().equals(quizId));
        } catch (Exception e) {
            throw new CustomException("Error retrieving question: " + e.getMessage());
        }
    }

    public List<Question> getAllQuestions(Long quizId) {
        try {
            return questionRepository.findAll().stream()
                    .filter(question -> question.getQuiz().getId().equals(quizId)).toList();
        } catch (Exception e) {
            throw new CustomException("Error retrieving questions: " + e.getMessage());
        }
    }

    public Question updateQuestion(Question question, Long quizId) {
        try {
            Question existingQuestion = questionRepository.findById(question.getId())
                    .orElseThrow(() -> new CustomException("Question not found"));

            if (!existingQuestion.getQuiz().getId().equals(quizId)) {
                throw new CustomException("Unauthorized to update this question");
            }
            question.setQuiz(existingQuestion.getQuiz());
            return questionRepository.save(question);

        } catch (Exception e) {
            throw new CustomException("Failed to update question: " + e.getMessage());
        }
    }

    public void deleteQuestion(Long id, Long quizId) {
        try {
            Question existingQuestion = questionRepository.findById(id)
                    .orElseThrow(() -> new CustomException("Question not found"));

            if (!existingQuestion.getQuiz().getId().equals(quizId))
                throw new CustomException("Unauthorized to delete this question");


            questionRepository.delete(existingQuestion);
        } catch (Exception e) {
            throw new CustomException("Failed to delete question: " + e.getMessage());
        }
    }
}

