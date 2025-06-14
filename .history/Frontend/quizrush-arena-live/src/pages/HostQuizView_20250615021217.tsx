import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CircularTimer from '@/components/quiz/CircularTimer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizSessionService } from '@/lib/quiz-session';
import { websocketService } from '@/lib/Websocket';
import { useToast } from '@/components/ui/use-toast';
import { Question } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const HostQuizView: React.FC = () => {
  const { quizId, roomCode } = useParams<{ quizId: string; roomCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canProceed, setCanProceed] = useState(false);
  const [isQuizEnded, setIsQuizEnded] = useState(false);
  const [showEndQuizDialog, setShowEndQuizDialog] = useState(false);

  // Fetch current question
  const { data: currentQuestion, isLoading } = useQuery({
    queryKey: ['current-question', quizId],
    queryFn: () => quizSessionService.getCurrentQuestion(Number(quizId)),
    enabled: !!quizId && !isQuizEnded,
    refetchInterval: false
  });

  // Next question mutation
  const nextQuestionMutation = useMutation({
    mutationFn: () => quizSessionService.nextQuestion(Number(quizId)),
    onSuccess: (newQuestion) => {
      console.log('[Next Question] Successfully moved to next question:', {
        newQuestionId: newQuestion.id,
        newIndex: currentQuestionIndex + 1
      });
      queryClient.setQueryData(['current-question', quizId], newQuestion);
      setCurrentQuestionIndex(prev => prev + 1);
    },
    onError: (error) => {
      console.error('[Next Question] Failed to move to next question:', error);
      toast({
        title: "Error",
        description: "Failed to move to next question. Please try again.",
        variant: "destructive"
      });
    }
  });

  // End quiz mutation
  const endQuizMutation = useMutation({
    mutationFn: () => quizSessionService.endQuiz(Number(quizId)),
    onSuccess: () => {
      setIsQuizEnded(true);
      // Navigate to quiz summary
      navigate(`/host-summary/${quizId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to end the quiz. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Initialize timer when currentQuestion changes
  useEffect(() => {
    if (currentQuestion && !isQuizEnded) {
      console.log('[Timer Init] Setting new question timer:', {
        duration: currentQuestion.duration,
        questionId: currentQuestion.id,
        questionIndex: currentQuestionIndex
      });
      setTimeLeft(currentQuestion.duration);
      setCanProceed(false); // Reset canProceed when question changes
    }
  }, [currentQuestion?.id, isQuizEnded, currentQuestionIndex]);

  // Timer effect
  useEffect(() => {
    if (!currentQuestion || isQuizEnded || timeLeft === null || timeLeft < 0) {
      console.log('[Timer] Timer stopped:', {
        hasCurrentQuestion: !!currentQuestion,
        isQuizEnded,
        timeLeft
      });
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        console.log('[Timer] Time remaining:', timeLeft - 1);
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      console.log('[Timer] Time is up! Enabling next button');
      setCanProceed(true);
    }
  }, [timeLeft, currentQuestion, isQuizEnded]);

  // WebSocket connection
  useEffect(() => {
    if (!roomCode || !quizId) return;

    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
        await websocketService.subscribeToQuiz(roomCode, {
          onQuizEnded: () => {
            setIsQuizEnded(true);
            navigate(`/host-summary/${quizId}`);
          }
        });
      } catch (error) {
        console.error('WebSocket connection error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to quiz room. Some features may be limited.",
          variant: "destructive"
        });
      }
    };

    connectWebSocket();

    return () => {
      if (roomCode) {
        websocketService.unsubscribeFromQuiz(roomCode);
      }
    };
  }, [roomCode, quizId, navigate, queryClient, toast]);

  const handleNextQuestion = async () => {
    console.log('[Next Question] Attempting to proceed:', {
      canProceed,
      currentQuestionIndex,
      timeLeft
    });
    
    if (!canProceed) {
      console.log('[Next Question] Cannot proceed - button should be disabled');
      return;
    }
    
    console.log('[Next Question] Moving to next question');
    nextQuestionMutation.mutate();
  };

  const handleEndQuiz = async () => {
    setShowEndQuizDialog(true);
  };

  const confirmEndQuiz = () => {
    setShowEndQuizDialog(false);
    endQuizMutation.mutate();
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* End Quiz Dialog */}
      <Dialog open={showEndQuizDialog} onOpenChange={setShowEndQuizDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>End Quiz?</DialogTitle>
            <DialogDescription>
              Are you sure you want to end the quiz? This will end the quiz for all participants.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEndQuizDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmEndQuiz}
            >
              End Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 bg-black/20 backdrop-blur-sm">
        <div className="text-white text-2xl font-bold">QuizRush</div>
        <Button 
          onClick={handleEndQuiz}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
        >
          End Quiz
        </Button>
      </nav>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* Timer */}
        <div className="mb-8">
          <CircularTimer timeLeft={timeLeft} totalTime={currentQuestion.duration} />
        </div>

        {/* Question */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full mb-8">
          <div className="text-center mb-6">
            <div className="text-white text-sm mb-2">
              Question {currentQuestionIndex + 1}
            </div>
            <h2 className="text-white text-2xl font-bold mb-4">{currentQuestion.text}</h2>
            <div className="text-white/70 text-sm">
              {currentQuestion.points} points
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg text-white text-lg font-semibold text-center min-h-[120px] flex flex-col justify-center ${
                  currentQuestion.correctOptionIndices.includes(index)
                    ? 'bg-green-500 border-2 border-green-300' 
                    : 'bg-gray-600'
                }`}
              >
                <div>{option}</div>
                {currentQuestion.correctOptionIndices.includes(index) && (
                  <div className="text-sm mt-2 text-green-100">✓ Correct Answer</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Next button */}
        <div className="flex justify-end w-full max-w-4xl">
          <Button
            onClick={handleNextQuestion}
            disabled={!canProceed}
            className={`px-8 py-3 text-lg ${
              canProceed 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-gray-500 cursor-not-allowed'
            }`}
          >
            Next Question
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HostQuizView;