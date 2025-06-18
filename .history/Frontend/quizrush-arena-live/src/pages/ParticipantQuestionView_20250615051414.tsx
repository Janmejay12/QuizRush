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

  // Check if question has multiple correct answers
  const isMultipleChoice = currentQuestion?.correctOptions && currentQuestion.correctOptions.length > 1;

  // Initialize timer when currentQuestion changes - same logic as HostQuizView
  useEffect(() => {
    if (currentQuestion) {
      console.log('[Timer Init] Setting new question timer:', {
        duration: currentQuestion.duration,
        questionId: currentQuestion.id
      });
      setTimeLeft(currentQuestion.duration);
      setSelectedOptions([]);
      setShowResult(false);
      setIsAnswerCorrect(null);
      setCorrectOptionIndices([]);
      lastQuestionIdRef.current = currentQuestion.id;
    }
  }, [currentQuestion?.id]);

  // Timer effect - same logic as HostQuizView
  useEffect(() => {
    if (!currentQuestion || timeLeft === null || timeLeft < 0) {
      console.log('[Timer] Timer stopped:', {
        hasCurrentQuestion: !!currentQuestion,
        timeLeft
      });
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        console.log('[Timer] Time remaining:', timeLeft - 1);
        setTimeLeft(prev => prev !== null ? prev - 1 : 0);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      console.log('[Timer] Time is up! Showing result');
      setShowResult(true);
      // Auto-submit for multiple choice questions when time runs out
      if (isMultipleChoice && selectedOptions.length > 0) {
        handleSubmitAnswer();
      }
    }
  }, [timeLeft, currentQuestion]);

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
              points: question.points,
              correctOptions: question.correctOptions
            });
            
            // Reset states for new question
            setSelectedOptions([]);
            setShowResult(false);
            setIsAnswerCorrect(null);
            setCorrectOptionIndices([]);

            // Always navigate to question view with replace
            navigate(`/participant-quiz/${quizId}/${participantId}`, { replace: true });
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
          // In the WebSocket subscription section, update the onQuizEnded handler:

          onQuizEnded: () => {
            if (!isSubscribed) {
              return;
            }
            console.log('[Quiz End] Quiz has ended, navigating to participant summary');
            toast.info('Quiz has ended!', {
              position: 'top-center'
            });
            // Clear question cache before navigating
            queryClient.removeQueries(['currentQuestion', quizId]);
            // Navigate to participant summary instead of leaderboard
            navigate(`/participant-summary/${quizId}/${participantId}`, { replace: true });
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
      if (roomCode) {
        websocketService.unsubscribeFromQuiz(roomCode);
      }
    };
  }, [quizId, participantId, navigate, queryClient]);

  const handleOptionSelect = async (optionIndex: number, event: React.MouseEvent) => {
    if (showResult) return;

    if (isMultipleChoice) {
      // For multiple choice, toggle selection
      setSelectedOptions(prev => {
        if (prev.includes(optionIndex)) {
          return prev.filter(index => index !== optionIndex);
        } else {
          return [...prev, optionIndex];
        }
      });
    } else {
      // For single choice, select only one option and submit immediately
      if (!selectedOptions.length && currentQuestion) {
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
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || selectedOptions.length === 0) return;

    setShowResult(true);
    
    try {
      const result = await answerService.submitAnswer(parseInt(quizId || '0'), {
        participantId: parseInt(participantId || '0'),
        questionId: currentQuestion.id,
        selectedOptionIndices: selectedOptions
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
          <h2 className="text-white text-2xl font-bold">{currentQuestion.text}</h2>
          {isMultipleChoice && (
            <p className="text-gray-300 text-sm mt-2">Select multiple options and click Submit</p>
          )}
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
                ${!showResult ? 'hover:scale-105' : ''}
                ${isMultipleChoice && selectedOptions.includes(index) && !showResult ? 'ring-4 ring-white' : ''}
              `}
            >
              {/* Checkbox for multiple choice */}
              {isMultipleChoice && !showResult && (
                <div className="absolute top-2 right-2">
                  <div className={`w-6 h-6 rounded border-2 border-white flex items-center justify-center ${
                    selectedOptions.includes(index) ? 'bg-white' : 'bg-transparent'
                  }`}>
                    {selectedOptions.includes(index) && (
                      <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
              <div className="relative z-10">{option}</div>
            </div>
          ))}
        </div>

        {/* Submit Button for Multiple Choice */}
        {isMultipleChoice && !showResult && (
          <div className="mt-8 flex justify-end max-w-4xl w-full">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOptions.length === 0}
              className={`
                px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300
                ${selectedOptions.length > 0 
                  ? 'bg-white text-purple-900 hover:bg-gray-100 hover:scale-105' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantQuestionView;