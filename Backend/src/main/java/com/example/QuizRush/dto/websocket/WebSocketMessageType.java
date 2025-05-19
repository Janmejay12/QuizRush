package com.example.QuizRush.dto.websocket;

public enum WebSocketMessageType {

    // Quiz flow messages
    NEW_QUESTION,
    TIMER_UPDATE,
    QUESTION_ENDED,

    // Participant messages
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT,

    // Leaderboard messages
    LEADERBOARD_UPDATE,

    // Status messages
    QUIZ_STARTED,
    QUIZ_ENDED,
    ERROR
}
