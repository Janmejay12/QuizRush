
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface Quiz {
  id: number;
  title: string;
  questionsCount: number;
  createdAt: string;
}

interface QuizCardProps {
  quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const navigate = useNavigate();

  const handleEditQuiz = (id: number) => {
    // Navigate to edit quiz page
    navigate(`/edit-quiz/${id}`);
  };

  const handleStartQuiz = (id: number) => {
    // In a real app, this would start a session and generate a room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    toast.success(`Quiz started! Room code: ${roomCode}`);
  };

  return (
    <Card className="border shadow-md hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-bold">{quiz.title}</h3>
        <p className="text-sm text-gray-500">{quiz.questionsCount} Questions</p>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700">Created on {quiz.createdAt}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleEditQuiz(quiz.id)}
        >
          Edit
        </Button>
        <Button 
          className="bg-quizrush-purple hover:bg-quizrush-light-purple"
          size="sm"
          onClick={() => handleStartQuiz(quiz.id)}
        >
          Start
        </Button>
      </CardFooter>
    </Card>
  );
};

const Admin: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      toast.error('Please log in to access this page');
      navigate('/login');
    }
  }, [navigate]);
  
  // Fetch quizzes (simulated)
  useEffect(() => {
    // Sample quiz data - in a real app, you'd fetch from backend
    const sampleQuizzes: Quiz[] = [
      { id: 1, title: "General Knowledge", questionsCount: 10, createdAt: "May 10, 2023" },
      { id: 2, title: "Science Quiz", questionsCount: 15, createdAt: "June 5, 2023" },
      { id: 3, title: "History Trivia", questionsCount: 12, createdAt: "July 12, 2023" },
      { id: 4, title: "Math Challenge", questionsCount: 8, createdAt: "Aug 22, 2023" }
    ];
    
    setQuizzes(sampleQuizzes);
    setFilteredQuizzes(sampleQuizzes);
  }, []);
  
  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredQuizzes(quizzes);
      return;
    }
    
    const filtered = quizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQuizzes(filtered);
  }, [searchQuery, quizzes]);
  
  const handleCreateQuiz = () => {
    navigate('/create-quiz');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container pt-24 pb-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-quizrush-dark-blue">Quiz Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage and create your quiz experiences</p>
          </div>
          <Button 
            className="mt-4 md:mt-0 bg-quizrush-purple hover:bg-quizrush-light-purple"
            onClick={handleCreateQuiz}
          >
            Create New Quiz
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            className="pl-10"
            placeholder="Search quizzes by title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredQuizzes.length > 0 ? (
            filteredQuizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              {quizzes.length > 0 ? 'No quizzes match your search' : 'You haven\'t created any quizzes yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
