package com.example.QuizRush.service;

import com.example.QuizRush.dto.leaderboard.LeaderBoardEntryDTO;
import com.example.QuizRush.dto.leaderboard.LeaderboardDTO;
import com.example.QuizRush.entities.Participant;
import com.example.QuizRush.entities.Quiz;
import com.example.QuizRush.repository.ParticipantRepository;
import com.example.QuizRush.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class LeaderboardService {
    private final QuizTimerService quizTimerService;
    private final QuizRepository quizRepository;
    private final ParticipantRepository participantRepository;

    public LeaderboardService(QuizTimerService quizTimerService,
                              QuizRepository quizRepository,
                              ParticipantRepository participantRepository) {
        this.quizTimerService = quizTimerService;
        this.quizRepository = quizRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public LeaderboardDTO generateLeaderboard(Quiz quizParam, boolean isFinal) {

        // Force a refresh of the quiz and participants to get the latest data
        Quiz quiz = quizRepository.findById(quizParam.getId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Get participants directly from repository to ensure fresh data
        String roomCode = quiz.getRoomCode();
        List<Participant> participants = participantRepository.findByQuizId(quiz.getId());

        if (participants == null || participants.isEmpty()) {
            log.warn("No participants found for quiz room: {}", roomCode);
            return new LeaderboardDTO(List.of(), isFinal);
        }

        List<LeaderBoardEntryDTO> entries = participants.stream()
                .map(participant -> createEntry(roomCode, participant))
                .sorted(createLeaderboardComparator())
                .collect(Collectors.toList());

        // Assign ranks (handle ties by giving same rank)
        int rank = 1;
        for (int i = 0; i < entries.size(); i++) {
            if (i > 0 && shouldHaveSameRank(entries.get(i), entries.get(i-1))) {
                entries.get(i).setRank(entries.get(i-1).getRank());
            } else {
                entries.get(i).setRank(rank);
                rank++;
            }
        }

        return new LeaderboardDTO(entries, isFinal);
    }

    private LeaderBoardEntryDTO createEntry(String roomCode, Participant participant) {
        int totalTime = quizTimerService.getTotalTime(roomCode, participant.getId());

        return new LeaderBoardEntryDTO(
                participant.getId(),
                participant.getNickname(),
                participant.getScore(),
                totalTime,
                0  // rank will be set later
        );
    }

    private Comparator<LeaderBoardEntryDTO> createLeaderboardComparator() {
        return Comparator
                .comparing(LeaderBoardEntryDTO::getScore).reversed()  // Higher score first
                .thenComparing(LeaderBoardEntryDTO::getTotalTimeSpent);  // Lower time first
    }

    private boolean shouldHaveSameRank(LeaderBoardEntryDTO current, LeaderBoardEntryDTO previous) {
        return current.getScore().equals(previous.getScore())
                && current.getTotalTimeSpent().equals(previous.getTotalTimeSpent());
    }
}