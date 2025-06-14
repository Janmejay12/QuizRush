import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import QuizDetailDialog from '@/components/quiz/QuizDetailDialog';
import { QuizFormValues } from '@/components/quiz/QuizDetailDialog';
import { useMutation } from '@tanstack/react-query';
import { Quiz } from '@/lib/types';
import { quizService } from '@/lib/quiz';

const QuizCreate: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(true);
  const navigate = useNavigate(); 
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createQuizMutation = useMutation({
    mutationFn : (quiz : Quiz) => quizService.createQuiz(quiz),
    onSuccess : (createdQuiz) => {
      toast({
        title : "Quiz Created",
        description : `${createdQuiz.title} has been created. Add your first question now.`,
        duration: 3000
      })
      navigate(`/admin/quiz/${createdQuiz.id}/question/new`)
    },
    onError : (error: any) => {
      console.error('Error creating quiz:', error);
      // Check if error is an AxiosError with response data
      if (error?.response?.data) {
        console.error('Server error details:', error.response.data);
        toast({
          title: "Error",
          description: error.response.data.error || "Failed to create quiz. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create quiz. Please try again.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }
  })
  
  // Handle quiz creation form submission
  const handleCreateQuiz = (formData: QuizFormValues) => {
    setIsLoading(true);

    const newQuiz: Quiz = {
      title: formData.title,
      description: formData.description,
      maxParticipants: formData.maxParticipants,
      subject: formData.subject,
      grade: formData.grade,
      status: 'CREATED',
      currentQuestionIndex: 0
    }
    createQuizMutation.mutate(newQuiz);
  };

  // If user closes dialog, go back to admin page
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container pt-24 pb-12 px-4">
        {/* The QuizDetailDialog will be shown automatically */}
        <QuizDetailDialog
          open={dialogOpen}
          onOpenChange={handleOpenChange}
          onSubmit={handleCreateQuiz}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default QuizCreate;
