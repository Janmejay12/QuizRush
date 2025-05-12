package com.example.QuizRush.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AnswerSubmission {
    private Long participantId;
    private Long questionId;
    private List<Integer> selectedOptionIndices;
}

