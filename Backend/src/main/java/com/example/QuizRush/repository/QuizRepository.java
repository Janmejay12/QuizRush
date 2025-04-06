package com.example.QuizRush.repository;

import com.example.QuizRush.entities.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz,Long>{
    Optional<Quiz> findByRoomCode(String roomCode);
}
