
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import QuizSidebar from '@/components/quiz/QuizSidebar';
import { Question } from '@/components/quiz/QuestionEditor';
import { QuizFormValues } from '@/components/quiz/QuizDetailDialog';
import QuizDetailDialog from '@/components/quiz/QuizDetailDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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

const QuizEdit: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleteQuestion, setIsDeleteQuestion] = useState(false);
  
  // Load quiz data from localStorage
  useEffect(() => {
    if (!quizId) return;

    const storedQuiz = localStorage.getItem(`quiz_${quizId}`);
    if (storedQuiz) {
      setQuizData(JSON.parse(storedQuiz));
    } else {
      toast({
        title: "Quiz not found",
        description: "The quiz you're trying to edit doesn't exist.",
        variant: "destructive"
      });
      navigate('/admin');
    }
  }, [quizId, navigate, toast]);

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestionId(questionId);
  };

  const handleEditQuestion = () => {
    if (selectedQuestionId) {
      navigate(`/admin/quiz/${quizId}/question/${selectedQuestionId}`);
    } else {
      toast({
        title: "No question selected",
        description: "Please select a question to edit.",
      });
    }
  };

  const handleAddQuestion = () => {
    navigate(`/admin/quiz/${quizId}/question/new`);
  };

  const handleDeleteQuestion = () => {
    if (selectedQuestionId && quizData) {
      const updatedQuiz = {
        ...quizData,
        questions: quizData.questions.filter(q => q.id !== selectedQuestionId)
      };
      
      localStorage.setItem(`quiz_${quizId}`, JSON.stringify(updatedQuiz));
      setQuizData(updatedQuiz);
      setSelectedQuestionId(null);
      setDeleteDialogOpen(false);
      
      toast({
        title: "Question deleted",
        description: "The question has been removed from your quiz."
      });
    }
  };

  const handleConfirmDelete = (isQuestion: boolean) => {
    setIsDeleteQuestion(isQuestion);
    setDeleteDialogOpen(true);
  };

  const handleDeleteQuiz = () => {
    if (quizId) {
      localStorage.removeItem(`quiz_${quizId}`);
      
      // Update the quizzes list in Admin
      const adminQuizzes = localStorage.getItem('admin_quizzes') || '[]';
      const quizzes = JSON.parse(adminQuizzes).filter((q: { id: string }) => q.id !== quizId);
      localStorage.setItem('admin_quizzes', JSON.stringify(quizzes));
      
      toast({
        title: "Quiz deleted",
        description: "Your quiz has been permanently deleted."
      });
      
      navigate('/admin');
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateQuizDetails = (formData: QuizFormValues) => {
    if (!quizData) return;
    
    const updatedQuiz = {
      ...quizData,
      ...formData
    };
    
    localStorage.setItem(`quiz_${quizId}`, JSON.stringify(updatedQuiz));
    setQuizData(updatedQuiz);
    setEditDialogOpen(false);
    
    toast({
      title: "Quiz updated",
      description: "Your quiz details have been updated."
    });
  };

  const handleSaveQuiz = () => {
    if (!quizData) return;
    
    // Validate that quiz has at least one question
    if (quizData.questions.length === 0) {
      toast({
        title: "Cannot save quiz",
        description: "A quiz must have at least one question.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we would send this to an API endpoint
    // For now, let's update our local admin quizzes list
    const adminQuizzes = localStorage.getItem('admin_quizzes') || '[]';
    const quizzes = JSON.parse(adminQuizzes);
    
    // Check if quiz already exists in list, if so update it
    const quizIndex = quizzes.findIndex((q: { id: string }) => q.id === quizId);
    
    if (quizIndex >= 0) {
      quizzes[quizIndex] = {
        id: quizData.id,
        title: quizData.title,
        questionsCount: quizData.questions.length,
        createdAt: quizData.createdAt
      };
    } else {
      quizzes.push({
        id: quizData.id,
        title: quizData.title,
        questionsCount: quizData.questions.length,
        createdAt: quizData.createdAt
      });
    }
    
    localStorage.setItem('admin_quizzes', JSON.stringify(quizzes));
    
    toast({
      title: "Quiz saved",
      description: "Your quiz has been saved and is ready to use."
    });
    
    // Navigate to the quiz view page
    navigate(`/admin/quiz/${quizId}`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container pt-24 pb-12 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar */}
          <div className="md:w-1/4">
            <QuizSidebar
              quizDetails={{
                title: quizData.title,
                description: quizData.description,
                subject: quizData.subject,
                grade: quizData.grade,
                maxParticipants: quizData.maxParticipants
              }}
              questions={quizData.questions}
              currentQuestionId={selectedQuestionId || undefined}
              onQuestionSelect={handleQuestionSelect}
              onAddNewQuestion={handleAddQuestion}
            />
            
            <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
              <Button 
                onClick={() => setEditDialogOpen(true)}
                variant="outline" 
                className="w-full mb-2 text-purple-800 border-purple-800"
              >
                Edit Quiz Details
              </Button>
              <Button 
                onClick={() => handleConfirmDelete(false)}
                variant="outline" 
                className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                Delete Quiz
              </Button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="md:w-3/4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-purple-900">Edit Quiz: {quizData.title}</h1>
                <Button 
                  onClick={handleSaveQuiz}
                  className="bg-purple-800 hover:bg-purple-900"
                >
                  Save Quiz
                </Button>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Questions</h2>
                {quizData.questions.length > 0 ? (
                  <div className="space-y-4">
                    {quizData.questions.map((question, index) => (
                      <div 
                        key={question.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors ${selectedQuestionId === question.id ? 'bg-purple-100 border-purple-300' : ''}`}
                        onClick={() => setSelectedQuestionId(question.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-purple-800 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">
                              {index + 1}
                            </div>
                            <div className="font-medium">{question.text}</div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {question.points} {question.points === 1 ? 'point' : 'points'} • {question.timeLimit}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">This quiz doesn't have any questions yet.</p>
                    <Button 
                      onClick={handleAddQuestion}
                      className="bg-purple-800 hover:bg-purple-900"
                    >
                      Add Your First Question
                    </Button>
                  </div>
                )}
              </div>
              
              {selectedQuestionId && (
                <div className="flex space-x-3">
                  <Button onClick={handleEditQuestion} className="bg-purple-800 hover:bg-purple-900">
                    Edit Question
                  </Button>
                  <Button 
                    onClick={() => handleConfirmDelete(true)} 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Delete Question
                  </Button>
                </div>
              )}
              
              {!selectedQuestionId && quizData.questions.length > 0 && (
                <Button 
                  onClick={handleAddQuestion}
                  className="bg-purple-800 hover:bg-purple-900"
                >
                  Add New Question
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Quiz Details Dialog */}
      <QuizDetailDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        onSubmit={handleUpdateQuizDetails}
        defaultValues={{
          title: quizData.title,
          description: quizData.description,
          subject: quizData.subject,
          grade: quizData.grade,
          maxParticipants: quizData.maxParticipants
        }}
      />
      
      {/* Confirm Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isDeleteQuestion ? 'Delete Question' : 'Delete Quiz'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isDeleteQuestion 
                ? 'Are you sure you want to delete this question? This action cannot be undone.'
                : 'Are you sure you want to delete this entire quiz and all its questions? This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={isDeleteQuestion ? handleDeleteQuestion : handleDeleteQuiz}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizEdit;
