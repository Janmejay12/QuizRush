
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CircularTimer from '@/components/quiz/CircularTimer';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  timeLimit: number;
  points: number;
}

const HostQuizView: React.FC = () => {
  const { quizId, roomCode } = useParams<{ quizId: string; roomCode: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canProceed, setCanProceed] = useState(false);

  // Mock questions data
  const questions: Question[] = [
    {
      id: '1',
      text: 'What is the capital of France?',
      options: [
        { id: 'a', text: 'London', isCorrect: false },
        { id: 'b', text: 'Berlin', isCorrect: false },
        { id: 'c', text: 'Paris', isCorrect: true },
        { id: 'd', text: 'Madrid', isCorrect: false }
      ],
      timeLimit: 30,
      points: 1000
    },
    {
      id: '2',
      text: 'Which planet is known as the Red Planet?',
      options: [
        { id: 'a', text: 'Venus', isCorrect: false },
        { id: 'b', text: 'Mars', isCorrect: true },
        { id: 'c', text: 'Jupiter', isCorrect: false },
        { id: 'd', text: 'Saturn', isCorrect: false }
      ],
      timeLimit: 25,
      points: 1000
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanProceed(true);
    }
  }, [timeLeft]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(questions[currentQuestionIndex + 1].timeLimit);
      setCanProceed(false);
    } else {
      // TODO: Navigate to final leaderboard
      // navigate(`/leaderboard/${quizId}/${roomCode}`);
    }
  };

  const handleEndQuiz = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
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
          <CircularTimer timeLeft={timeLeft} totalTime={currentQuestion.timeLimit} />
        </div>

        {/* Question */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full mb-8">
          <div className="text-center mb-6">
            <div className="text-white text-sm mb-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <h2 className="text-white text-2xl font-bold mb-4">{currentQuestion.text}</h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((option, index) => (
              <div
                key={option.id}
                className={`p-6 rounded-lg text-white text-lg font-semibold text-center ${
                  option.isCorrect 
                    ? 'bg-green-500 border-2 border-green-300' 
                    : 'bg-gray-600'
                }`}
              >
                {option.text}
                {option.isCorrect && (
                  <div className="text-sm mt-2 text-green-100">✓ Correct Answer</div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-white">
            <div className="text-sm">Points: {currentQuestion.points}</div>
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
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HostQuizView;
