package com.example.QuizRush.service;

import com.example.QuizRush.entities.Question;
import com.example.QuizRush.entities.Quiz;
import com.example.QuizRush.entities.User;
import com.example.QuizRush.exception.CustomException;
import com.example.QuizRush.repository.QuestionRepository;
import com.example.QuizRush.repository.QuizRepository;
import com.example.QuizRush.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;

    public String generateQuizCode(){
        Random random = new Random();
        return(String.valueOf(random.nextInt(900000) + 100000));
    }

    public QuizService(QuizRepository quizRepository,UserRepository userRepository, QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
    }

    public Quiz createQuiz(Quiz quiz, Long hostId){
        try{
            User user = userRepository.findById(hostId)
                            .orElseThrow(() -> new CustomException("Host not found"));
            quiz.setHost(user);
            quiz.setRoomCode(generateQuizCode());
            return this.quizRepository.save(quiz);
        } catch (Exception e) {
            throw new CustomException("Failed to create Quiz " + e.getMessage());
        }
    }

    public Optional<Quiz> getQuizById(Long id, Long hostId)
    {
        try {
            return quizRepository.findById(id)
                    .filter(quiz -> quiz.getHost().getId().equals(hostId));
        } catch (Exception e) {
            throw new CustomException("Error retrieving quiz " + e.getMessage());
        }
    }

    public List<Quiz> getAllQuizes(Long hostId){
        try {
            return quizRepository.findAll().stream()
                    .filter(quiz -> quiz.getHost().getId().equals(hostId)).toList();
        } catch (Exception e) {
            throw new CustomException("Error retrieving quizzes: " + e.getMessage());
        }
    }

    public Quiz updateQuiz(Quiz quiz, Long hostId){
        try {
            Quiz existingQuiz = quizRepository.findById(quiz.getId())
                    .orElseThrow(() -> new CustomException("Quiz not found"));
            if(!existingQuiz.getHost().getId().equals(hostId))
                throw new CustomException("Unauthorized to update this quiz");
            return quizRepository.save(quiz);
        } catch (Exception e) {
            throw new CustomException("Failed to update quiz: " + e.getMessage());
        }
    }

    public void deleteQuiz(Long id, Long hostId){
        try {
            Quiz existingQuiz = quizRepository.findById(id)
                    .orElseThrow(() -> new CustomException("Quiz not found"));
            if(!existingQuiz.getHost().getId().equals(hostId))
                throw new CustomException("Unauthorized to delete this quiz");

            quizRepository.delete(existingQuiz);
        } catch (Exception e) {
            throw new CustomException("Failed to delete quiz: " + e.getMessage());
        }
    }

    public List<Question> getAllQuestionByQuizId(Long quizId, Long hostId)
    {
        try {
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new CustomException("Quiz not found"));

            if (!quiz.getHost().getId().equals(hostId)) {
                throw new CustomException("Unauthorized to access this quiz's questions");
            }
            return questionRepository.findAll().stream()
                    .filter(question -> question.getQuiz().getId().equals(quizId)).toList();
        } catch (Exception e) {
            throw new CustomException("Failed to retrieve all questions: " + e.getMessage());
        }
    }
}
