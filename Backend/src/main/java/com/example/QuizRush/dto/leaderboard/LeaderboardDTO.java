package com.example.QuizRush.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDTO {
    private List<LeaderBoardEntryDTO> entries;
    private boolean isFinal;  // true when quiz is ended

}
