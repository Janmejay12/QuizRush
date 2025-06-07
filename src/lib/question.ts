import api from './api'
import { Question } from './types'

export const questionService = {
   
    getQuestionById : async (quizId : number, questionId : number) : Promise<Question> => {
        const  response = await api.get<Question>(`/questions/${questionId}?quizId=${quizId}`)
        return response.data;
    },

    getAllQuestions: async (quizId: number): Promise<Question[]> => {
        const response = await api.get<Question[]>(`/questions?quizId=${quizId}`);
        return response.data;
    },

    createQuestion: async (quizId: number, question: Question): Promise<Question> => {
        const response = await api.post<Question>(`/questions/quiz/${quizId}`, question);
        return response.data;
      },

    updateQuestion: async (questionId: number, question: Question, quizId: number): Promise<Question> => {
        const response = await api.put<Question>(`/questions/${questionId}?quizId=${quizId}`, question);
        return response.data;
      },

    deleteQuestion: async (questionId: number, quizId: number): Promise<void> => {
        await api.delete(`/questions/${questionId}?quizId=${quizId}`);
      }
    
}