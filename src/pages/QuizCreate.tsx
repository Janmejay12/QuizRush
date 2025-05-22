
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import QuizDetailDialog from '@/components/quiz/QuizDetailDialog';
import { QuizFormValues } from '@/components/quiz/QuizDetailDialog';

const QuizCreate: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle quiz creation form submission
  const handleCreateQuiz = (formData: QuizFormValues) => {
    // In a real app, we would submit this to an API
    // For now, let's create a temporary quiz ID
    const quizId = crypto.randomUUID();
    
    // Store quiz details in localStorage so we can access them in the question editor
    localStorage.setItem(`quiz_${quizId}`, JSON.stringify({
      ...formData,
      id: quizId,
      createdAt: new Date().toISOString(),
      questions: []
    }));
    
    toast({
      title: "Quiz created",
      description: `'${formData.title}' has been created. Add your first question now.`,
    });
    
    // Navigate to question editor
    navigate(`/admin/quiz/${quizId}/question/new`);
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
        />
      </div>
    </div>
  );
};

export default QuizCreate;
