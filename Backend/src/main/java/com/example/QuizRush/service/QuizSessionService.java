package com.example.QuizRush.service;

import com.example.QuizRush.dto.leaderboard.LeaderboardDTO;
import com.example.QuizRush.dto.websocket.QuestionDTO;
import com.example.QuizRush.entities.Participant;
import com.example.QuizRush.entities.Question;
import com.example.QuizRush.entities.Quiz;
import com.example.QuizRush.entities.enums.QuizStatus;
import com.example.QuizRush.exception.CustomException;
import com.example.QuizRush.mapper.QuestionMapper;
import com.example.QuizRush.repository.ParticipantRepository;
import com.example.QuizRush.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuizSessionService {
    private final QuizRepository quizRepository;
    private final ParticipantRepository participantRepository;
    private final WebSocketService webSocketService;
    private final QuestionMapper questionMapper;
    private final QuizTimerService quizTimerService;
    private final LeaderboardService leaderboardService;

    public QuizSessionService(QuizRepository quizRepository,
                              ParticipantRepository participantRepository,
                              WebSocketService webSocketService,
                              QuestionMapper questionMapper,
                              QuizTimerService quizTimerService,
                              LeaderboardService leaderboardService) {
        this.quizRepository = quizRepository;
        this.participantRepository = participantRepository;
        this.webSocketService = webSocketService;
        this.questionMapper = questionMapper;
        this.quizTimerService = quizTimerService;
        this.leaderboardService = leaderboardService;
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
        quiz = quizRepository.save(quiz);
        webSocketService.broadcastQuizStarted(quiz.getRoomCode());

        // Get and broadcast the first question
        Question currentQuestion = quiz.getCurrentQuestion();
        if (currentQuestion == null) {
            throw new CustomException("No questions available");
        }

        QuestionDTO questionDTO = questionMapper.toDTO(currentQuestion);
        webSocketService.broadcastNewQuestion(quiz.getRoomCode(), questionDTO);
        quizTimerService.startQuestionTimer(quiz.getRoomCode(), currentQuestion.getDuration());

        return quiz;
    }


    public Quiz endQuiz(Long quizId, Long hostId){
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException("Quiz not found"));
        
        if(!quiz.getHost().getId().equals(hostId))
            throw new CustomException("Unauthorized to end this quiz");
        
        if(quiz.getStatus() != QuizStatus.STARTED)
            throw new CustomException("Quiz is not in progress");
        
        quiz.setStatus(QuizStatus.FINISHED);
        webSocketService.broadcastQuizEnded(quiz.getRoomCode());

        // Generate final leaderboard
        LeaderboardDTO finalLeaderboard = leaderboardService.generateLeaderboard(quiz, true);
        webSocketService.broadcastLeaderboardUpdate(quiz.getRoomCode(), finalLeaderboard);

        quizTimerService.cleanupRoom(quiz.getRoomCode());

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

        // Handle sending out each question consistently
        QuestionDTO questionDTO = questionMapper.toDTO(currentQuestion);
        String roomCode = currentQuestion.getQuiz().getRoomCode();
        //broadcasting next question
        webSocketService.broadcastNewQuestion(roomCode,questionDTO);
        // Start the timer for this question
        quizTimerService.startQuestionTimer(roomCode, currentQuestion.getDuration());
        return currentQuestion;
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

    @Transactional
    public void handleQuestionTimeout(String roomCode) {
        try {
            System.out.println("Handling question timeout for room: " + roomCode);
            Quiz quiz = quizRepository.findByRoomCode(roomCode)
                    .orElseThrow(() -> new CustomException("Quiz not found for room: " + roomCode));

            if (quiz.getStatus() != QuizStatus.STARTED) {
                System.out.println("Quiz is not in progress for room: " + roomCode);
                throw new CustomException("Quiz is not in progress");
            }

            System.out.println("Broadcasting question ended for room: " + roomCode);
            webSocketService.broadcastQuestionEnded(roomCode);

            System.out.println("Generating leaderboard for room: " + roomCode);
            LeaderboardDTO leaderboard = leaderboardService.generateLeaderboard(quiz, false);
            if (leaderboard == null) {
                System.out.println("Generated leaderboard is null for room: " + roomCode);
                return;
            }
            
            System.out.println("Generated leaderboard with " + 
                leaderboard.getEntries().size() + " entries for room: " + roomCode);
            webSocketService.broadcastLeaderboardUpdate(roomCode, leaderboard);
            System.out.println("Successfully broadcast leaderboard for room: " + roomCode);

            quizRepository.save(quiz);
            System.out.println("Question timeout handling completed for room: " + roomCode);
        } catch (Exception e) {
            System.out.println("Error handling question timeout for room " + roomCode + ": " + e.getMessage());
            throw e;
        }
    }
}
