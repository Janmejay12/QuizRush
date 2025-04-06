package com.example.QuizRush.dto;

public class ParticipantLoginRequest {
    private String nickname;
    private String quizRoomCode;

    public ParticipantLoginRequest() {
    }

    public ParticipantLoginRequest(String nickname, String quizRoomCode) {
        this.nickname = nickname;
        this.quizRoomCode = quizRoomCode;
    }

    public String getNickname() {
        return nickname;
    }

    public String getQuizRoomCode() {
        return quizRoomCode;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public void setQuizRoomCode(String quizRoomCode) {
        this.quizRoomCode = quizRoomCode;
    }
}
