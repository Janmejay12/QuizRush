package com.example.QuizRush.service;

import com.example.QuizRush.dto.AnswerResult;
import com.example.QuizRush.dto.AnswerSubmission;
import com.example.QuizRush.entities.Participant;
import com.example.QuizRush.entities.Question;
import com.example.QuizRush.entities.Quiz;
import com.example.QuizRush.entities.enums.QuizStatus;
import com.example.QuizRush.exception.CustomException;
import com.example.QuizRush.repository.ParticipantRepository;
import com.example.QuizRush.repository.QuestionRepository;
import com.example.QuizRush.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class AnswerService {
    private final ParticipantRepository participantRepository;
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    @Autowired
    public AnswerService(ParticipantRepository participantRepository,
                         QuestionRepository questionRepository,
                         QuizRepository quizRepository) {
        this.participantRepository = participantRepository;
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }
    public AnswerResult processAnswer(Long quizId, AnswerSubmission answerSubmission, Authentication authentication){


        // 1. Extract participant information from the authentication token
        String participantNickname = authentication.getName();

        // 2. Find the authenticated participant
        Participant participant = participantRepository.findByNickname(participantNickname)
                .orElseThrow(() -> new CustomException("Authenticated participant not found"));

        // 3. Validate that participant belongs to this quiz
        if (!participant.getQuiz().getId().equals(quizId)) {
            throw new CustomException("Participant does not belong to this quiz");
        }

        // 4. Override any participant ID in the submission with the authenticated one
        Long authenticatedParticipantId = participant.getId();
        answerSubmission.setParticipantId(authenticatedParticipantId);

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException("Quiz not found"));


        if(!quiz.getStatus().equals(QuizStatus.STARTED))
            throw new CustomException("Quiz is not started yet");

        Question question = questionRepository.findById(answerSubmission.getQuestionId()).
                orElseThrow(() -> new CustomException("Question not found"));

        if(!quiz.getCurrentQuestion().getId().equals(answerSubmission.getQuestionId()))
            throw new CustomException("This is not the current question");

        List<Integer> correctOptionIndices = question.getCorrectOptionIndices();
        List<Integer> submittedOptionIndices = answerSubmission.getSelectedOptionIndices();
        int correctlySelected = 0;
        int incorrectlySelected = 0;
        int totalCorrectOptions = correctOptionIndices.size();

        for(Integer selectedIndex : submittedOptionIndices){
            if(correctOptionIndices.contains(selectedIndex))
                correctlySelected++;
            else
                incorrectlySelected++;
        }
        boolean isFullyCorrect = (correctlySelected == totalCorrectOptions) && (incorrectlySelected == 0);

        //calculating points - zero points if any incorrect options were selected
        int pointsAwarded = 0;
        if(incorrectlySelected == 0){
            double fraction = (double) correctlySelected / totalCorrectOptions;
            pointsAwarded = (int) Math.round(question.getPoints() * fraction);
        }

        int currentScore = participant.getScore();
        int newScore = currentScore + pointsAwarded;
        participant.setScore(newScore);
        participantRepository.save(participant);
        // Prepare response message
        String message;
        if (isFullyCorrect) {
            message = "Correct answer!";
        } else if (pointsAwarded > 0) {
            message = "Partially correct. You selected " + correctlySelected + " out of " +
                    totalCorrectOptions + " correct options.";
        } else {
            message = "Incorrect answer.";
        }

        return new AnswerResult(
                isFullyCorrect,
                pointsAwarded,
                newScore,
                message,
                correctOptionIndices
        );

    }
}
