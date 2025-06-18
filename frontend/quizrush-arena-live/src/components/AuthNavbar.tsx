import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AuthNavbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b bg-white/80 backdrop-blur-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-quizrush-purple">
            Quiz<span className="text-quizrush-blue">Rush</span>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          {currentPath !== '/join-quiz' && (
            <Link to="/join-quiz">
              <Button variant="outline" className="border-quizrush-purple text-quizrush-purple hover:bg-quizrush-purple hover:text-white">
                Join Quiz
              </Button>
            </Link>
          )}
          {currentPath !== '/login' && (
            <Link to="/login">
              <Button variant="outline" className="border-quizrush-blue text-quizrush-blue hover:bg-quizrush-blue hover:text-white">
                Log In
              </Button>
            </Link>
          )}
          {currentPath !== '/signup' && (
            <Link to="/signup">
              <Button className="bg-quizrush-purple hover:bg-quizrush-light-purple">
                Sign Up
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;
