import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { participantService } from '@/lib/participant';
import { Participant } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

const ParticipantWaitingRoom: React.FC = () => {
  const { quizId, participantId } = useParams<{ quizId: string; participantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

  // Retrieve nickname and roomCode from localStorage
  const nickname = localStorage.getItem('nickname') || 'Unknown';
  const roomCode = localStorage.getItem('roomCode') || 'Unknown';

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
    refetchInterval: 3000 // Poll every 5 seconds for new participants
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

  // Handle errors
  useEffect(() => {
    if (error) {
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
      {/* Existing animated background elements */}
      <div className="absolute inset-0">
        {/* ... (keep all your existing background elements) ... */}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="text-white text-2xl font-bold animate-pulse">QuizRush</div>
        <div className="text-white text-lg font-mono bg-white/20 px-3 py-1 rounded">
          {roomCode}
        </div>
        <div className="flex space-x-2">
          {/* ... (keep your existing UI elements) ... */}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-8">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full animate-fade-in">
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
              <div className="space-y-2 max-h-48 overflow-y-auto">
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

            <div className="mt-8 text-white text-lg animate-bounce">You're ready to play! 🎮</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantWaitingRoom;