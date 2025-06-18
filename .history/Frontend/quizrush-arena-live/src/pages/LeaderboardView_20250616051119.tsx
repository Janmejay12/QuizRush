import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LeaderBoardEntryDTO, websocketService } from '@/lib/Websocket';
import { toast } from 'sonner';
import { LeaderboardDTO } from '@/lib/Websocket';
import { useQueryClient } from '@tanstack/react-query';



const LeaderboardView: React.FC = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isFinalStandings, setIsFinalStandings] = useState(false);
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState(1);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState<LeaderBoardEntryDTO[]>([]);

  // WebSocket connection
  useEffect(() => {
    const roomCode = localStorage.getItem('roomCode');
    const participantId = localStorage.getItem('participantId');

    if (!roomCode || !participantId || !quizId) {
      console.error('Missing required data:', { roomCode, participantId, quizId });
      navigate('/join-quiz');
      return;
    }

    let isSubscribed = true;

    const connectWebSocket = async () => {
      try {
        if (!websocketService.isConnected()) {
          await websocketService.connect();
        }

        await websocketService.subscribeToQuiz(roomCode, {
          onNewQuestion: (question) => {
            if (!isSubscribed) return;
            // Clear old question cache before navigating
            queryClient.removeQueries(['currentQuestion', quizId]);
            navigate(`/participant-quiz/${quizId}/${participantId}`, { replace: true });
          },
          onLeaderboardUpdate: (leaderboard: LeaderboardDTO) => {
            if (!isSubscribed) return;
            
            console.log('Received leaderboard update:', leaderboard);
            
            // Check if leaderboard and entries exist
            if (!leaderboard || !leaderboard.entries || !Array.isArray(leaderboard.entries)) {
              console.warn('Invalid leaderboard data received:', leaderboard);
              return;
            }

            // Find current participant
            const participant = leaderboard.entries.find(
              entry => entry.participantId === parseInt(participantId)
            );
            
            if (participant) {
              setScore(participant.score);
              setRank(participant.rank);
              console.log('Updated participant stats:', { score: participant.score, rank: participant.rank });
            }

            // Transform leaderboard entries with better error handling
            const entries = leaderboard.entries.map((entry, index) => {
              console.log(`Processing entry ${index}:`, entry);
              
              return {
                participantId: entry.participantId || 0,
                rank: entry.rank || (index + 1),
                nickname: entry.nickname || 'Unknown',
                score: entry.score || 0,
                timeTaken: entry.totalTimeSpent || 0 // Use totalTimeSpent as confirmed by backend
              };
            });
            
            console.log('Transformed leaderboard entries:', entries);
            
            setLeaderboardData(entries);
            setTotalParticipants(leaderboard.entries.length);
            setIsFinalStandings(leaderboard.final || false); // Changed from isFinal to final
          },
          onQuizEnded: () => {
            if (!isSubscribed) return;
            setIsFinalStandings(true);
            toast.info('Quiz has ended!', {
              position: 'top-center'
            });
            // Navigate to participant summary
            navigate(`/participant-summary/${quizId}/${participantId}`, { replace: true });
          },
          onError: (error) => {
            console.error('WebSocket message error:', error);
            toast.error('Connection error. Please refresh the page.', {
              position: 'top-center'
            });
          }
        });
      } catch (error) {
        console.error('WebSocket connection error:', error);
        toast.error('Connection error. Please refresh the page.', {
          position: 'top-center'
        });
        
        // Try to reconnect after a delay
        setTimeout(() => {
          if (isSubscribed) {
            connectWebSocket();
          }
        }, 3000);
      }
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (roomCode) {
        websocketService.unsubscribeFromQuiz(roomCode);
      }
      // Clear question cache when unmounting
      if (quizId) {
        queryClient.removeQueries(['currentQuestion', quizId]);
      }
    };
  }, [quizId, navigate, queryClient]);

  // Show leaderboard with animation delay
  useEffect(() => {
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
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-500/20 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-green-500/20 rounded-full animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-400/20 rounded-full animate-float"></div>
        
        {/* Additional celebration elements */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center p-6">
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-white text-3xl font-bold mb-8 animate-fade-in">
          {isFinalStandings ? '🎉 Final Standings 🎉' : 'Leaderboard'}
        </div>

        {/* Debug info - remove this in production */}
        <div className="text-white text-sm mb-4 bg-black/20 p-2 rounded">
          Debug: {leaderboardData.length} entries loaded
        </div>

        {/* Leaderboard */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full">
          {leaderboardData.length === 0 ? (
            <div className="text-white text-center text-lg">
              Waiting for leaderboard data...
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboardData.map((entry, index) => (
                <div
                  key={`${entry.participantId}-${entry.nickname}`}
                  className={`
                    ${getRankColor(entry.rank)} 
                    rounded-xl p-6 text-white transform transition-all duration-500 ease-out relative overflow-hidden
                    ${showLeaderboard ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                    hover:scale-105
                  `}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="text-2xl font-bold min-w-[3rem] text-center">
                        {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                      </div>
                      
                      {/* Avatar and nickname */}
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-lg font-semibold">{entry.nickname}</div>
                          <div className="text-sm opacity-75">{entry.t}s</div>
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
                    <div className="absolute -top-1 -left-1 -right-1 h-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 rounded-t-xl opacity-75 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Next question countdown or final message */}
          <div className="mt-8 text-center">
            {isFinalStandings ? (
              <div className="text-white text-xl animate-bounce">
                🎊 Congratulations to all participants! 🎊
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>

      {/* Original confetti animation */}
      {showLeaderboard && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'][Math.floor(Math.random() * 6)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardView;