package com.example.QuizRush.service;

import com.example.QuizRush.dto.ParticipantLoginRequest;
import com.example.QuizRush.entities.Participant;
import com.example.QuizRush.entities.Quiz;
import com.example.QuizRush.exception.CustomException;
import com.example.QuizRush.repository.ParticipantRepository;
import com.example.QuizRush.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ParticipantService {
    private final QuizRepository quizRepository;
    private final ParticipantRepository participantRepository;
    private final JwtService jwtService;

    @Autowired
    public ParticipantService(QuizRepository quizRepository, ParticipantRepository participantRepository, JwtService jwtService) {
        this.quizRepository = quizRepository;
        this.participantRepository = participantRepository;
        this.jwtService = jwtService;
    }

    public String joinQuiz(ParticipantLoginRequest participantLoginRequest){

        //check if quiz exists
        Quiz quiz = quizRepository.findByRoomCode(participantLoginRequest.getQuizRoomCode())
                .orElseThrow(() -> new CustomException("Invalid Room code"));
        //check if nickname is taken
        Optional<Participant> existingParticipant = participantRepository.findByNicknameAndQuiz(participantLoginRequest.getNickname(),quiz);
        if(existingParticipant.isPresent()){
            throw new CustomException("Nickname is already taken");
        }
        //check if maximum participant limit is fulfilled
        if(quiz.getParticipants().size() >= quiz.getMaxParticipants()){
            throw new CustomException("Quiz room is full");
        }
        //creating a participant
        Participant participant = new Participant(participantLoginRequest.getNickname(), quiz);

        //genrating token for participant
        String token = jwtService.generateToken(participant.getNickname(), "PARTICIPANT");
        participant.setToken(token);
        
        // Add participant to quiz's participants collection
        quiz.addParticipant(participant);
        
        //quiz needs to be saved coz of bidirectional mapping and saving quiz will also save participants bcoz of cascade type ALL
        quizRepository.save(quiz);
        return token;
    }
}
