
import React from 'react';
import { Check, Clock, BookOpen, Users } from 'lucide-react';
import { Question } from './QuestionEditor';
import { QuizFormValues } from './QuizDetailDialog';

interface QuizSidebarProps {
  quizDetails: QuizFormValues;
  questions: Question[];
  currentQuestionId?: string;
  onQuestionSelect: (questionId: string) => void;
  onAddNewQuestion: () => void;
}

const QuizSidebar: React.FC<QuizSidebarProps> = ({ 
  quizDetails, 
  questions, 
  currentQuestionId,
  onQuestionSelect,
  onAddNewQuestion
}) => {
  return (
    <div className="w-full max-w-xs bg-white rounded-lg shadow-md overflow-hidden">
      {/* Quiz details header */}
      <div className="p-4 bg-purple-800 text-white">
        <h2 className="text-lg font-bold mb-1">{quizDetails.title}</h2>
        <p className="text-sm text-white/80 line-clamp-2">{quizDetails.description}</p>
      </div>
      
      {/* Quiz metadata */}
      <div className="p-4 bg-purple-700 text-white flex items-center justify-between">
        <div className="flex items-center text-sm">
          <BookOpen className="w-4 h-4 mr-1" />
          <span>{quizDetails.subject}</span>
        </div>
        <div className="flex items-center text-sm">
          <Users className="w-4 h-4 mr-1" />
          <span>Max {quizDetails.maxParticipants}</span>
        </div>
      </div>
      
      {/* Questions list */}
      <div className="divide-y">
        <div className="p-3 bg-slate-100 font-medium text-sm">
          Questions ({questions.length})
        </div>
        
        {questions.map((question, index) => (
          <div 
            key={question.id}
            className={`p-3 flex items-center cursor-pointer hover:bg-purple-50 transition-colors ${currentQuestionId === question.id ? 'bg-purple-100' : ''}`}
            onClick={() => onQuestionSelect(question.id)}
          >
            <div className="bg-purple-800 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex-grow">
              <div className="font-medium line-clamp-1 text-sm">{question.text}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <div className="flex items-center mr-3">
                  <Check className="w-3 h-3 mr-1" />
                  <span>{question.multipleCorrectAnswers ? 'Multiple' : 'Single'}</span>
                </div>
                <div className="flex items-center mr-3">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{question.timeLimit}s</span>
                </div>
                <div>
                  <span>{question.points} {question.points === 1 ? 'point' : 'points'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add question button */}
        <div 
          className="p-3 text-purple-800 font-medium flex justify-center items-center cursor-pointer hover:bg-purple-50 transition-colors"
          onClick={onAddNewQuestion}
        >
          + Add Question
        </div>
      </div>
    </div>
  );
};

export default QuizSidebar;
