package com.example.QuizRush.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

public class AnswerResult {
    private boolean correct;
    private Integer pointsAwarded;
    private Integer totalScore;
    private String message;
    private List<Integer> correctOptionIndices;

    public AnswerResult() {
    }

    public AnswerResult(boolean correct, Integer pointsAwarded, Integer totalScore, String message, List<Integer> correctOptionIndices) {
        this.correct = correct;
        this.pointsAwarded = pointsAwarded;
        this.totalScore = totalScore;
        this.message = message;
        this.correctOptionIndices = correctOptionIndices;
    }

    public boolean isCorrect() {
        return correct;
    }

    public Integer getPointsAwarded() {
        return pointsAwarded;
    }

    public Integer getTotalScore() {
        return totalScore;
    }

    public String getMessage() {
        return message;
    }

    public List<Integer> getCorrectOptionIndices() {
        return correctOptionIndices;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public void setPointsAwarded(Integer pointsAwarded) {
        this.pointsAwarded = pointsAwarded;
    }

    public void setTotalScore(Integer totalScore) {
        this.totalScore = totalScore;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setCorrectOptionIndices(List<Integer> correctOptionIndices) {
        this.correctOptionIndices = correctOptionIndices;
    }
}
