
import React from 'react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b bg-white/80 backdrop-blur-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-quizrush-purple">
            Quiz<span className="text-quizrush-blue">Rush</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-gray-600 hover:text-quizrush-purple transition-colors">Features</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-quizrush-purple transition-colors">How It Works</a>
          <a href="#tech-stack" className="text-gray-600 hover:text-quizrush-purple transition-colors">Tech Stack</a>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-quizrush-purple text-quizrush-purple hover:bg-quizrush-purple hover:text-white">
            Log In
          </Button>
          <Button className="bg-quizrush-purple hover:bg-quizrush-light-purple">
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
