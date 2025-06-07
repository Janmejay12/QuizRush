package com.example.QuizRush.service;

import com.example.QuizRush.dto.websocket.WebSocketMessageType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
public class QuizTimerService {
    // Store active timers (ScheduledFuture) for each room
    private final ConcurrentHashMap<String, ScheduledFuture<?>> activeTimers;

    // Store remaining time for each room
    private final ConcurrentHashMap<String, AtomicInteger> remainingTimes;

    // Store original question durations for each room
    private final ConcurrentHashMap<String, Integer> originalDurations;

    // Store participant timings: roomCode -> (participantId -> timeSpent)
    private final ConcurrentHashMap<String, ConcurrentHashMap<Long, Integer>> participantTimings;

    // Store timestamp when each question started: roomCode -> startTimestamp
    private final ConcurrentHashMap<String, Long> questionStartTimes;

    // Store whether participant has answered current question: roomCode -> (participantId -> hasAnswered)
    private final ConcurrentHashMap<String, ConcurrentHashMap<Long, Boolean>> participantAnsweredStatus;

    private final ScheduledExecutorService scheduler;

    private final WebSocketService webSocketService;
    @Lazy
    private final QuizSessionService quizSessionService;

    public QuizTimerService(@Lazy QuizSessionService quizSessionService, WebSocketService webSocketService) {
        this.quizSessionService = quizSessionService;
        this.webSocketService = webSocketService;
        this.activeTimers = new ConcurrentHashMap<>();
        this.remainingTimes = new ConcurrentHashMap<>();
        this.originalDurations = new ConcurrentHashMap<>();
        this.participantTimings = new ConcurrentHashMap<>();
        this.questionStartTimes = new ConcurrentHashMap<>();
        this.participantAnsweredStatus = new ConcurrentHashMap<>();
        this.scheduler = Executors.newScheduledThreadPool(1);
    }

    public void startQuestionTimer(String roomCode, int durationInSeconds) {
        // Stop existing timer if any
        stopQuestionTimer(roomCode);

        // Store the original duration
        originalDurations.put(roomCode, durationInSeconds);

        // Store the question start timestamp
        questionStartTimes.put(roomCode, System.currentTimeMillis());

        // Reset participant answered status for new question
        participantAnsweredStatus.put(roomCode, new ConcurrentHashMap<>());

        // Initialize remaining time
        AtomicInteger remainingTime = new AtomicInteger(durationInSeconds);
        remainingTimes.put(roomCode, remainingTime);

        // Schedule periodic timer updates
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            int timeLeft = remainingTime.decrementAndGet();

            // Send timer update
            webSocketService.broadcastTimerUpdate(roomCode, timeLeft);

            if (timeLeft <= 0) {
                stopQuestionTimer(roomCode);
                webSocketService.broadcastQuestionEnded(roomCode);
                quizSessionService.handleQuestionTimeout(roomCode);
            }
        }, 0, 1, TimeUnit.SECONDS);

        activeTimers.put(roomCode, future);
    }

    public void stopQuestionTimer(String roomCode) {
        ScheduledFuture<?> future = activeTimers.remove(roomCode);
        if (future != null) {
            future.cancel(false);
        }
        // We keep the remainingTimes and originalDurations for potential calculations
        // They'll be cleaned up in cleanupRoom()
    }

    public void recordAnswerTime(String roomCode, Long participantId, int timeSpent) {

        // Check if participant has already answered this question
        ConcurrentHashMap<Long, Boolean> answeredMap = participantAnsweredStatus.computeIfAbsent(
                roomCode, k -> new ConcurrentHashMap<>());


        // Mark participant as having answered this question
        answeredMap.put(participantId, true);

        // Don't record times greater than the question duration
        int maxDuration = originalDurations.getOrDefault(roomCode, 0);
        if (timeSpent > maxDuration) {
            timeSpent = maxDuration;
        }

        // Get or create the map for this room
        ConcurrentHashMap<Long, Integer> roomTimings = participantTimings.computeIfAbsent(roomCode,
                k -> new ConcurrentHashMap<>());

        // Get existing time and add new time
        int currentTotal = roomTimings.getOrDefault(participantId, 0);
        int newTotal = currentTotal + timeSpent;

        roomTimings.put(participantId, newTotal);
    }

    /**
     * Calculate time spent based on exact duration since question start
     * instead of using the remaining time. This ensures consistent timing
     * for all participants regardless of when they answer.
     */
    public int calculateTimeSpentExact(String roomCode) {
        Long startTime = questionStartTimes.get(roomCode);

        long currentTime = System.currentTimeMillis();
        long elapsedMillis = currentTime - startTime;
        int elapsedSeconds = (int) (elapsedMillis / 1000);

        // Cap time spent at question duration
        int maxDuration = originalDurations.getOrDefault(roomCode, 0);
        return Math.min(elapsedSeconds, maxDuration);
    }

    public int getRemainingTime(String roomCode) {
        AtomicInteger remaining = remainingTimes.get(roomCode);
        return remaining != null ? remaining.get() : 0;
    }

    public int getTotalTime(String roomCode, Long participantId) {
        return participantTimings.getOrDefault(roomCode, new ConcurrentHashMap<>())
                .getOrDefault(participantId, 0);
    }

    public void cleanupRoom(String roomCode) {
        stopQuestionTimer(roomCode);
        participantTimings.remove(roomCode);
        originalDurations.remove(roomCode);
        remainingTimes.remove(roomCode);
        questionStartTimes.remove(roomCode);
        participantAnsweredStatus.remove(roomCode);
    }
}