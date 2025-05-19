package com.example.QuizRush.dto.websocket;

import lombok.Data;

@Data
public class WebSocketMessage<T> {

    private WebSocketMessageType type;
    private T payload;
    private String roomCode;
    private Long timeStamp;

    public WebSocketMessage(WebSocketMessageType type, T payload, String roomCode, Long timeStamp) {
        this.type = type;
        this.payload = payload;
        this.roomCode = roomCode;
        this.timeStamp = timeStamp;
    }

    public WebSocketMessage() {
    }
}
