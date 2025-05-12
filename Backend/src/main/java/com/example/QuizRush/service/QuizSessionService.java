package com.example.QuizRush.service;

import com.example.QuizRush.entities.Participant;
import com.example.QuizRush.entities.Question;
import com.example.QuizRush.entities.Quiz;
import com.example.QuizRush.entities.enums.QuizStatus;
import com.example.QuizRush.exception.CustomException;
import com.example.QuizRush.repository.ParticipantRepository;
import com.example.QuizRush.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizSessionService {
    private final QuizRepository quizRepository;
    private final ParticipantRepository participantRepository;

    public QuizSessionService(QuizRepository quizRepository, ParticipantRepository participantRepository) {
        this.quizRepository = quizRepository;
        this.participantRepository = participantRepository;
    }


    public Quiz startQuiz(Long quizId, Long hostId){
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException("Quiz not found"));

        if(!quiz.getHost().getId().equals(hostId))
            throw new CustomException("Unauthorized to start this quiz");

        if(!quiz.canStart())
            throw new CustomException("Quiz cannot be started: ensure it has participants and questions");

        quiz.setStatus(QuizStatus.STARTED);
        quiz.setCurrentQuestionIndex(0);
        return quizRepository.save(quiz);
    }


    public Quiz endQuiz(Long quizId, Long hostId){
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException("Quiz not found"));
        
        if(!quiz.getHost().getId().equals(hostId))
            throw new CustomException("Unauthorized to end this quiz");
        
        if(quiz.getStatus() != QuizStatus.STARTED)
            throw new CustomException("Quiz is not in progress");
        
        quiz.setStatus(QuizStatus.FINISHED);
        return quizRepository.save(quiz);
    }


    public Question nextQuestion(Long quizId, Long hostId){
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException("Quiz not found"));

        if(!quiz.getHost().getId().equals(hostId))
            throw new CustomException("Unauthorized to modify this quiz");

        if(quiz.getStatus() != QuizStatus.STARTED)
            throw new CustomException("Quiz is not in progress");

        // Try to advance to the next question
        if (!quiz.advanceToNextQuestion()) {
            // No more questions, end the quiz
            quiz.setStatus(QuizStatus.FINISHED);
            quizRepository.save(quiz);
            throw new CustomException("No more questions, quiz has ended");
        }
        quizRepository.save(quiz);
        Question currentQuestion = quiz.getCurrentQuestion();
        if (currentQuestion == null) {
            throw new CustomException("No current question available");
        }
        else
            return quiz.getCurrentQuestion();
    }


    public Question getCurrentQuestion(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException("Quiz not found"));

        // Check if quiz is in progress
        if (quiz.getStatus() != QuizStatus.STARTED) {
            throw new CustomException("Quiz is not in progress");
        }

        Question currentQuestion = quiz.getCurrentQuestion();
        if (currentQuestion == null) {
            throw new CustomException("No current question available");
        }

        return currentQuestion;
    }


    public List<Participant> getParticipants(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException("Quiz not found"));

        return quiz.getParticipants();
    }


    public void removeParticipant(Long quizId, Long participantId, Long hostId){
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException("Quiz not found"));

        if(!quiz.getHost().getId().equals(hostId))
            throw new CustomException("Unauthorized to modify this quiz");

        if (quiz.getStatus() != QuizStatus.WAITING) {
            throw new CustomException("Cannot remove participants after quiz has started");
        }
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new CustomException("Participant not found"));

        if(!participant.getQuiz().getId().equals(quizId))
            throw new CustomException("Participant does not belong to this quiz");

        quiz.removeParticipant(participant);
        participantRepository.delete(participant);
        quizRepository.save(quiz);
    }


    public QuizStatus getQuizStatus(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException("Quiz not found"));
        return quiz.getStatus();
    }
}
