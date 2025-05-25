
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import QuestionEditor, { Question } from '@/components/quiz/QuestionEditor';

interface QuizData {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  maxParticipants: number;
  questions: Question[];
}

const QuestionPage: React.FC = () => {
  const { quizId, questionId } = useParams<{ quizId: string; questionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>(undefined);

  // Load quiz data from localStorage
  useEffect(() => {
    if (!quizId) return;

    const storedQuiz = localStorage.getItem(`quiz_${quizId}`);
    if (storedQuiz) {
      const parsedQuiz = JSON.parse(storedQuiz) as QuizData;
      setQuizData(parsedQuiz);
      
      // If we're editing an existing question, find it
      if (questionId && questionId !== 'new') {
        const question = parsedQuiz.questions.find(q => q.id === questionId);
        if (question) {
          setCurrentQuestion(question);
        }
      }
    } 
    else {
      toast({
        title: "Quiz not found",
        description: "The quiz you're trying to edit doesn't exist.",
        variant: "destructive"
      });
      navigate('/admin');
    }
  }, [quizId, questionId, navigate, toast]);

  const handleSaveQuestion = (question: Question) => {
    if (!quizData) return;
    
    let updatedQuestions: Question[];
    
    // Check if we're editing an existing question or adding a new one
    if (questionId && questionId !== 'new') {
      // Update existing question
      updatedQuestions = quizData.questions.map(q => 
        q.id === questionId ? question : q
      );
    } else { 
      // Add new question
      updatedQuestions = [...quizData.questions, question];
    }
    
    // Update the quiz in localStorage
    const updatedQuiz = {
      ...quizData,
      questions: updatedQuestions
    };
    
    localStorage.setItem(`quiz_${quizId}`, JSON.stringify(updatedQuiz));
    
    toast({
      title: "Question saved",
      description: questionId !== 'new' ? "Your question has been updated." : "Your question has been added to the quiz."
    });
    
    // Go back to the quiz edit page
    navigate(`/admin/quiz/${quizId}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container pt-20 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-purple-900">
            {questionId === 'new' ? 'Add New Question' : 'Edit Question'}
          </h1>
          {quizData && (
            <p className="text-gray-600">Quiz: {quizData.title}</p>
          )}
        </div>
        
        <QuestionEditor 
          onSave={handleSaveQuestion}
          defaultQuestion={currentQuestion}
        />
      </div>
    </div>
  );
};

export default QuestionPage;
