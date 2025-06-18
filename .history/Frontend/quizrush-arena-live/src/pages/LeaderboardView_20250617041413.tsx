import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LeaderboardEntry, websocketService } from '@/lib/websocket'; // Changed from Websocket to websocket
import { toast } from 'sonner';
import { LeaderboardData } from '@/lib/websocket'; // Changed from Websocket to websocket
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
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Debug logging function
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
  }, []);

  // WebSocket connection
  useEffect(() => {
    addDebugLog('LeaderboardView component mounted');
    
    const roomCode = localStorage.getItem('roomCode');
    const participantId = localStorage.getItem('participantId');

    addDebugLog(`Retrieved from localStorage - roomCode: ${roomCode}, participantId: ${participantId}, quizId: ${quizId}`);

    if (!roomCode || !participantId || !quizId) {
      addDebugLog('Missing required data, redirecting to join-quiz');
      console.error('Missing required data:', { roomCode, participantId, quizId });
      navigate('/join-quiz');
      return;
    }

    let isSubscribed = true;
    let reconnectAttempt = 0;
    const maxReconnectAttempts = 3;

    const connectWebSocket = async () => {
      try {
        addDebugLog(`Attempting WebSocket connection (attempt ${reconnectAttempt + 1})`);
        setConnectionStatus('connecting');

        // Check if already connected
        if (websocketService.isConnected()) {
          addDebugLog('WebSocket already connected');
          setConnectionStatus('connected');
        } else {
          addDebugLog('Connecting to WebSocket...');
          await websocketService.connect();
          addDebugLog('WebSocket connected successfully');
          setConnectionStatus('connected');
        }

        addDebugLog(`Subscribing to quiz room: ${roomCode}`);
        
        await websocketService.subscribeToQuiz(roomCode, {
          onNewQuestion: (question) => {
            if (!isSubscribed) return;
            addDebugLog('Received NEW_QUESTION message');
            // Clear old question cache before navigating
            queryClient.removeQueries(['currentQuestion', quizId]);
            navigate(`/participant-quiz/${quizId}/${participantId}`, { replace: true });
          },
          
          onLeaderboardUpdate: (leaderboard: LeaderboardData) => {
            if (!isSubscribed) return;
            
            addDebugLog('Received LEADERBOARD_UPDATE message');
            console.log('Raw leaderboard data:', leaderboard);
            
            // Detailed validation and logging
            if (!leaderboard) {
              addDebugLog('ERROR: Leaderboard data is null/undefined');
              return;
            }

            if (!leaderboard.entries) {
              addDebugLog('ERROR: Leaderboard entries is null/undefined');
              console.error('Leaderboard structure:', Object.keys(leaderboard));
              return;
            }

            if (!Array.isArray(leaderboard.entries)) {
              addDebugLog(`ERROR: Leaderboard entries is not an array, type: ${typeof leaderboard.entries}`);
              return;
            }

            addDebugLog(`Processing ${leaderboard.entries.length} leaderboard entries`);
            addDebugLog(`Is final standings: ${leaderboard.isFinal}`);

            // Find current participant
            const participantIdNum = parseInt(participantId);
            const participant = leaderboard.entries.find(
              entry => entry.participantId === participantIdNum
            );
            
            if (participant) {
              addDebugLog(`Found current participant: score=${participant.score}, rank=${participant.rank}`);
              setScore(participant.score);
              setRank(participant.rank);
            } else {
              addDebugLog(`Current participant (ID: ${participantIdNum}) not found in leaderboard`);
              console.log('Available participant IDs:', leaderboard.entries.map(e => e.participantId));
            }

            // Transform leaderboard entries with better error handling
            const entries = leaderboard.entries.map((entry, index) => {
              addDebugLog(`Processing entry ${index + 1}: ID=${entry.participantId}, nickname=${entry.nickname}, score=${entry.score}`);
              
              // Validate entry structure
              if (!entry.participantId && entry.participantId !== 0) {
                addDebugLog(`WARNING: Entry ${index} missing participantId`);
              }
              if (!entry.nickname) {
                addDebugLog(`WARNING: Entry ${index} missing nickname`);
              }
              if (entry.score === undefined || entry.score === null) {
                addDebugLog(`WARNING: Entry ${index} missing score`);
              }

              return {
                participantId: entry.participantId || 0,
                rank: entry.rank || (index + 1),
                nickname: entry.nickname || 'Unknown',
                score: entry.score || 0,
                totalTimeSpent: entry.totalTimeSpent || 0
              };
            });
            
            addDebugLog(`Successfully transformed ${entries.length} entries`);
            console.log('Transformed leaderboard entries:', entries);
            
            setLeaderboardData(entries);
            setTotalParticipants(leaderboard.entries.length);
            setIsFinalStandings(leaderboard.isFinal || false);
          },
          
          onQuizEnded: () => {
            if (!isSubscribed) return;
            addDebugLog('Received QUIZ_ENDED message');
            setIsFinalStandings(true);
            toast.info('Quiz has ended!', {
              position: 'top-center'
            });
            navigate(`/participant-summary/${quizId}/${participantId}`, { replace: true });
          },
          
          onError: (error) => {
            addDebugLog(`WebSocket message error: ${error}`);
            console.error('WebSocket message error:', error);
            setConnectionStatus('error');
            toast.error('Connection error. Please refresh the page.', {
              position: 'top-center'
            });
          }
        });

        addDebugLog(`Successfully subscribed to room: ${roomCode}`);
        reconnectAttempt = 0; // Reset on successful connection

      } catch (error) {
        addDebugLog(`WebSocket connection error: ${error}`);
        console.error('WebSocket connection error:', error);
        setConnectionStatus('error');
        
        reconnectAttempt++;
        if (reconnectAttempt < maxReconnectAttempts && isSubscribed) {
          addDebugLog(`Retrying connection in 3 seconds (attempt ${reconnectAttempt}/${maxReconnectAttempts})`);
          setTimeout(() => {
            if (isSubscribed) {
              connectWebSocket();
            }
          }, 3000);
        } else {
          addDebugLog('Max reconnection attempts reached or component unmounted');
          toast.error('Unable to connect. Please refresh the page.', {
            position: 'top-center'
          });
        }
      }
    };

    // Start connection
    connectWebSocket();

    // Cleanup function
    return () => {
      addDebugLog('Cleaning up WebSocket connection');
      isSubscribed = false;
      if (roomCode) {
        websocketService.unsubscribeFromQuiz(roomCode);
      }
      if (quizId) {
        queryClient.removeQueries(['currentQuestion', quizId]);
      }
    };
  }, [quizId, navigate, queryClient, addDebugLog]);

  // Show leaderboard with animation delay
  useEffect(() => {
    const timer = setTimeout(() => {
      addDebugLog('Showing leaderboard animation');
      setShowLeaderboard(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [addDebugLog]);

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

      {/* Top bar with connection status */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="text-white text-sm bg-black/20 px-3 py-1 rounded">
          Status: {connectionStatus}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-white text-3xl font-bold mb-8 animate-fade-in">
          {isFinalStandings ? '🎉 Final Standings 🎉' : 'Leaderboard'}
        </div>

        {/* Debug panel - Enhanced */}
        <div className="text-white text-xs mb-4 bg-black/40 p-4 rounded max-w-4xl w-full max-h-48 overflow-y-auto">
          <div className="font-bold mb-2">Debug Information:</div>
          <div>Entries loaded: {leaderboardData.length}</div>
          <div>Connection: {connectionStatus}</div>
          <div>Total participants: {totalParticipants}</div>
          <div>Current score: {score}, rank: {rank}</div>
          <div className="mt-2 text-xs">
            <div className="font-semibold">Recent logs:</div>
            {debugLogs.map((log, index) => (
              <div key={index} className="truncate">{log}</div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full">
          {connectionStatus === 'connecting' ? (
            <div className="text-white text-center text-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              Connecting to quiz...
            </div>
          ) : connectionStatus === 'error' ? (
            <div className="text-red-400 text-center text-lg">
              <div className="mb-4">❌ Connection Error</div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
              >
                Refresh Page
              </button>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-white text-center text-lg">
              <div className="animate-pulse mb-4">⏳</div>
              Waiting for leaderboard data...
              <div className="text-sm mt-2 opacity-75">
                Make sure the quiz host has started the quiz
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboardData.map((entry, index) => (
                <div
                  key={`${entry.participantId}-${entry.nickname}-${index}`}
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
                      <div className="text-2xl font-bold min-w-[3rem] text-center">
                        {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-lg font-semibold">{entry.nickname}</div>
                          <div className="text-sm opacity-75">{entry.totalTimeSpent}s</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold">{entry.score.toLocaleString()}</div>
                      <div className="text-sm opacity-75">points</div>
                    </div>
                  </div>

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

      {/* Confetti animation */}
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