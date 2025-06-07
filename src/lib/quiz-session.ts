import api from './api'
import { Question } from './types'
import { Participant } from './types'
import { Quiz } from './types';

  
  export const quizSessionService = {

    // Open a quiz for participants to join
    openQuizForParticipants: async (quizId: number): Promise<Quiz> => {
      const hostId = localStorage.getItem('userId');
      console.log("Opening quiz with hostId:", hostId);
      try {
        const response = await api.post<Quiz>(`/quiz-sessions/${quizId}/open?hostId=${hostId}`);
        return response.data;
      } catch (error) {
        console.error("Error opening quiz:", error.response?.data || error);
        throw error;
      }
    },
    
    // Start a quiz
    startQuiz: async (quizId: number): Promise<Quiz> => {
      const hostId = localStorage.getItem('userId');
      const response = await api.post<Quiz>(`/quiz-sessions/${quizId}/start?hostId=${hostId}`);
      return response.data
    },
    
    // End a quiz
    endQuiz: async (quizId: number): Promise<Quiz> => {
      const hostId = localStorage.getItem('userId');
      const response = await api.post<Quiz>(`/quiz-sessions/${quizId}/end?hostId=${hostId}`);
      return response.data
    },
    
    // Get the current question
    getCurrentQuestion: async (quizId: number): Promise<Question> => {
      const response = await api.get<Question>(`/quiz-sessions/${quizId}/current-question`);
      return response.data;
    },
    
    // Move to the next question
    nextQuestion: async (quizId: number): Promise<Question> => {
      const hostId = localStorage.getItem('userId');
      const response = await api.post<Question>(`/quiz-sessions/${quizId}/next-question?hostId=${hostId}`);
      return response.data;
    },
    
    // Get all participants for a quiz
    getParticipants: async (quizId: number): Promise<Participant[]> => {
      const response = await api.get<Participant[]>(`/quiz-sessions/${quizId}/participants`);
      return response.data;
    },
    
    // Remove a participant from a quiz
    removeParticipant: async (quizId: number, participantId: number): Promise<void> => {
      const hostId = localStorage.getItem('userId');
      await api.delete(`/quiz-sessions/${quizId}/participants/${participantId}?hostId=${hostId}`);
    },
    
    // Get the status of a quiz
    getQuizStatus: async (quizId: number): Promise<string> => {
      const response = await api.get<{status: string}>(`/quiz-sessions/${quizId}/status`);
      return response.data.status;
    }
  };