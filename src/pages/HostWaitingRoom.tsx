
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Copy, Users, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const HostWaitingRoom: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roomCode] = useState('331790'); // Mock room code
  const [participants, setParticipants] = useState<string[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);

  // Mock participants joining
  useEffect(() => {
    const timer = setTimeout(() => {
      setParticipants(['Player1']);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Room code copied!",
      description: "Share this code with participants to join the quiz.",
    });
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    // TODO: Navigate to host question view when backend is connected
    // navigate(`/host-quiz/${quizId}/${roomCode}`);
    toast({
      title: "Quiz Started!",
      description: "The quiz has begun for all participants.",
    });
  };

  const handleEndQuiz = () => {
    navigate('/admin');
  };

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
        <Button 
          onClick={handleEndQuiz}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
        >
          End
        </Button>
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
                <div className="text-white text-3xl font-bold tracking-wider">{roomCode}</div>
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

          {/* QR Code section */}
          <div className="text-right mb-8">
            <div className="inline-block">
              <div className="bg-white w-32 h-32 rounded-lg mb-2 flex items-center justify-center">
                <div className="text-xs text-gray-500">QR Code</div>
              </div>
              <p className="text-white text-sm">Share Via</p>
            </div>
          </div>

          {/* Auto start and Start button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center bg-black/30 rounded-lg px-4 py-3">
              <Clock className="w-5 h-5 text-white mr-2" />
              <span className="text-white">Auto start your quiz</span>
              <div className="ml-4 bg-white/20 rounded p-2">
                <div className="w-0 h-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
              </div>
            </div>

            <Button 
              onClick={handleStartQuiz}
              disabled={quizStarted}
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
