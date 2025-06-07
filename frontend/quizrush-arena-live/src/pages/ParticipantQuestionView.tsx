
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CircularTimer from '@/components/quiz/CircularTimer';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  timeLimit: number;
}

const ParticipantQuestionView: React.FC = () => {
  const { quizId, participantId } = useParams<{ quizId: string; participantId: string }>();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Mock question data
  const questions: Question[] = [
    {
      id: '1',
      text: 'my college?',
      options: [
        { id: 'a', text: 'nirma', isCorrect: false },
        { id: 'b', text: 'bits', isCorrect: true },
        { id: 'c', text: 'iit', isCorrect: false },
        { id: 'd', text: 'ddu', isCorrect: false }
      ],
      timeLimit: 30
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setShowResult(true);
    }
  }, [timeLeft, showResult]);

  const handleOptionSelect = (optionId: string, event: React.MouseEvent) => {
    if (!showResult) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setConfettiPosition({ 
        x: rect.left + rect.width / 2, 
        y: rect.top + rect.height / 2 
      });
      
      setSelectedOptions([optionId]);
      // Show result after selection
      setTimeout(() => {
        setShowResult(true);
        // Check if answer is correct and show confetti
        const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
        if (selectedOption?.isCorrect) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }, 500);
    }
  };

  const getOptionColor = (option: { id: string; text: string; isCorrect: boolean }) => {
    if (!showResult) {
      if (selectedOptions.includes(option.id)) {
        return 'bg-purple-600 transform scale-105';
      }
      return 'bg-blue-500 hover:bg-blue-600';
    }

    // Show results
    if (option.isCorrect) {
      return 'bg-green-500';
    } else if (selectedOptions.includes(option.id)) {
      return 'bg-red-500';
    }
    return 'bg-gray-500 opacity-50';
  };

  const optionColors = ['bg-blue-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Top bar */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-500 px-3 py-1 rounded text-black font-bold text-sm">1st</div>
          <div className="bg-gray-600 px-3 py-1 rounded text-white text-sm">Bonus</div>
        </div>
        <div className="text-white text-lg">0</div>
        <div className="text-white text-lg">331 790</div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* Timer */}
        <div className="mb-8">
          <CircularTimer timeLeft={timeLeft} totalTime={currentQuestion.timeLimit} />
        </div>

        {/* Question counter */}
        <div className="text-white text-lg mb-6">
          {currentQuestionIndex + 1}/{questions.length}
        </div>

        {/* Question */}
        <div className="bg-black/60 backdrop-blur-md rounded-xl p-6 mb-8 max-w-2xl w-full text-center">
          <h2 className="text-white text-2xl font-bold">{currentQuestion.text}</h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-6 max-w-4xl w-full">
          {currentQuestion.options.map((option, index) => (
            <div
              key={option.id}
              onClick={(e) => handleOptionSelect(option.id, e)}
              className={`
                relative p-8 rounded-xl text-white text-xl font-semibold text-center cursor-pointer
                transition-all duration-300 ease-in-out
                ${!showResult ? optionColors[index] : ''}
                ${showResult ? getOptionColor(option) : 'hover:scale-105'}
                ${selectedOptions.includes(option.id) && !showResult ? 'animate-pulse' : ''}
              `}
            >
              <div className="relative z-10">{option.text}</div>
              
              {/* Result indicator */}
              {showResult && selectedOptions.includes(option.id) && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className={`text-lg font-bold ${option.isCorrect ? 'text-green-100' : 'text-red-100'}`}>
                    {option.isCorrect ? '+750' : '0'}
                  </div>
                  <div className="text-sm">Player {participantId}</div>
                  {option.isCorrect && (
                    <div className="text-sm text-green-100 mt-1">✓ Correct</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-8 flex items-center space-x-4">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🎄</span>
          </div>
          <div className="text-white text-lg">Player {participantId}</div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
            <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
            <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Confetti for correct answers - positioned at the selected option */}
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
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3"
              style={{
                left: `${50 + (Math.random() - 0.5) * 100}%`,
                top: `${50 + (Math.random() - 0.5) * 100}%`,
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'][Math.floor(Math.random() * 6)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                animation: `confetti-burst 2s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantQuestionView;
