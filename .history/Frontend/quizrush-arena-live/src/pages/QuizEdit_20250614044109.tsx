import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import QuizSidebar from '@/components/quiz/QuizSidebar';
import { Question } from '@/lib/types';
import { QuizFormValues } from '@/components/quiz/QuizDetailDialog';
import QuizDetailDialog from '@/components/quiz/QuizDetailDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { quizService } from '@/lib/quiz';
import { questionService } from '@/lib/question';
import { Quiz } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const QuizEdit: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleteQuestion, setIsDeleteQuestion] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch quiz data
  const { data: quizData, isLoading, error } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizService.getQuizById(Number(quizId)),
    enabled: !!quizId,
    staleTime: 60000 // 1 minute
  });

  // Update quiz mutation
  const updateQuizMutation = useMutation({
    mutationFn: (updatedQuiz: Quiz) => quizService.updateQuiz(Number(quizId), updatedQuiz),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      toast({
        title: "Quiz updated",
        description: "Your quiz has been successfully updated.",
        duration: 3000
      });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating quiz:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your quiz. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    }
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: () => quizService.deleteQuiz(Number(quizId)),
    onSuccess: () => {
      toast({
        title: "Quiz deleted",
        description: "Your quiz has been permanently deleted.",
        duration: 3000
      });
      navigate('/admin');
    },
    onError: (error) => {
      console.error('Error deleting quiz:', error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting your quiz. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: number) => questionService.deleteQuestion(questionId, Number(quizId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      toast({
        title: "Question deleted",
        description: "The question has been removed from your quiz."
      });
      setSelectedQuestionId(null);
    },
    onError: (error) => {
      console.error('Error deleting question:', error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting the question. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle error state
  useEffect(() => {
    if (error) {
      toast({
        title: "Quiz not found",
        description: "The quiz you're trying to edit doesn't exist.",
        variant: "destructive"
      });
      navigate('/admin');
    }
  }, [error, navigate, toast]);

  const handleQuestionSelect = (questionId: number) => {
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
    if (selectedQuestionId) {
      deleteQuestionMutation.mutate(selectedQuestionId);
      setDeleteDialogOpen(false);
    }
  };

  const handleConfirmDelete = (isQuestion: boolean) => {
    setIsDeleteQuestion(isQuestion);
    setDeleteDialogOpen(true);
  };

  const handleDeleteQuiz = () => {
    if (quizId) {
      deleteQuizMutation.mutate();
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateQuizDetails = (formData: QuizFormValues) => {
    if (!quizData) return;
    
    const updatedQuiz: Quiz = {
      ...quizData,
      ...formData
    };
    
    updateQuizMutation.mutate(updatedQuiz);
  };

  // Handle saving the entire quiz
  const handleSaveQuiz = () => {
    if (!quizData) return;
    
    updateQuizMutation.mutate(quizData, {
      onSuccess: () => {
        toast({
          title: "Quiz saved",
          description: "Your quiz has been saved successfully."
        });
        navigate(`/admin/quiz/${quizId}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container pt-24 pb-12">
          <p className="text-center">Loading quiz data...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container pt-24 pb-12">
          <p className="text-center">Quiz not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container pt-24 pb-12 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-900">{quizData.title}</h1>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setEditDialogOpen(true)} 
              variant="outline" 
              className="border-purple-800 text-purple-800 hover:bg-purple-50"
              disabled={updateQuizMutation.isPending}
            >
              Edit Details
            </Button>
            <Button 
              onClick={handleSaveQuiz} 
              className="bg-purple-800 hover:bg-purple-900"
              disabled={updateQuizMutation.isPending}
            >
              {updateQuizMutation.isPending ? 'Saving..' : 'Save Quiz'}
            </Button>
            <Button 
              onClick={() => handleConfirmDelete(false)} 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              disabled={deleteQuizMutation.isPending}
            >
              Delete Quiz
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <QuizSidebar 
            quiz={quizData} 
            onBack={() => navigate(`/admin/quiz/${quizId}`)}
            currentQuestionId={selectedQuestionId || undefined}
            onQuestionSelect={handleQuestionSelect}
            onAddNewQuestion={handleAddQuestion}
          />
          
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-purple-900">Questions</h2>
                <Button 
                  onClick={handleAddQuestion}
                  className="bg-purple-800 hover:bg-purple-900"
                >
                  Add Question
                </Button>
              </div>
              
              <div className="mb-6">
                {quizData.questions && quizData.questions.length > 0 ? (
                  <div className="space-y-2">
                    {quizData.questions.map((question, index) => (
                      <div 
                        key={question.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedQuestionId === question.id ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleQuestionSelect(question.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-purple-800 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">
                              {index + 1}
                            </div>
                            <div className="font-medium">{question.text}</div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {question.points} {question.points === 1 ? 'point' : 'points'} • {question.duration}s
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
                  <Button 
                    onClick={handleEditQuestion} 
                    className="bg-purple-800 hover:bg-purple-900"
                    disabled={updateQuizMutation.isPending}
                  >
                    Edit Question
                  </Button>
                  <Button 
                    onClick={() => handleConfirmDelete(true)} 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    disabled={deleteQuestionMutation.isPending}
                  >
                    Delete Question
                  </Button>
                </div>
              )}
              
              {!selectedQuestionId && quizData.questions && quizData.questions.length > 0 && (
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
        isLoading={updateQuizMutation.isPending}
      />
      
      {/* Confirm Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isDeleteQuestion ? 'Delete Question' : 'Delete Quiz'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isDeleteQuestion 
                ? 'Are you sure you want to delete this question?'
                : 'Are you sure you want to delete this entire quiz and all its questions?'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={isDeleteQuestion ? handleDeleteQuestion : handleDeleteQuiz}
              disabled={isDeleteQuestion ? deleteQuestionMutation.isPending : deleteQuizMutation.isPending}
            >
              {(isDeleteQuestion ? deleteQuestionMutation.isPending : deleteQuizMutation.isPending) ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizEdit;