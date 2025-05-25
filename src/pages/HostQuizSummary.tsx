
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Target, Calendar, CheckCircle } from 'lucide-react';

const HostQuizSummary: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);

  // Mock quiz summary data
  const quizSummaryData = {
    title: 'General Knowledge Quiz',
    accuracy: 75,
    totalStudents: 12,
    participants: 8,
    startTime: 'May 24, 2025, 05:06 AM',
    endTime: 'May 24, 2025, 05:08 AM',
    status: 'Completed'
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSummary(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <div className={`
          bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-700 ease-out
          ${showSummary ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{quizSummaryData.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">{quizSummaryData.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 text-sm">
                    Started: {quizSummaryData.startTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center transform hover:scale-105 transition-transform">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900 mb-1">{quizSummaryData.accuracy}%</div>
              <div className="text-blue-700 text-sm font-medium">Average Accuracy</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center transform hover:scale-105 transition-transform">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900 mb-1">{quizSummaryData.participants}</div>
              <div className="text-green-700 text-sm font-medium">Total Participants</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center transform hover:scale-105 transition-transform">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900 mb-1">{quizSummaryData.totalStudents}</div>
              <div className="text-purple-700 text-sm font-medium">Total Students</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quiz Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Completion Rate:</span>
                <span className="font-semibold text-gray-900">
                  {Math.round((quizSummaryData.participants / quizSummaryData.totalStudents) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Quiz Duration:</span>
                <span className="font-semibold text-gray-900">2 minutes</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Questions:</span>
                <span className="font-semibold text-gray-900">3</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Average Score:</span>
                <span className="font-semibold text-gray-900">2.25/3</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button
              onClick={handleBackToAdmin}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 text-lg font-semibold rounded-lg transform hover:scale-105 transition-all"
            >
              Back to Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostQuizSummary;
