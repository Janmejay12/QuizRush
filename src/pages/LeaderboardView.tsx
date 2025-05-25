
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface LeaderboardEntry {
  rank: number;
  nickname: string;
  score: number;
  timeTaken: number;
  avatar: string;
}

const LeaderboardView: React.FC = () => {
  const { quizId, roomCode } = useParams();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Mock leaderboard data
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, nickname: 'janmejay', score: 2750, timeTaken: 3.2, avatar: '🎄' },
    { rank: 2, nickname: 'Player2', score: 2500, timeTaken: 4.1, avatar: '⚡' },
    { rank: 3, nickname: 'Player3', score: 2200, timeTaken: 5.5, avatar: '🎯' },
    { rank: 4, nickname: 'Player4', score: 1800, timeTaken: 6.2, avatar: '🚀' },
    { rank: 5, nickname: 'Player5', score: 1500, timeTaken: 7.1, avatar: '🎮' }
  ];

  useEffect(() => {
    // Show leaderboard with animation delay
    const timer = setTimeout(() => setShowLeaderboard(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default: return 'bg-gradient-to-r from-purple-500 to-purple-700';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank.toString();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-500/20 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-green-500/20 rounded-full animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-400/20 rounded-full animate-float"></div>
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-500 px-3 py-1 rounded text-black font-bold text-sm">1st</div>
          <div className="bg-gray-600 px-3 py-1 rounded text-white text-sm">Bonus</div>
        </div>
        <div className="text-white text-lg">1</div>
        <div className="text-white text-lg">331 790</div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-white text-3xl font-bold mb-8 animate-fade-in">
          Leaderboard
        </div>

        {/* Question indicator */}
        <div className="text-white text-lg mb-8 opacity-75">
          Question 3/5 Results
        </div>

        {/* Leaderboard */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full">
          <div className="space-y-4">
            {leaderboardData.map((entry, index) => (
              <div
                key={entry.nickname}
                className={`
                  ${getRankColor(entry.rank)} 
                  rounded-xl p-6 text-white transform transition-all duration-500 ease-out
                  ${showLeaderboard ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                  hover:scale-105
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="text-2xl font-bold min-w-[3rem] text-center">
                      {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                    </div>
                    
                    {/* Avatar and nickname */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center text-xl">
                        {entry.avatar}
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{entry.nickname}</div>
                        <div className="text-sm opacity-75">{entry.timeTaken}s</div>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold">{entry.score.toLocaleString()}</div>
                    <div className="text-sm opacity-75">points</div>
                  </div>
                </div>

                {/* Highlight for top 3 */}
                {entry.rank <= 3 && (
                  <div className="absolute -top-1 -left-1 -right-1 h-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 rounded-t-xl opacity-75"></div>
                )}
              </div>
            ))}
          </div>

          {/* Next question countdown */}
          <div className="mt-8 text-center">
            <div className="text-white text-lg">Next question in...</div>
            <div className="text-white text-4xl font-bold mt-2">3</div>
          </div>
        </div>
      </div>

      {/* Confetti animation */}
      {showLeaderboard && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardView;
