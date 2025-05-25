
import React, { useEffect, useRef } from 'react';
import { Users, Clock, Search } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  bgColor: string;
  delay?: number; 
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, bgColor, delay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div 
      ref={cardRef}
      className={`p-8 rounded-xl shadow-lg border border-gray-100 ${bgColor} reveal bg-white transition-all duration-300 hover:shadow-xl`}
    >
      <div className="mb-4 inline-block p-3 rounded-full bg-quizrush-purple/10">
        <Icon className="h-8 w-8 text-quizrush-purple" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Exciting Features</h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Discover what makes QuizRush the perfect platform for interactive quizzes and learning.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={Users}
            title="Real-time Multiplayer Quizzes"
            description="Connect and compete with friends in real-time, regardless of where they are located."
            bgColor="hover:bg-blue-50"
            delay={0}
          />
          <FeatureCard
            icon={Clock}
            title="Live Leaderboards & Timers"
            description="Watch as scores update in real-time with competitive timers to keep the pressure on."
            bgColor="hover:bg-purple-50"
            delay={200}
          />
          <FeatureCard
            icon={Search}
            title="Easy Hosting and Joining"
            description="Create a quiz in minutes and share a simple code for others to join instantly."
            bgColor="hover:bg-green-50"
            delay={400}
          />
          <FeatureCard
            icon={Users}
            title="Secure & Fast with JWT Auth"
            description="Enterprise-grade security and lightning-fast WebSockets for the best experience."
            bgColor="hover:bg-yellow-50"
            delay={600}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
