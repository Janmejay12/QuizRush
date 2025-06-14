import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/AuthNavbar';
import { toast } from 'sonner';
import { participantService, ParticipantLoginRequest } from '@/lib/participant';

const JoinQuiz: React.FC = () => {
  const [nickname, setNickname] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleJoinQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname || !roomCode) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const request: ParticipantLoginRequest = {
        nickname,
        quizRoomCode: roomCode
      };
      
      const response = await participantService.joinQuiz(request);
      
      // Store all necessary data in localStorage
      localStorage.setItem('token', response.token);
      
      if (response.participantId !== null) {
        localStorage.setItem('participantId', response.participantId.toString());
      }
      
      if (response.quizId !== null) {
        localStorage.setItem('quizId', response.quizId.toString());
      }
      
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('roomCode', roomCode);
      
      toast.success('Joining quiz room...');
      
      // Navigate to quiz room with both quizId and participantId
      navigate(`/participant-waiting/${response.quizId}/${response.participantId}`);
    } catch (error: any) {
      console.error('Error joining quiz:', error);
      
      let errorMessage = 'Failed to join quiz. Please check the room code and try again.';
      
      if (error.response && error.response.status === 400) {
        errorMessage = 'Invalid room code or nickname already taken';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-quizrush-purple/90 to-quizrush-purple/70">
      <Navbar />
      <div className="container flex items-center justify-center min-h-screen py-20">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Join a Quiz</CardTitle>
            <CardDescription>Enter your nickname and the quiz room code</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinQuiz} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nickname" className="text-sm font-medium">Nickname</label>
                <Input 
                  id="nickname" 
                  type="text" 
                  placeholder="Choose a nickname" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="roomCode" className="text-sm font-medium">Room Code</label>
                <Input 
                  id="roomCode" 
                  type="text" 
                  placeholder="Enter quiz room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
              <Button 
                className="w-full bg-quizrush-purple hover:bg-quizrush-light-purple" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Joining...' : 'Join Quiz'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinQuiz;
