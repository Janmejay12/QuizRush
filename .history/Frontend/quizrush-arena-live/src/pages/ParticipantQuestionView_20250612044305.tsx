import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CircularTimer from '@/components/quiz/CircularTimer';
import { websocketService } from '@/lib/Websocket';
import { QuestionDTO } from '@/lib/Websocket';
import { quizSessionService } from '@/lib/quiz-session';
import { answerService } from '@/lib/answer';
import { toast } from 'sonner';

const ParticipantQuestionView: React.FC = () => {
  const { quizId, participantId } = useParams<{ quizId: string; participantId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState(1);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  
  // Refs to track navigation and question state
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastQuestionIdRef = useRef<number | null>(null);
  const hasNavigatedRef = useRef(false);

  // Fetch current question using useQuery
  const { data: currentQuestion, isLoading } = useQuery({
    queryKey: ['currentQuestion', quizId],
    queryFn: () => quizSessionService.getCurrentQuestion(parseInt(quizId || '0')),
    enabled: !!quizId,
    refetchOnWindowFocus: false,
    staleTime: Infinity // Prevent automatic refetching
  });

  // Reset states when new question arrives
  useEffect(() => {
    if (currentQuestion) {
      setSelectedOptions([]);
      setShowResult(false);
      setShowConfetti(false);
      setIsAnswerCorrect(null);
    }
  }, [currentQuestion?.id]);

  // Cleanup function for navigation timeouts
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // WebSocket connection and subscription
  useEffect(() => {
    const roomCode = localStorage.getItem('roomCode');
    if (!roomCode) {
      console.error('Room code not found');
      navigate('/join-quiz');
      return;
    }

    let isSubscribed = true;

    const connectWebSocket = async () => {
      try {
        // Check if already connected
        if (!websocketService.isConnected()) {
          await websocketService.connect();
        }

        // Subscribe to quiz events
        await websocketService.subscribeToQuiz(roomCode, {
          onNewQuestion: (question: QuestionDTO) => {
            if (!isSubscribed) {
              return;
            }
            
            // Update question in cache
            queryClient.setQueryData(['currentQuestion', quizId], {
              id: question.id,
              text: question.text,
              options: question.options,
              duration: question.duration,
              points: question.points
            });
            
            // Reset states for new question
            setTimeLeft(question.duration);
            setSelectedOptions([]);
            setShowResult(false);
            setShowConfetti(false);
            setIsAnswerCorrect(null);

            // Always navigate to question view with replace
            console.log('🔀 Navigating to question view...');
            navigate(`/participant-quiz/${quizId}/${participantId}`, { replace: true });
            console.log('✅ Navigation to question view complete');
          },
          onTimerUpdate: (remainingSeconds: number) => {
            if (!isSubscribed) return;
            console.log('⏱️ Timer update:', remainingSeconds);
            setTimeLeft(remainingSeconds);
            if (remainingSeconds <= 0) {
              console.log('⏰ Timer reached zero, showing result');
              setShowResult(true);
            }
          },
          onQuestionEnded: () => {
            if (!isSubscribed) {
              console.log('❌ Ignoring question ended - component unsubscribed');
              return;
            }
            
            console.log('🏁 Question ended event received');
            setShowResult(true);
            
            // Navigate to leaderboard after a short delay
            console.log('⏳ Starting navigation delay timer');
            setTimeout(() => {
              if (isSubscribed) {
                console.log('🔀 Navigating to leaderboard...');
                navigate(`/leaderboard/${quizId}`, { replace: true });
                console.log('✅ Navigation to leaderboard complete');
              } else {
                console.log('❌ Navigation cancelled - component unsubscribed');
              }
            }, 2000);
          },
          onLeaderboardUpdate: (leaderboard) => {
            if (!isSubscribed) return;
            console.log('📊 Received leaderboard update');
            const participant = leaderboard.entries.find(
              entry => entry.participantId === parseInt(participantId || '0')
            );
            if (participant) {
              console.log('📈 Updating participant stats:', { 
                score: participant.score, 
                rank: participant.rank 
              });
              setScore(participant.score);
              setRank(participant.rank);
            }
            setTotalParticipants(leaderboard.entries.length);
          },
          onQuizEnded: () => {
            if (!isSubscribed) {
              console.log('❌ Ignoring quiz ended - component unsubscribed');
              return;
            }
            console.log('🎬 Quiz ended event received');
            toast.info('Quiz has ended!', {
              position: 'top-center'
            });
            console.log('🔀 Navigating to final leaderboard...');
            navigate(`/leaderboard/${quizId}`, { replace: true });
            console.log('✅ Navigation to final leaderboard complete');
          }
        });

        console.log('✅ Successfully subscribed to quiz room:', roomCode);
      } catch (error) {
        console.error('❌ WebSocket connection error:', error);
        toast.error('Connection error. Please refresh the page.', {
          position: 'top-center'
        });

        // Try to reconnect after a delay
        console.log('🔄 Scheduling reconnection attempt...');
        setTimeout(() => {
          if (isSubscribed) {
            console.log('🔄 Attempting to reconnect...');
            connectWebSocket();
          } else {
            console.log('❌ Reconnection cancelled - component unsubscribed');
          }
        }, 3000);
      }
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up WebSocket component...', {
        quizId,
        participantId,
        pathname: location.pathname
      });
      isSubscribed = false;
    };
  }, [quizId, participantId, navigate, queryClient]);

  const handleOptionSelect = async (optionIndex: number, event: React.MouseEvent) => {
    console.log('🖱️ Option selected:', { optionIndex, showResult, selectedOptions });
    if (!showResult && !selectedOptions.length && currentQuestion) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setConfettiPosition({ 
        x: rect.left + rect.width / 2, 
        y: rect.top + rect.height / 2 
      });
      
      setSelectedOptions([optionIndex]);
      setShowResult(true);
      console.log('📤 Submitting answer...');

      try {
        const result = await answerService.submitAnswer(parseInt(quizId || '0'), {
          participantId: parseInt(participantId || '0'),
          questionId: currentQuestion.id,
          selectedOptionIndices: [optionIndex]
        });

        console.log('📥 Answer submission result:', result);
        setIsAnswerCorrect(result.correct);
        if (result.correct) {
          console.log('🎉 Correct answer! Showing confetti');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } catch (error) {
        console.error('❌ Error submitting answer:', error);
        toast.error('Failed to submit answer', {
          position: 'top-center'
        });
      }
    }
  };

  const getOptionColor = (optionIndex: number) => {
    if (!showResult) {
      return optionColors[optionIndex];
    }

    if (selectedOptions.includes(optionIndex)) {
      return isAnswerCorrect ? 'bg-green-500' : 'bg-red-500';
    }
    return 'opacity-0'; // Hide unselected options
  };

  const optionColors = ['bg-blue-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500'];

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Waiting for question...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Top bar */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-500 px-3 py-1 rounded text-black font-bold text-sm">
            {rank}/{totalParticipants}
          </div>
          <div className="bg-gray-600 px-3 py-1 rounded text-white text-sm">
            {currentQuestion.points} pts
          </div>
        </div>
        <div className="text-white text-lg">{score} points</div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* Timer */}
        <div className="mb-8">
          <CircularTimer 
            timeLeft={timeLeft || 0} 
            totalTime={currentQuestion.duration} 
          />
        </div>

        {/* Question */}
        <div className="bg-black/60 backdrop-blur-md rounded-xl p-6 mb-8 max-w-2xl w-full text-center">
          <h2 className="text-white text-2xl font-bold">{currentQuestion.text}</h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-6 max-w-4xl w-full">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              onClick={(e) => handleOptionSelect(index, e)}
              className={`
                relative p-8 rounded-xl text-white text-xl font-semibold text-center cursor-pointer
                transition-all duration-300 ease-in-out
                ${getOptionColor(index)}
                ${showResult && selectedOptions.includes(index) ? 'transform scale-105' : 'hover:scale-105'}
              `}
            >
              <div className="relative z-10">{option}</div>
              {showResult && selectedOptions.includes(index) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl">
                    {isAnswerCorrect ? '✓' : '✗'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-8 flex items-center space-x-4">
          <div className="text-white text-lg">
            {localStorage.getItem('nickname') || `Player ${participantId}`}
          </div>
        </div>
      </div>

      {/* Party popper animation for correct answers */}
      {showConfetti && (
        <div 
          className="fixed pointer-events-none z-50"
          style={{
            left: confettiPosition.x - 100,
            top: confettiPosition.y - 100,
            width: '200px',
            height: '200px'
          }}
        >
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800'][Math.floor(Math.random() * 6)],
                borderRadius: '50%',
                position: 'absolute',
                animation: `party-popper-${Math.floor(Math.random() * 3)} ${1 + Math.random()}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes party-popper-0 {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(${Math.random() * 200 - 100}px, ${-Math.random() * 200}px) scale(1); opacity: 0; }
        }
        @keyframes party-popper-1 {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(${Math.random() * -200}px, ${Math.random() * 200 - 100}px) scale(1); opacity: 0; }
        }
        @keyframes party-popper-2 {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(${Math.random() * 200}px, ${Math.random() * 200 - 100}px) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ParticipantQuestionView;
