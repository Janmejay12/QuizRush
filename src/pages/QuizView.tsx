
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Check, Clock, Info } from 'lucide-react';
import { Question } from '@/components/quiz/QuestionEditor';

interface QuizData {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  maxParticipants: number;
  createdAt: string;
  questions: Question[];
}

const QuizView: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  
  // Load quiz data from localStorage
  useEffect(() => {
    if (!quizId) return;

    const storedQuiz = localStorage.getItem(`quiz_${quizId}`);
    if (storedQuiz) {
      setQuizData(JSON.parse(storedQuiz));
    } else {
      toast({
        title: "Quiz not found",
        description: "The quiz you're looking for doesn't exist.",
        variant: "destructive"
      });
      navigate('/admin');
    }
  }, [quizId, navigate, toast]);

  const handleStartQuiz = () => {
    // Generate a random 6-character room code
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(newRoomCode);
    
    // In a real app, we would create a session on the backend
    toast({
      title: "Quiz started!",
      description: `Room code: ${newRoomCode}. Share this code with participants.`,
    });
    
    // In a real app, we would navigate to a host view
    // navigate(`/host/${quizId}/${newRoomCode}`);
  };

  const handleEditQuiz = () => {
    navigate(`/admin/quiz/${quizId}/edit`);
  };

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container pt-24 pb-12 px-4">
          <p className="text-center">Loading quiz data...</p>
        </div>
      </div>
    );
  }

  const totalPoints = quizData.questions.reduce((sum, q) => sum + q.points, 0);
  const totalTime = quizData.questions.reduce((sum, q) => sum + q.timeLimit, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container pt-24 pb-12 px-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">{quizData.title}</h1>
            <p className="text-gray-600 mt-1">{quizData.description}</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => navigate('/admin')} variant="outline">
              Back to Dashboard
            </Button>
            <Button onClick={handleEditQuiz} variant="outline" className="text-purple-800 border-purple-800">
              Edit Quiz
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="font-bold text-lg text-purple-800 mb-2">Quiz Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{quizData.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grade:</span>
                <span className="font-medium">{quizData.grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium">{quizData.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Points:</span>
                <span className="font-medium">{totalPoints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Time:</span>
                <span className="font-medium">{Math.floor(totalTime / 60)}m {totalTime % 60}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Participants:</span>
                <span className="font-medium">{quizData.maxParticipants}</span>
              </div>
            </div>
          </div>
          
          {/* Room code display - only shown after starting quiz */}
          {roomCode && (
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="font-bold text-lg text-purple-800 mb-2">Room Code</h3>
              <div className="mt-2 text-center">
                <div className="text-3xl font-bold tracking-wider bg-purple-50 p-4 rounded-lg border-2 border-dashed border-purple-300">
                  {roomCode}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Share this code with participants to join the quiz
                </p>
              </div>
            </div>
          )}
          
          {/* Quiz start button card */}
          <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center justify-center">
            <h3 className="font-bold text-lg text-purple-800 mb-2">Start Quiz Session</h3>
            <p className="text-gray-500 text-center mb-4">
              Ready to begin? Click below to generate a room code and start the quiz.
            </p>
            <Button 
              onClick={handleStartQuiz} 
              className="bg-purple-800 hover:bg-purple-900 px-8 py-6 text-lg w-full"
              disabled={!!roomCode}
            >
              {roomCode ? 'Quiz Started' : 'Start Quiz'}
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-purple-900">Questions ({quizData.questions.length})</h2>
          
          {quizData.questions.length > 0 ? (
            <div className="space-y-4">
              {quizData.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="bg-purple-800 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <h3 className="font-medium">{question.text}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-1" />
                        <span>{question.multipleCorrectAnswers ? 'Multiple answers' : 'Single answer'}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{question.timeLimit}s</span>
                      </div>
                      <div>{question.points} {question.points === 1 ? 'point' : 'points'}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={option.id}
                        className={`p-2 rounded-md flex items-center ${option.isCorrect ? 'bg-green-100 border border-green-300' : 'bg-gray-100'}`}
                      >
                        <div className={`w-4 h-4 rounded-full mr-2 ${option.isCorrect ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>{option.text}</span>
                        {option.isCorrect && (
                          <div className="ml-auto text-xs text-green-600 font-medium">
                            Correct
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">This quiz doesn't have any questions yet.</p>
              <Button 
                onClick={handleEditQuiz} 
                className="mt-4 bg-purple-800 hover:bg-purple-900"
              >
                Add Questions
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;
