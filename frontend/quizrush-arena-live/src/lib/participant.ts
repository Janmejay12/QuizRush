import api from './api'
import { Participant } from './types';

export interface ParticipantLoginRequest {
  nickname: string;
  quizRoomCode: string;
}

export interface ParticipantLoginResponse {
  token: string;
  participantId: number;
  quizId: number;
}

export const participantService = {
  
  joinQuiz: async (request: ParticipantLoginRequest): Promise<ParticipantLoginResponse> => {
    const response = await api.post<ParticipantLoginResponse>('/participant/join', request);
    return response.data;
  },
  
  getParticipants: async (quizId : number): Promise<Participant[]> => {
    const response = await api.get<Participant[]>(`/participant/quiz/${quizId}`);
    return response.data;
  },
  // Leave a quiz
  leaveQuiz: async (roomCode: string): Promise<void> => {
    await api.post(`/participant/leave/${roomCode}`);
  }
}