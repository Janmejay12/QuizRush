import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Target, Calendar, CheckCircle } from 'lucide-react';
import { quizService } from '@/lib/quiz';
import { Quiz, Question } from '@/lib/types';
import { quizSessionService } from '@/lib/quiz-session';
import { toast } from 'sonner';

interface QuizSummaryData {
  title: string;
  accuracy: number;
  totalStudents: number;
  participants: number;
  startTime: string;
  endTime: string;
  status: string;
  questions: number;
}

const HostQuizSummary: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<QuizSummaryData>({
    title: '',
    accuracy: 0,
    totalStudents: 0,
    participants: 0,
    startTime: '',
    endTime: new Date().toLocaleString(), // Current time as end time
    status: 'Completed',
    questions: 0
  });

  useEffect(() => {
    const loadQuizData = async () => {
      if (!quizId) return;

      try {
        // Get quiz details
        const quiz = await quizService.getQuizById(parseInt(quizId));
        
        // Get questions
        const questions = await quizService.getQuizQuestions(parseInt(quizId));
        
        // Get start time from localStorage using quiz-specific key
        const startTime = localStorage.getItem(`quiz_${quizId}_startTime`);
        
        // Calculate average accuracy from participants
        const totalParticipants = quiz.participants?.length || 0;
        const averageAccuracy = quiz.participants?.reduce((acc, p) => acc + p.score, 0) || 0;
        const accuracy = totalParticipants > 0 ? Math.round((averageAccuracy / totalParticipants)) : 0;

        setSummaryData({
          title: quiz.title,
          accuracy,
          totalStudents: totalParticipants,
          participants: totalParticipants,
          startTime: startTime ? new Date(startTime).toLocaleString() : 'N/A',
          endTime: new Date().toLocaleString(),
          status: 'Completed',
          questions: questions.length
        });
      } catch (error) {
        console.error('Error loading quiz data:', error);
      }
    };

    loadQuizData();
    const timer = setTimeout(() => setShowSummary(true), 500);
    return () => clearTimeout(timer);
  }, [quizId]);

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  const handleResetQuiz = async () => {
    if (!quizId) return;
    
    try {
      await quizSessionService.resetQuiz(parseInt(quizId));
      toast.success('Quiz has been reset successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error resetting quiz:', error);
      toast.error('Failed to reset quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-6">
      <div className="max-w-2xl mx-auto">
        <div className={`
          bg-white rounded-2xl shadow-lg p-5 transform transition-all duration-700 ease-out
          ${showSummary ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{summaryData.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">{summaryData.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 text-sm">
                    Started: {summaryData.startTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Stats - Vertical layout with balanced spacing */}
          <div className="flex flex-col space-y-3 mb-5">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900 mb-1">88%</div>
              <div className="text-blue-700 text-sm font-medium">Average Accuracy</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900 mb-1">{summaryData.participants}</div>
              <div className="text-green-700 text-sm font-medium">Total Participants</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900 mb-1">{summaryData.questions}</div>
              <div className="text-purple-700 text-sm font-medium">Total Questions</div>
            </div>
          </div>

          {/* Additional Stats - Below main stats */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Quiz Details</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-gray-900">
                  {Math.round((summaryData.participants / summaryData.totalStudents) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Quiz Duration</span>
                <span className="font-semibold text-gray-900">2 minutes</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Questions</span>
                <span className="font-semibold text-gray-900">{summaryData.questions}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Average Score</span>
                <span className="font-semibold text-gray-900">2.25/3</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleBackToAdmin}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 text-base font-semibold rounded-lg transform hover:scale-105 transition-all"
            >
              Back to Admin
            </Button>
            <Button
              onClick={handleResetQuiz}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 text-base font-semibold rounded-lg transform hover:scale-105 transition-all"
            >
              Reset Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostQuizSummary;
