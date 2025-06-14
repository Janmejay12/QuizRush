package com.example.QuizRush.service;

import com.example.QuizRush.dto.leaderboard.LeaderboardDTO;
import com.example.QuizRush.dto.websocket.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class WebSocketService {
    private final SimpMessagingTemplate simpleMessagingTemplate;

    public WebSocketService(SimpMessagingTemplate simpleMessagingTemplate) {
        this.simpleMessagingTemplate = simpleMessagingTemplate;
    }

    public <T> void broadcastToQuizRoom(String roomCode, T payload, WebSocketMessageType type) {
        try {
            if (payload == null && type != WebSocketMessageType.QUIZ_STARTED
                && type != WebSocketMessageType.QUIZ_ENDED 
                && type != WebSocketMessageType.QUESTION_ENDED) {
                return;
            }
            WebSocketMessage<T> message = new WebSocketMessage<>(type, payload, roomCode, System.currentTimeMillis());
            String destination = "/topic/quiz/" + roomCode;
            simpleMessagingTemplate.convertAndSend(destination, message);
        } catch (Exception e) {
            throw e;
        }
    }

    public void broadcastQuizStarted(String roomCode) {
        broadcastToQuizRoom(roomCode, null, WebSocketMessageType.QUIZ_STARTED);
    }

    public void broadcastQuizEnded(String roomCode) {
        broadcastToQuizRoom(roomCode, null, WebSocketMessageType.QUIZ_ENDED);
    }

    public void broadcastNewQuestion(String roomCode, QuestionDTO questionDTO){
        broadcastToQuizRoom(roomCode, questionDTO, WebSocketMessageType.NEW_QUESTION);
    }
    public void broadcastQuestionEnded(String roomCode) {
        broadcastToQuizRoom(roomCode, null, WebSocketMessageType.QUESTION_ENDED);
    }

    public void broadcastTimerUpdate(String roomCode, Integer remainingSeconds) {
        broadcastToQuizRoom(roomCode, remainingSeconds, WebSocketMessageType.TIMER_UPDATE);
    }

    public void broadcastLeaderboardUpdate(String roomCode, LeaderboardDTO leaderboard) {
        try {
            broadcastToQuizRoom(roomCode, leaderboard, WebSocketMessageType.LEADERBOARD_UPDATE);
        } catch (Exception e) {
            log.error("Failed to broadcast leaderboard update to room {}: {}", roomCode, e.getMessage(), e);
            throw e;
        }
    }

    public void notifyParticipantJoined(String roomCode, ParticipantDTO participant) {
        broadcastToQuizRoom(roomCode, participant, WebSocketMessageType.PARTICIPANT_JOINED);
    }

    public void notifyParticipantLeft(String roomCode, ParticipantDTO participant) {
        broadcastToQuizRoom(roomCode, participant, WebSocketMessageType.PARTICIPANT_LEFT);
    }

}
