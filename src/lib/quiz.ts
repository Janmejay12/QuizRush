import api from './api'
import { Quiz } from './types';
import { Question } from './types';


export const quizService = {
    getAllQuizzes : async () : Promise<Quiz[]> => {
        const hostId = localStorage.getItem('userId');
        const response = await api.get<Quiz[]>(`/quizzes?hostId=${hostId}`)
        return response.data;
    },

    getQuizById : async (quizId: number) : Promise<Quiz> => {
        const hostId = localStorage.getItem('userId');
        const response = await api.get<Quiz>(`/quizzes/${quizId}?hostId=${hostId}`)
        return response.data
    },

    createQuiz : async (quiz : Quiz): Promise<Quiz> =>{
        const hostId = localStorage.getItem('userId');
        const response = await api.post<Quiz>(`/quizzes/host/${hostId}`,quiz)
        return response.data
    },
    
    updateQuiz: async (quizId: number, quiz: Quiz): Promise<Quiz> => {
        const hostId = localStorage.getItem('userId');
        const response = await api.put<Quiz>(`/quizzes/${quizId}?hostId=${hostId}`, quiz);
        return response.data;
      },

    deleteQuiz: async (quizId: number): Promise<void> => {
        const hostId = localStorage.getItem('userId');
        await api.delete(`/quizzes/${quizId}?hostId=${hostId}`);
      },
      
      
    getQuizQuestions: async (quizId: number): Promise<Question[]> => {
        const hostId = localStorage.getItem('userId');
        const response = await api.get<Question[]>(`/quizzes/questions/quiz/${quizId}?hostId=${hostId}`);
        return response.data;
      }
}