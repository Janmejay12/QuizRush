
import React, { useEffect, useRef } from 'react';

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  delay?: number;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description, delay = 0 }) => {
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (entry.target instanceof HTMLElement) {
                entry.target.classList.add('active');
              }
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => {
      if (stepRef.current) {
        observer.unobserve(stepRef.current);
      }
    };
  }, [delay]);

  return (
    <div ref={stepRef} className="reveal flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-quizrush-purple text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
        {number}
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How QuizRush Works</h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Three simple steps to get your quiz running and have fun with friends!
          </p>
        </div>
        
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-quizrush-purple/30"></div>
          
          <div className="grid md:grid-cols-3 gap-16 relative">
            <StepCard 
              number="1" 
              title="Create & Share" 
              description="Host creates a quiz and gets a unique code to share with participants." 
              delay={0}
            />
            <StepCard 
              number="2" 
              title="Join Together" 
              description="Friends use the code to join the room from anywhere in the world." 
              delay={200}
            />
            <StepCard 
              number="3" 
              title="Play Live!" 
              description="Everyone answers questions in real-time and competes on the leaderboard." 
              delay={400}
            />
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <img src="https://cdn.pixabay.com/photo/2015/07/10/17/24/internet-839803_1280.jpg" alt="Quiz Game in Progress" className="rounded-lg shadow-md" />
              </div>
              <div className="md:w-1/2 md:pl-8 text-left">
                <h3 className="text-xl font-bold mb-4">Ready to start your first quiz?</h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of users who are already creating fun, educational quizzes for friends, students, and colleagues!
                </p>
                <button className="bg-quizrush-purple hover:bg-quizrush-light-purple text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all">
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
