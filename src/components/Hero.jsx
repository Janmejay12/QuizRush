
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [quizCode, setQuizCode] = useState('');

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 hero-pattern overflow-hidden">
      {/* Confetti elements */}
      <div className="absolute top-20 left-1/4 w-8 h-8 bg-quizrush-yellow rounded-full opacity-70 animate-confetti" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-40 right-1/4 w-6 h-6 bg-quizrush-green rounded-full opacity-70 animate-confetti" style={{ animationDelay: '1.2s' }}></div>
      <div className="absolute top-60 left-1/3 w-4 h-4 bg-quizrush-blue rounded-full opacity-70 animate-confetti" style={{ animationDelay: '0.8s' }}></div>
      <div className="absolute top-20 right-1/3 w-5 h-5 bg-quizrush-red rounded-full opacity-70 animate-confetti" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-quizrush-purple to-quizrush-blue bg-clip-text text-transparent animate-fade-in">
            Welcome to QuizRush!
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-8 text-gray-700 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Host live quizzes. Challenge friends. Win in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="bg-quizrush-blue hover:bg-blue-600 text-white font-medium text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              Host a Quiz
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-quizrush-green text-white hover:bg-green-600 border-0 font-medium text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              onClick={() => setIsJoinModalOpen(true)}
            >
              Join with Code
            </Button>
          </div>

          <div className="mt-16 relative animated-quiz-graphic">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg mx-auto transform hover:scale-105 transition-transform duration-500 animate-float">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs font-medium text-gray-500">QuizRush Live</div>
              </div>
              <div className="space-y-4">
                <div className="bg-quizrush-light-purple/10 p-4 rounded-lg">
                  <h3 className="font-bold text-lg text-quizrush-purple mb-2">Which planet is known as the Red Planet?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-100 hover:bg-blue-200 cursor-pointer p-3 rounded-lg text-left transition-colors">Mars</div>
                    <div className="bg-red-100 hover:bg-red-200 cursor-pointer p-3 rounded-lg text-left transition-colors">Venus</div>
                    <div className="bg-green-100 hover:bg-green-200 cursor-pointer p-3 rounded-lg text-left transition-colors">Jupiter</div>
                    <div className="bg-yellow-100 hover:bg-yellow-200 cursor-pointer p-3 rounded-lg text-left transition-colors">Mercury</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="font-medium">Time left: 15s</div>
                  <div className="font-medium">Players: 12</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Quiz Modal */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Join a Quiz</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code provided by the quiz host.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Input
                placeholder="Enter quiz code"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                className="text-lg py-6"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button 
              type="button" 
              className="bg-quizrush-purple hover:bg-quizrush-light-purple"
              onClick={() => setIsJoinModalOpen(false)}
            >
              Join Quiz <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;
