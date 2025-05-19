package com.example.QuizRush.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderBoardEntryDTO {
    private Long participantId;
    private String nickname;
    private Integer score;
    private Integer totalTimeSpent;
    private Integer rank;
}
