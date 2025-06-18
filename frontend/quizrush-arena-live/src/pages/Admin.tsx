import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { authService } from '@/lib/auth';
import { quizService } from '@/lib/quiz';
import { useQuery } from '@tanstack/react-query';
import { Quiz } from '@/lib/types';
import AdminNavbar from '@/components/AdminNavbar';

interface QuizCardProps {
  quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const navigate = useNavigate();

  const handleEditQuiz = (id: number | string) => {
    // Navigate to edit quiz page
    navigate(`/admin/quiz/${id}/edit`);
  };

  const handleViewQuiz = (id: number | string) => {
    // Navigate to view quiz page
    navigate(`/admin/quiz/${id}`);
  };

  // Format date to "Date Month, Year Hours:Minutes AM/PM"
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="border shadow-md hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-bold">{quiz.title}</h3>
        <p className="text-sm text-gray-500">{quiz.questions?.length || 0} Questions</p>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700">Created on {formatDate(quiz.createdAt)}</p>
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
          className="bg-purple-800 hover:bg-purple-700"
          size="sm"
          onClick={() => handleViewQuiz(quiz.id)}
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
};

const Admin: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
   if(!authService.isAuthenticated()){
    toast.error('Please log in to access this page');
    navigate('/')
   }
  }, [navigate]);
  
  // Fetch quizzes from reactQuery
   const { data : quizzes, isLoading, isError, refetch} = useQuery({
    queryKey : ['quizzes'],
    queryFn : quizService.getAllQuizzes,
    enabled : authService.isAuthenticated(),
   })
  
  // Handle search
  useEffect(() => {
    if(!quizzes) return;
    
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
      <AdminNavbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Quiz Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage and create your quiz experiences</p>
          </div>
          <Button 
            className="mt-4 md:mt-0 bg-purple-800 hover:bg-purple-700"
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
        {isLoading ? (
          <div className="text-center py-8">Loading quizzes...</div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error loading quizzes. 
            <Button 
              variant="link" 
              onClick={() => refetch()} 
              className="text-purple-700"
            >
              Try again
            </Button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Admin;
