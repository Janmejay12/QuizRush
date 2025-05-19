package com.example.QuizRush.controller;

import com.example.QuizRush.dto.websocket.ParticipantDTO;
import com.example.QuizRush.dto.websocket.WebSocketMessage;
import com.example.QuizRush.service.WebSocketService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    private final WebSocketService webSocketService;

    public WebSocketController(WebSocketService webSocketService) {
        this.webSocketService = webSocketService;
    }

    @MessageMapping("/quiz/{roomCode}/join")
    public void handleParticipantJoin(@Payload ParticipantDTO participantDTO , @DestinationVariable String roomCode){

    }

    @MessageMapping("/quiz/{roomCode}/leave")
    public void handleParticipantLeave(@Payload ParticipantDTO participantDTO, @DestinationVariable String roomCode){

    }

    @SubscribeMapping("/quiz/{roomCode}")
    public void handleQuizSubscription(){

    }
}
