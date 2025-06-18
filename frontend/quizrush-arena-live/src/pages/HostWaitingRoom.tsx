import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Copy, Users, Clock } from 'lucide-react';
import { quizSessionService } from '@/lib/quiz-session';
import { Quiz, Participant } from '@/lib/types';
import { quizService } from '@/lib/quiz';
import { websocketService } from '@/lib/Websocket';
import { toast } from 'sonner';

const HostWaitingRoom: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch quiz data and handle initial setup
  useEffect(() => {
    if (!quizId) return;

    const initializeQuiz = async () => {
      try {
        setIsLoading(true);
        
        // Fetch quiz data
        const fetchedQuiz = await quizService.getQuizById(parseInt(quizId));
        setQuiz(fetchedQuiz);
        setParticipants(fetchedQuiz.participants || []);
        
        const status = await quizSessionService.getQuizStatus(parseInt(quizId));
        
        if (status === 'STARTED') {
          // If already started, navigate to host view
          setQuizStarted(true);
          navigate(`/host-quiz/${quizId}`);
          return;
        } else if (status === 'CREATED') {
          // If in CREATED state, open it for participants
          await quizSessionService.openQuizForParticipants(parseInt(quizId));
          toast.success('Quiz is now open for participants to join.', {
            position: 'top-center'
          });
        }
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error initializing quiz:', error);
        toast.error(error.message || 'Failed to initialize quiz. Please try again.', {
          position: 'top-center'
        });
        setIsLoading(false);
      }
    };

    initializeQuiz();
  }, [quizId, navigate]);

  // WebSocket connection
  useEffect(() => {
    if (!quiz?.roomCode) return;

    let isSubscribed = true;

    const connectWebSocket = async () => {
      try {
        // Check if already connected
        if (!websocketService.isConnected()) {
          await websocketService.connect();
        }

        await websocketService.subscribeToQuiz(quiz.roomCode, {
          onParticipantJoined: (participant) => {
            if (!isSubscribed) return;
            setParticipants(prev => [...prev, participant]);
            toast.success(`${participant.nickname} has joined the quiz!`, {
              position: 'top-center'
            });
          },
          onParticipantLeft: (participant) => {
            if (!isSubscribed) return;
            setParticipants(prev => prev.filter(p => p.id !== participant.id));
            toast.info(`${participant.nickname} has left the quiz.`, {
              position: 'top-center'
            });
          },
          onQuizStarted: () => {
            if (!isSubscribed) return;
            // Store start time when quiz actually starts
            localStorage.setItem(`quiz_${quizId}_startTime`, new Date().toISOString());
            setQuizStarted(true);
            navigate(`/host-quiz/${quizId}`);
          }
        });

        console.log('Successfully subscribed to quiz room:', quiz.roomCode);
      } catch (error) {
        console.error('WebSocket connection error:', error);
        toast.error('Failed to connect to quiz room. Please refresh the page.', {
          position: 'top-center'
        });
      }
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      isSubscribed = false;
      // Do not unsubscribe from WebSocket when component unmounts
      // This allows us to maintain the connection during navigation
    };
  }, [quiz?.roomCode, quizId, navigate]);

  const handleCopyCode = () => {
    if (!quiz?.roomCode) return;
    
    navigator.clipboard.writeText(quiz.roomCode);
    toast.success('Room code copied! Share this code with participants to join the quiz.', {
      position: 'top-center'
    });
  };

  const handleStartQuiz = async () => {
    if (!quizId) return;
    
    try {
      // First check if we have participants
      if (participants.length === 0) {
        toast.error('Wait for participants to join before starting the quiz.', {
          position: 'top-center'
        });
        return;
      }

      // Check quiz status before starting
      const status = await quizSessionService.getQuizStatus(parseInt(quizId));
      if (status === 'CREATED') {
        // Try to open the quiz first
        await quizSessionService.openQuizForParticipants(parseInt(quizId));
      } else if (status !== 'WAITING') {
        toast.error(`Quiz must be in WAITING state to start. Current state: ${status}`, {
          position: 'top-center'
        });
        return;
      }

      // Store start time with quiz-specific key
      localStorage.setItem(`quiz_${quizId}_startTime`, new Date().toISOString());

      // Start the quiz
      await quizSessionService.startQuiz(parseInt(quizId));
      setQuizStarted(true);
      
      // Navigate to host quiz view
      navigate(`/host-quiz/${quizId}`);
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      
      // Handle specific error cases
      let errorMessage = "Failed to start the quiz. Please try again.";
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 
                      "Quiz cannot be started. Please ensure all participants are ready and the quiz is in the correct state.";
      }
      
      toast.error(errorMessage, {
        position: 'top-center'
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading quiz data...</div>;
  }

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

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-6 bg-black/20 backdrop-blur-sm">
        <div className="text-white text-2xl font-bold">QuizRush</div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full">
          {/* Join instructions */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-black/30 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-white font-bold">1</div>
                <div>
                  <p className="text-white text-sm">Join using</p>
                  <p className="text-white text-sm">any device</p>
                </div>
              </div>
              <div className="text-white text-xl font-semibold">joinmyquiz.com</div>
              <Button variant="ghost" className="mt-2 text-white/70 p-2">
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-black/30 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-white font-bold">2</div>
                <div>
                  <p className="text-white text-sm">Enter the</p>
                  <p className="text-white text-sm">join code</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-white text-3xl font-bold tracking-wider">{quiz?.roomCode || 'Loading...'}</div>
                <Button 
                  onClick={handleCopyCode}
                  variant="ghost" 
                  className="ml-4 text-white/70 p-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Auto start and Start button */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={handleStartQuiz}
              disabled={quizStarted || (participants.length === 0)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-lg"
            >
              {quizStarted ? 'Quiz Started' : 'START'}
            </Button>
          </div>

          {/* Participants status */}
          <div className="text-center">
            <div className="bg-black/50 rounded-full px-6 py-3 inline-flex items-center">
              <Users className="w-5 h-5 text-white mr-2" />
              <span className="text-white">
                {participants.length === 0 
                  ? 'Waiting for participants...' 
                  : `${participants.length} participant${participants.length === 1 ? '' : 's'}`
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostWaitingRoom;