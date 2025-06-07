package com.example.QuizRush.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ParticipantJoinResponse {
    private String token;
    private Long participantId;
    private Long quizId;

}
