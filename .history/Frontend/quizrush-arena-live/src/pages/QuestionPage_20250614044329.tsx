import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import QuestionEditor from '@/components/quiz/QuestionEditor';
import { Question, Quiz } from '@/lib/types';
import { quizService } from '@/lib/quiz';
import { questionService } from '@/lib/question';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const QuestionPage: React.FC = () => {
  const { quizId, questionId } = useParams<{ quizId: string; questionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch quiz data
  const { data: quizData, isLoading: quizLoading, error: quizError } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizService.getQuizById(Number(quizId)),
    enabled: !!quizId,
    staleTime: 60000 // 1 minute
  });
  
  // Fetch question data if editing an existing question
  const { data: questionData, isLoading: questionLoading } = useQuery({
    queryKey: ['question', quizId, questionId],
    queryFn: () => questionService.getQuestionById(Number(quizId), Number(questionId)),
    enabled: !!quizId && !!questionId && questionId !== 'new',
    staleTime: 60000 // 1 minute
  });
  
  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (question: Question) => questionService.createQuestion(Number(quizId), question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      toast({
        title: "Question created",
        description: "Your question has been added to the quiz.",
        duration: 3000
      });
      navigate(`/admin/quiz/${quizId}/edit`);
    },
    onError: (error) => {
      console.error('Error creating question:', error);
      toast({
        title: "Creation failed",
        description: "There was a problem adding your question. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    }
  });
  
  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: (question: Question) => questionService.updateQuestion(Number(questionId), question, Number(quizId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      queryClient.invalidateQueries({ queryKey: ['question', quizId, questionId] });
      toast({
        title: "Question updated",
        description: "Your question has been updated."
      });
      navigate(`/admin/quiz/${quizId}/edit`);
    },
    onError: (error) => {
      console.error('Error updating question:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your question. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle error state
  useEffect(() => {
    if (quizError) {
      toast({
        title: "Quiz not found",
        description: "The quiz you're trying to edit doesn't exist.",
        variant: "destructive"
      });
      navigate('/admin');
    }
  }, [quizError, navigate, toast]);

  const handleSaveQuestion = (question: Question) => {
    if (questionId && questionId !== 'new') {
      // Update existing question
      updateQuestionMutation.mutate(question);
    } else {
      // Create new question
      createQuestionMutation.mutate(question);
    }
  };

  const isLoading = quizLoading || (questionId !== 'new' && questionLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container pt-20 pb-12">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container pt-20 pb-12">
          <p className="text-center">Quiz not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container pt-20 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-purple-900">
            {questionId === 'new' ? 'Add New Question' : 'Edit Question'}
          </h1>
          <p className="text-gray-600">Quiz: {quizData.title}</p>
        </div>
        
        <QuestionEditor 
          onSave={handleSaveQuestion}
          defaultQuestion={questionData}
          isLoading={createQuestionMutation.isPending || updateQuestionMutation.isPending}
        />
      </div>
    </div>
  );
};

export default QuestionPage;