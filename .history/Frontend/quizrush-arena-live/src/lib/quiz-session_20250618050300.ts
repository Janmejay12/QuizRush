import api from './api'
import { Question } from './types'
import { Participant } from './types'
import { Quiz } from './types';

  export const quizSessionService = {
    // Open a quiz for participants to join
    openQuizForParticipants: async (quizId: number): Promise<Quiz> => {
      const hostId = localStorage.getItem('userId');
      try {
        const response = await api.post<Quiz>(`/quiz-sessions/${quizId}/open?hostId=${hostId}`);
        return response.data;
    } catch (error: any) {
        console.error("Error opening quiz:", error.response?.data || error);
        throw error;
      }
    },
    
    // Start a quiz
    startQuiz: async (quizId: number): Promise<Quiz> => {
      const hostId = localStorage.getItem('userId');
    if (!hostId) {
      throw new Error('Host ID not found. Please ensure you are logged in.');
    }

    try {

      const response = await api.post<Quiz>(`/quiz-sessions/${quizId}/start?hostId=${hostId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error starting quiz:", error.response?.data || error);
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Cannot start quiz. Please ensure all participants are ready and try again.';
        throw new Error(errorMessage);
      }
      throw error;
    }
    },
    
    // End a quiz
    endQuiz: async (quizId: number): Promise<Quiz> => {
      const hostId = localStorage.getItem('userId');
    if (!hostId) {
      throw new Error('Host ID not found. Please ensure you are logged in.');
    }

    try {
      const response = await api.post<Quiz>(`/quiz-sessions/${quizId}/end?hostId=${hostId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error ending quiz:", error.response?.data || error);
      throw error;
    }
    },
    
    // Get the current question
    getCurrentQuestion: async (quizId: number): Promise<Question> => {
    try {
      const response = await api.get<Question>(`/quiz-sessions/${quizId}/current-question`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting current question:", error.response?.data || error);
      throw error;
    }
    },
    
    // Move to the next question
    nextQuestion: async (quizId: number): Promise<Question> => {
      const hostId = localStorage.getItem('userId');
    if (!hostId) {
      throw new Error('Host ID not found. Please ensure you are logged in.');
    }

    try {
      const response = await api.post<Question>(`/quiz-sessions/${quizId}/next-question?hostId=${hostId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error moving to next question:", error.response?.data || error);
      throw error;
    }
    },
    
    // Get all participants for a quiz
    getParticipants: async (quizId: number): Promise<Participant[]> => {
    try {
      const response = await api.get<Participant[]>(`/quiz-sessions/${quizId}/participants`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting participants:", error.response?.data || error);
      throw error;
    }
    },
    
    // Remove a participant from a quiz
    removeParticipant: async (quizId: number, participantId: number): Promise<void> => {
      const hostId = localStorage.getItem('userId');
    if (!hostId) {
      throw new Error('Host ID not found. Please ensure you are logged in.');
    }

    try {
      await api.delete(`/quiz-sessions/${quizId}/participants/${participantId}?hostId=${hostId}`);
    } catch (error: any) {
      console.error("Error removing participant:", error.response?.data || error);
      throw error;
    }
    },
    
    // Get the status of a quiz
    getQuizStatus: async (quizId: number): Promise<string> => {
    try {
      const response = await api.get<{status: string}>(`/quiz-sessions/${quizId}/status`);
      return response.data.status;
    } catch (error: any) {
      console.error("Error getting quiz status:", error.response?.data || error);
      throw error;
    }
    }
  };