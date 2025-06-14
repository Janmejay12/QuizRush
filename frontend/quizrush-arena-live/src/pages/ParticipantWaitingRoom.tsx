import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { participantService } from '@/lib/participant';
import { Participant } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { websocketService } from '@/lib/Websocket';

const ParticipantWaitingRoom: React.FC = () => {
  const { quizId: urlQuizId, participantId: urlParticipantId } = useParams<{ quizId: string; participantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get IDs from URL or fallback to localStorage
  const quizId = urlQuizId || localStorage.getItem('quizId');
  const participantId = urlParticipantId || localStorage.getItem('participantId');
  
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

  // Retrieve nickname and roomCode from localStorage
  const nickname = localStorage.getItem('nickname') || 'Unknown';
  const roomCode = localStorage.getItem('roomCode') || 'Unknown';

  // Redirect if missing essential data
  useEffect(() => {
    if (!quizId || !participantId || !roomCode) {
      console.error('Missing essential data:', { quizId, participantId, roomCode });
      toast({
        title: "Error",
        description: "Missing required information. Please join the quiz again.",
        variant: "destructive"
      });
      navigate('/join-quiz');
      return;
    }
  }, [quizId, participantId, roomCode, navigate, toast]);

  // WebSocket connection
  useEffect(() => {
    if (!roomCode) return;

    let isSubscribed = true;

    const connectWebSocket = async () => {
      try {
        if (!websocketService.isConnected()) {
          await websocketService.connect();
        }

        await websocketService.subscribeToQuiz(roomCode, {
          onQuizStarted: () => {
            if (!isSubscribed) return;
            navigate(`/participant-quiz/${quizId}/${participantId}`, { replace: true });
          },
          onError: (error) => {
            console.error('WebSocket error:', error);
            toast({
              title: "Connection Error",
              description: "Failed to connect to quiz room. Please refresh the page.",
              variant: "destructive"
            });
          }
        });
      } catch (error) {
        console.error('WebSocket connection error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to quiz room. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    connectWebSocket();

    return () => {
      isSubscribed = false;
    };
  }, [roomCode, quizId, participantId, navigate, toast]);

  // Fetch participants using useQuery
  const {
    data: participants = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['participants', quizId],
    queryFn: () => {
      if (!quizId) return Promise.resolve([]);
      return participantService.getParticipants(parseInt(quizId));
    },
    enabled: !!quizId,
    refetchInterval: 3000 // Poll every 3 seconds for new participants
  });

  // Find current participant when participants data changes
  useEffect(() => {
    if (participants.length > 0 && participantId) {
      const current = participants.find(p => p.id === parseInt(participantId));
      if (current) {
        setCurrentParticipant(current);
      }
    }
  }, [participants, participantId]);

  const handleLeaveQuiz = async () => {
    try {
      if (roomCode) {
        await participantService.leaveQuiz(roomCode);
      }
      
      localStorage.removeItem('participantId');
      localStorage.removeItem('quizId');
      localStorage.removeItem('roomCode');
      localStorage.removeItem('nickname');
      
      navigate('/join-quiz');
    } catch (error) {
      console.error('Error leaving quiz:', error);
      toast({
        title: "Error",
        description: "Failed to leave the quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Participant fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load participants. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading participants...</div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)'
    }}>
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-pink-500/20 rounded-full animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-400/20 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-indigo-400/20 rounded-full animate-pulse-soft"></div>
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="text-white text-2xl font-bold animate-pulse">QuizRush</div>
        <div className="flex items-center space-x-6">
          <Button
            variant="destructive"
            className="text-white bg-red-600 hover:bg-red-700 text-lg font-bold px-6 py-2"
            onClick={handleLeaveQuiz}
          >
            <LogOut className="w-6 h-6 mr-2" />
            Leave Quiz
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-white text-lg font-semibold">Room Code:</span>
        <div className="text-white text-lg font-mono bg-white/20 px-3 py-1 rounded">
          {roomCode}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8 w-full max-w-4xl">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 w-full animate-fade-in">
            <div className="mb-8">
              <div className="bg-black/40 rounded-lg p-6 mb-4 transform hover:scale-105 transition-transform">
                <div className="text-white text-lg mb-2">
                  Playing as: {nickname}
                </div>
              </div>
            </div>

            <div className="text-white text-xl mb-8 animate-pulse">
              <span className="inline-block animate-bounce">Waiting for the host to start...</span>
            </div>

            {/* Participants list */}
            <div className="bg-black/30 rounded-lg p-6">
              <div className="text-white text-lg mb-4 flex items-center">
                <span>Participants ({participants.length})</span>
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
              
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div 
                    key={participant.id || index} 
                    className={`
                      flex items-center text-white p-2 rounded transition-all duration-300
                      ${participant.id === parseInt(participantId || '0') ? 'bg-purple-600/30' : 'hover:bg-white/10'}
                      animate-fade-in
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3 text-sm transform hover:scale-110 transition-transform">
                      {participant.nickname[0].toUpperCase()}
                    </div>
                    <span className="flex-1">{participant.nickname}</span>
                    {participant.id === parseInt(participantId || '0') && (
                      <span className="ml-2 text-purple-300 font-semibold">(You)</span>
                    )}
                    <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-white text-lg animate-bounce">Are you ready to play? 🎮</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantWaitingRoom;