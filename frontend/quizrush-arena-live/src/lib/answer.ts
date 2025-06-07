import api from './api'

export interface AnswerSubmission {
    participantId: number;
    questionId: number;
    selectedOptionIndices: number[];
  }
  
  export interface AnswerResult {
    correct: boolean;
    pointsAwarded: number;
    totalScore: number;
    message: string;
    correctOptionIndices: number[];
  }

  export const answerService = {
    // Submit an answer
    submitAnswer: async (quizId: number, submission: AnswerSubmission): Promise<AnswerResult> => {
      const response = await api.post<AnswerResult>(`/quiz-sessions/${quizId}/submit-answer`, submission);
      return response.data;
    }
  };