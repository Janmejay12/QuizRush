package com.example.QuizRush.service;

import com.example.QuizRush.dto.ParticipantJoinResponse;
import com.example.QuizRush.dto.ParticipantLoginRequest;
import com.example.QuizRush.dto.websocket.ParticipantDTO;
import com.example.QuizRush.entities.Participant;
import com.example.QuizRush.entities.Quiz;
import com.example.QuizRush.entities.enums.QuizStatus;
import com.example.QuizRush.exception.CustomException;
import com.example.QuizRush.mapper.ParticipantMapper;
import com.example.QuizRush.repository.ParticipantRepository;
import com.example.QuizRush.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ParticipantService {
    private final QuizRepository quizRepository;
    private final ParticipantRepository participantRepository;
    private final JwtService jwtService;
    private final WebSocketService webSocketService;
    private final ParticipantMapper participantMapper;

    public ParticipantService(QuizRepository quizRepository, ParticipantRepository participantRepository, JwtService jwtService, WebSocketService webSocketService, ParticipantMapper participantMapper) {
        this.quizRepository = quizRepository;
        this.participantRepository = participantRepository;
        this.jwtService = jwtService;
        this.webSocketService = webSocketService;
        this.participantMapper = participantMapper;
    }

    public ParticipantJoinResponse joinQuiz(ParticipantLoginRequest participantLoginRequest){

        //check if quiz exists
        Quiz quiz = quizRepository.findByRoomCode(participantLoginRequest.getQuizRoomCode())
                .orElseThrow(() -> new CustomException("Invalid Room code"));
        //check if nickname is taken
        Optional<Participant> existingParticipant = participantRepository.findByNicknameAndQuiz(participantLoginRequest.getNickname(),quiz);
        if(existingParticipant.isPresent()){
            throw new CustomException("Nickname is already taken");
        }
        if(!quiz.getStatus().equals(QuizStatus.WAITING)){
            throw new CustomException("Quiz is not open for joining");
        }
        //check if maximum participant limit is fulfilled
        if(quiz.getParticipants().size() >= quiz.getMaxParticipants()){
            throw new CustomException("Quiz room is full");
        }
        //creating a participant
        Participant participant = new Participant(participantLoginRequest.getNickname(), quiz);

        //genrating token for participant
        String token = jwtService.generateToken(participant.getNickname(), "PARTICIPANT",null);
        participant.setToken(token);

        participantRepository.save(participant);

        // Add participant to quiz's participants collection
        quiz.addParticipant(participant);

        ParticipantDTO participantDTO = participantMapper.toDTO(participant);
        webSocketService.notifyParticipantJoined(quiz.getRoomCode(),participantDTO);
        
        //quiz needs to be saved coz of bidirectional mapping and saving quiz will also save participants bcoz of cascade type ALL
        quizRepository.save(quiz);

        ParticipantJoinResponse participantJoinResponse = new ParticipantJoinResponse(
                token,
                participant.getId(),
                quiz.getId()
        );
        return participantJoinResponse;
    }

    public List<Participant> getParticipants(Long quizId){
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException("Quiz not found"));
        List<Participant> participants = quiz.getParticipants();
        return participants;
    }

    public void leaveQuiz(String roomCode, String nickname){
        Quiz quiz = quizRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new CustomException("Quiz not found"));

        Participant participant = participantRepository.findByNicknameAndQuiz(nickname, quiz)
                .orElseThrow(() -> new CustomException("Participant not found"));

        // Can't leave if quiz is in progress
        if (quiz.getStatus() == QuizStatus.STARTED) {
            throw new CustomException("Cannot leave quiz while it's in progress");
        }
        ParticipantDTO participantDTO = participantMapper.toDTO(participant);
        quiz.removeParticipant(participant);
        participantRepository.delete(participant);
        quizRepository.save(quiz);

        webSocketService.notifyParticipantLeft(roomCode, participantDTO);

    }
}
