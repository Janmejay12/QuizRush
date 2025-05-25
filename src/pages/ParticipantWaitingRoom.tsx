
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const ParticipantWaitingRoom: React.FC = () => {
  const [searchParams] = useSearchParams();
  const nickname = searchParams.get('nickname') || 'Player';
  const roomCode = searchParams.get('code') || '331790';
  const [participants, setParticipants] = useState<string[]>([nickname]);

  // Mock other participants joining
  useEffect(() => {
    const timer = setTimeout(() => {
      setParticipants(prev => [...prev, 'Player2', 'Player3']);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
        <div className="text-white text-2xl font-bold">QuizRush</div>
        <div className="text-white text-lg">{roomCode}</div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-8">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full">
            <div className="mb-8">
              <div className="bg-black/40 rounded-lg p-6 mb-4">
                <div className="text-white text-lg mb-2">Playing as: {nickname}</div>
              </div>
            </div>

            {/* Power-ups section */}
            <div className="mb-8">
              <div className="text-white text-lg mb-4 text-left">Your power-ups</div>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-purple-600/50 rounded-lg p-4 text-center">
                  <div className="text-white text-sm mb-1">2x</div>
                  <div className="text-white text-xs">Bag twice the score for one question</div>
                </div>
                <div className="bg-orange-600/50 rounded-lg p-4 text-center">
                  <div className="text-white text-sm mb-1">Streak Saver</div>
                  <div className="text-white text-xs">Protect your streak against a wrong answer</div>
                </div>
                <div className="bg-orange-500/50 rounded-lg p-4 text-center">
                  <div className="text-white text-sm mb-1">Streak Booster</div>
                  <div className="text-white text-xs">Apply to boost your streak counter by +4</div>
                </div>
                <div className="bg-gray-600/50 rounded-lg p-4 text-center">
                  <div className="text-white text-sm mb-1">Shuffle</div>
                  <div className="text-white text-xs">3 shuffles remaining</div>
                </div>
              </div>
            </div>

            {/* Waiting message */}
            <div className="text-white text-xl mb-8">Waiting for the host to start...</div>

            {/* Participants list */}
            <div className="bg-black/30 rounded-lg p-6">
              <div className="text-white text-lg mb-4">Participants ({participants.length})</div>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center text-white">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3 text-sm">
                      {participant[0].toUpperCase()}
                    </div>
                    <span>{participant}</span>
                    {participant === nickname && <span className="ml-2 text-purple-300">(You)</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-white text-lg">You're ready to play!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantWaitingRoom;
