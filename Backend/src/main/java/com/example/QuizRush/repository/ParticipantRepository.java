package com.example.QuizRush.repository;

import com.example.QuizRush.entities.Participant;
import com.example.QuizRush.entities.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant,Long> {
    Optional<Participant> findByNicknameAndQuiz(String nickname, Quiz quiz);
    List<Participant> findByQuiz(Quiz quiz);
    Optional<Participant> findByNickname(String nickname);

    @Query("SELECT p FROM Participant p WHERE p.quiz.id = :quizId")
    List<Participant> findByQuizId(@Param("quizId") Long quizId);
}
