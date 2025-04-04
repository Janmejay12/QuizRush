package com.example.QuizRush.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String text;
    private int duration;
    private int points;

    @ElementCollection
    private List<String> options;

    @ElementCollection
    private List<Integer> correctOptionIndices;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonBackReference
    private Quiz quiz;

    public Question() {
    }

    public Question(Long id, String text, int duration, int points, List<String> options, List<Integer> correctOptionIndices, Quiz quiz) {
        this.id = id;
        this.text = text;
        this.duration = duration;
        this.points = points;
        this.options = options;
        this.correctOptionIndices = correctOptionIndices;
        this.quiz = quiz;
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public int getDuration() {
        return duration;
    }

    public int getPoints() {
        return points;
    }

    public List<String> getOptions() {
        return options;
    }

    public List<Integer> getCorrectOptionIndices() {
        return correctOptionIndices;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public void setCorrectOptionIndices(List<Integer> correctOptionIndices) {
        this.correctOptionIndices = correctOptionIndices;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }
}
