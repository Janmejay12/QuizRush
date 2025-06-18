import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b bg-white/80 backdrop-blur-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-quizrush-purple">
            Quiz<span className="text-quizrush-blue">Rush</span>
          </h1>
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-gray-600 hover:text-quizrush-purple transition-colors">Features</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-quizrush-purple transition-colors">How It Works</a>
          <a href="#tech-stack" className="text-gray-600 hover:text-quizrush-purple transition-colors">Tech Stack</a>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/login">
            <Button variant="outline" className="border-quizrush-purple text-quizrush-purple hover:bg-quizrush-purple hover:text-white">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-quizrush-purple hover:bg-quizrush-light-purple">
              Sign Up
            </Button>
          </Link>
          <Link to="/join-quiz">
            <Button className="bg-quizrush-green hover:bg-green-600 text-white">
              Join Quiz
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
