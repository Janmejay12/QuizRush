
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Target } from 'lucide-react';

interface QuestionSummary {
  id: string;
  text: string;
  isCorrect: boolean;
  isPartiallyCorrect?: boolean;
}

const ParticipantQuizSummary: React.FC = () => {
  const { quizId, participantId } = useParams<{ quizId: string; participantId: string }>();
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);

  // Mock participant performance data
  const performanceData = {
    correct: 2,
    partiallyCorrect: 0,
    incorrect: 1,
    avgTimePerQuestion: 11,
    overallAccuracy: 67,
    questions: [
      { id: '1', text: 'my college?', isCorrect: true },
      { id: '2', text: 'where do i live?', isCorrect: false },
      { id: '3', text: 'My name?', isCorrect: true }
    ] as QuestionSummary[]
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSummary(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-pink-500/20 rounded-full animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-400/20 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-indigo-400/20 rounded-full animate-pulse-soft"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 min-h-screen">
        <div className={`
          bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full transform transition-all duration-700 ease-out
          ${showSummary ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
        `}>
          {/* Performance Stats Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-3xl font-bold mb-4">Performance Stats</h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-600/80 rounded-lg p-4 text-center transform hover:scale-105 transition-transform">
              <div className="text-white text-2xl font-bold">{performanceData.correct}</div>
              <div className="text-green-100 text-sm">Correct</div>
            </div>
            
            <div className="bg-yellow-600/80 rounded-lg p-4 text-center transform hover:scale-105 transition-transform">
              <div className="text-white text-2xl font-bold">{performanceData.partiallyCorrect}</div>
              <div className="text-yellow-100 text-sm">Partially correct</div>
            </div>
            
            <div className="bg-red-600/80 rounded-lg p-4 text-center transform hover:scale-105 transition-transform">
              <div className="text-white text-2xl font-bold">{performanceData.incorrect}</div>
              <div className="text-red-100 text-sm">Incorrect</div>
            </div>
            
            <div className="bg-blue-600/80 rounded-lg p-4 text-center transform hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 text-white mx-auto mb-1" />
              <div className="text-white text-lg font-bold">{performanceData.avgTimePerQuestion} s</div>
              <div className="text-blue-100 text-xs">Time/ques</div>
            </div>
            
            <div className="bg-purple-600/80 rounded-lg p-4 text-center transform hover:scale-105 transition-transform">
              <Target className="w-6 h-6 text-white mx-auto mb-1" />
              <div className="text-white text-lg font-bold">1</div>
              <div className="text-purple-100 text-xs">Streak</div>
            </div>
            
            <div className="bg-indigo-600/80 rounded-lg p-4 text-center transform hover:scale-105 transition-transform">
              <div className="text-white text-lg font-bold">{performanceData.overallAccuracy}%</div>
              <div className="text-indigo-100 text-xs">Accuracy</div>
            </div>
          </div>

          {/* Review Questions Section */}
          <div className="bg-black/30 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-semibold">Review Questions</h2>
              <p className="text-white/70 text-sm">Click on the questions to see answers</p>
            </div>
            
            <div className="space-y-3">
              {performanceData.questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`
                    bg-black/50 rounded-lg p-4 border-l-4 transition-all duration-300 hover:bg-black/60
                    ${question.isCorrect ? 'border-green-500' : 'border-red-500'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{question.text}</p>
                    </div>
                    {question.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="text-center">
            <Button
              onClick={handleBackToHome}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transform hover:scale-105 transition-all"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Celebration confetti */}
      {showSummary && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantQuizSummary;
