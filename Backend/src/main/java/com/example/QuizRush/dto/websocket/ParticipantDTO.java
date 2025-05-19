package com.example.QuizRush.dto.websocket;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDTO {
    private Long id;
    private String nickname;
    private int score;
    private String roomCode;
}
