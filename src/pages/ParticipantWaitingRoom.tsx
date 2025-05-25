
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ParticipantWaitingRoom: React.FC = () => {
  const { quizId, participantId } = useParams<{ quizId: string; participantId: string }>();
  const roomCode = '331790'; // This would come from the quiz data
  const [participants, setParticipants] = useState<string[]>([`Player${participantId}`]);

  // Mock other participants joining
  useEffect(() => {
    const timer = setTimeout(() => {
      setParticipants(prev => [...prev, 'Player2', 'Player3', 'Player4']);
    }, 2000);

    const timer2 = setTimeout(() => {
      setParticipants(prev => [...prev, 'Player5', 'Player6']);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)'
    }}>
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-pink-500/20 rounded-full animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-400/20 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-indigo-400/20 rounded-full animate-pulse-soft"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-yellow-400/15 rounded-full animate-bounce"></div>
        <div className="absolute top-3/4 right-10 w-20 h-20 bg-green-400/15 rounded-full animate-pulse"></div>
        <div className="absolute top-10 right-1/2 w-12 h-12 bg-red-400/15 rounded-full animate-ping"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="text-white text-2xl font-bold animate-pulse">QuizRush</div>
        <div className="text-white text-lg font-mono bg-white/20 px-3 py-1 rounded">{roomCode}</div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-8">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full animate-fade-in">
            <div className="mb-8">
              <div className="bg-black/40 rounded-lg p-6 mb-4 transform hover:scale-105 transition-transform">
                <div className="text-white text-lg mb-2">Playing as: Player{participantId}</div>
              </div>
            </div>

            {/* Waiting message with animation */}
            <div className="text-white text-xl mb-8 animate-pulse">
              <span className="inline-block animate-bounce">Waiting for the host to start...</span>
            </div>

            {/* Enhanced participants list */}
            <div className="bg-black/30 rounded-lg p-6">
              <div className="text-white text-lg mb-4 flex items-center">
                <span>Participants ({participants.length})</span>
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {participants.map((participant, index) => (
                  <div 
                    key={index} 
                    className={`
                      flex items-center text-white p-2 rounded transition-all duration-300
                      ${participant === `Player${participantId}` ? 'bg-purple-600/30' : 'hover:bg-white/10'}
                      animate-fade-in
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3 text-sm transform hover:scale-110 transition-transform">
                      {participant[0].toUpperCase()}
                    </div>
                    <span className="flex-1">{participant}</span>
                    {participant === `Player${participantId}` && (
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
