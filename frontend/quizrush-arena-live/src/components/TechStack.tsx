
import React, { useEffect, useRef } from 'react';

interface TechItemProps {
  image: string;
  name: string;
  delay?: number;
}

const TechItem: React.FC<TechItemProps> = ({ image, name, delay = 0 }) => {
  const itemRef = useRef<HTMLDivElement>(null);

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

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, [delay]);

  return (
    <div ref={itemRef} className="reveal flex flex-col items-center">
      <div className="w-20 h-20 mb-4 flex items-center justify-center bg-white rounded-lg shadow-md p-2">
        <img src={image} alt={name} className="max-h-full max-w-full" />
      </div>
      <p className="font-medium text-gray-800">{name}</p>
    </div>
  );
};

const TechStack: React.FC = () => {
  return (
    <section id="tech-stack" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built with Modern Technology</h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            QuizRush leverages cutting-edge technologies to provide a seamless, fast, and reliable experience.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
          <TechItem 
            image="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" 
            name="Spring Boot" 
            delay={0} 
          />
          <TechItem 
            image="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" 
            name="React" 
            delay={100} 
          />
          <TechItem 
            image="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" 
            name="PostgreSQL" 
            delay={200} 
          />
          <TechItem 
            image="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
            name="JavaScript" 
            delay={300} 
          />
          <TechItem 
            image="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" 
            name="Java" 
            delay={400} 
          />
          <TechItem 
            image="https://github.com/devicons/devicon/blob/v2.16.0/icons/tailwindcss/tailwindcss-original.svg" 
            name="Tailwind CSS" 
            delay={500} 
          />
        </div>

        <div className="mt-16 text-center">
          <p className="text-xl text-gray-700 font-medium">
            Built for speed, reliability, and fun.
          </p>
          <p className="text-gray-600 mt-2">
            Our architecture ensures millisecond response times and rock-solid stability.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
