
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/AuthNavbar';
import { toast } from 'sonner';

const JoinQuiz = () => {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleJoinQuiz = (e) => {
    e.preventDefault();
    
    if (!nickname || !roomCode) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // In a real app, you would validate the room code with your backend
    // For now, we'll just open a new tab (simulating joining a quiz room)
    localStorage.setItem('participant', JSON.stringify({ nickname, roomCode }));
    
    toast.success('Joining quiz room...');
    
    // Open a new tab for the quiz room
    window.open(`/quiz-room?code=${roomCode}&nickname=${encodeURIComponent(nickname)}`, '_blank');
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
                />
              </div>
              <Button className="w-full bg-quizrush-purple hover:bg-quizrush-light-purple" type="submit">
                Join Quiz
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinQuiz;
