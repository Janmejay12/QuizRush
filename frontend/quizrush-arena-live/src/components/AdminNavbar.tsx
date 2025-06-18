import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b bg-white/80 backdrop-blur-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => navigate('/admin')}
        >
          <h1 className="text-2xl font-bold text-quizrush-purple">
            Quiz<span className="text-quizrush-blue">Rush</span>
          </h1>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 