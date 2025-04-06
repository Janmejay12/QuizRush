package com.example.QuizRush.entities;

import com.example.QuizRush.entities.enums.QuizStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String roomCode;
    private int maxParticipants;
    private String subject;
    private String grade;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Participant> participants;


    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Question> questions;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Enumerated(EnumType.STRING)
    private QuizStatus status = QuizStatus.WAITING;

    private Integer currentQuestionIndex = 0;

    public void addParticipant(Participant participant) {
        if (participants == null) {
            participants = new ArrayList<>();
        }
        participants.add(participant);
        participant.setQuiz(this);
    }

    public void removeParticipant(Participant participant) {
        if (participants != null) {
            participants.remove(participant);
            participant.setQuiz(null);
        }
    }
    public boolean isQuizFull() {
        return participants != null && participants.size() >= maxParticipants;
    }

    public boolean canStart() {
        return status == QuizStatus.WAITING &&
                participants != null &&
                !participants.isEmpty() &&
                questions != null &&
                !questions.isEmpty();
    }
    public Question getCurrentQuestion() {
        if (questions == null || questions.isEmpty() ||
                currentQuestionIndex < 0 || currentQuestionIndex >= questions.size()) {
            return null;
        }
        return questions.get(currentQuestionIndex);
    }
    public boolean advanceToNextQuestion() {
        if (questions == null || currentQuestionIndex >= questions.size() - 1) {
            return false;
        }
        currentQuestionIndex++;
        return true;
    }

    public Quiz() {
    }

    public Quiz(Long id, String title, String description, String roomCode, int maxParticipants, String subject, String grade, LocalDateTime createdAt, LocalDateTime updatedAt, User host, List<Participant> participants, List<Question> questions) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.roomCode = roomCode;
        this.maxParticipants = maxParticipants;
        this.subject = subject;
        this.grade = grade;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.host = host;
        this.participants = participants;
        this.questions = questions;
    }

    public List<Participant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<Participant> participants) {
        this.participants = participants;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public int getMaxParticipants() {
        return maxParticipants;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getSubject() {
        return subject;
    }

    public String getGrade() {
        return grade;
    }

    public User getHost() {
        return host;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public void setMaxParticipants(int maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public void setHost(User host) {
        this.host = host;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }
    public QuizStatus getStatus() {
        return status;
    }

    public void setStatus(QuizStatus status) {
        this.status = status;
    }
    public Integer getCurrentQuestionIndex() {
        return currentQuestionIndex;
    }

    public void setCurrentQuestionIndex(Integer currentQuestionIndex) {
        this.currentQuestionIndex = currentQuestionIndex;
    }
}
