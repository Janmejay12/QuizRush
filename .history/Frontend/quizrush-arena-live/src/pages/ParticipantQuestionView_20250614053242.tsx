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
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState(1);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [correctOptionIndices, setCorrectOptionIndices] = useState<number[]>([]);

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
      setIsAnswerCorrect(null);
      setCorrectOptionIndices([]);
      lastQuestionIdRef.current = currentQuestion.id;
    }
  }, [currentQuestion?.id]);

  // Cleanup function for navigation timeouts
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      // Clear question cache when component unmounts
      if (quizId) {
        queryClient.removeQueries(['currentQuestion', quizId]);
      }
    };
  }, [quizId, queryClient]);

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
            
            // Clear old question and set new one
            queryClient.removeQueries(['currentQuestion', quizId]);
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
            setIsAnswerCorrect(null);
            setCorrectOptionIndices([]);

            // Always navigate to question view with replace
            navigate(`/participant-quiz/${quizId}/${participantId}`, { replace: true });
          },
          onTimerUpdate: (remainingSeconds: number) => {
            if (!isSubscribed) return;
            setTimeLeft(remainingSeconds);
            if (remainingSeconds <= 0) {
      setShowResult(true);
    }
          },
          onQuestionEnded: () => {
            if (!isSubscribed) {
              return;
            }
            
            setShowResult(true);
            
            // Navigate to leaderboard after a short delay
            setTimeout(() => {
              if (isSubscribed) {
                // Clear question cache before navigating
                queryClient.removeQueries(['currentQuestion', quizId]);
                navigate(`/leaderboard/${quizId}`, { replace: true });
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
              return;
            }
            toast.info('Quiz has ended!', {
              position: 'top-center'
            });
            // Clear question cache before navigating
            queryClient.removeQueries(['currentQuestion', quizId]);
            navigate(`/leaderboard/${quizId}`, { replace: true });
          }
        });

      } catch (error) {
        console.error(' WebSocket connection error:', error);
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
    };
  }, [quizId, participantId, navigate, queryClient]);

  const handleOptionSelect = async (optionIndex: number, event: React.MouseEvent) => {
    if (!showResult && !selectedOptions.length && currentQuestion) {
      setSelectedOptions([optionIndex]);
      setShowResult(true);
      
      try {
        const result = await answerService.submitAnswer(parseInt(quizId || '0'), {
          participantId: parseInt(participantId || '0'),
          questionId: currentQuestion.id,
          selectedOptionIndices: [optionIndex]
        });

        setIsAnswerCorrect(result.correct);
        // Store correct option indices for showing correct answers
        if (result.correctOptionIndices) {
          setCorrectOptionIndices(result.correctOptionIndices);
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
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

    // If this is the selected option
    if (selectedOptions.includes(optionIndex)) {
      return isAnswerCorrect ? 'bg-green-500' : 'bg-red-500';
    }
    
    // If this is a correct option and user selected wrong answer
    if (!isAnswerCorrect && correctOptionIndices.includes(optionIndex)) {
      return 'bg-green-500';
    }
    
    // For all other unselected options, make them semi-transparent grey
    return 'bg-gray-400 opacity-40';
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
          <div className="text-white/70 text-sm mb-2">
            {currentQuestion.points} points
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">{currentQuestion.text}</h2>
          <div className="text-white/80 text-base">
            {localStorage.getItem('nickname') || `Player ${participantId}`}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-6 max-w-4xl w-full">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              onClick={(e) => handleOptionSelect(index, e)}
              className={`
                relative p-8 rounded-xl text-white text-xl font-semibold text-center cursor-pointer
                transition-all duration-300 ease-in-out min-h-[120px] flex items-center justify-center
                ${getOptionColor(index)}
                ${!showResult ? 'hover:scale-105' : ''}
              `}
            >
              <div className="relative z-10">{option}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ParticipantQuestionView;