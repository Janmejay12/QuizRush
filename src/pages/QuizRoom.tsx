
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RoomData {
  nickname: string;
  roomCode: string;
}

const QuizRoom: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState<RoomData>({
    nickname: '',
    roomCode: ''
  });

  useEffect(() => {
    const nickname = searchParams.get('nickname');
    const roomCode = searchParams.get('code');
    
    if (!nickname || !roomCode) {
      navigate('/join-quiz');
      return;
    }
    
    setRoomData({
      nickname,
      roomCode
    });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-quizrush-light-gray p-6">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-quizrush-purple text-white py-6">
            <CardTitle className="text-2xl font-bold">
              Quiz Room: {roomData.roomCode}
            </CardTitle>
            <p className="mt-2">Playing as: {roomData.nickname}</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Waiting for the quiz to start...</h2>
              <p className="text-gray-600 mb-8">The host will begin the quiz soon.</p>
              <Button 
                variant="outline" 
                className="border-quizrush-purple text-quizrush-purple hover:bg-quizrush-purple hover:text-white"
                onClick={() => window.close()}
              >
                Leave Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizRoom;
