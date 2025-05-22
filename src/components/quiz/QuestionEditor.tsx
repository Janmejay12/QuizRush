import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  points: number;
  timeLimit: number;
  multipleCorrectAnswers: boolean;
}

interface QuestionEditorProps {
  onSave: (question: Question) => void;
  defaultQuestion?: Question;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ onSave, defaultQuestion }) => {
  const [question, setQuestion] = useState<Question>(
    defaultQuestion || {
      id: crypto.randomUUID(),
      text: '',
      options: [
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ],
      points: 1,
      timeLimit: 30,
      multipleCorrectAnswers: false,
    }
  );

  const optionColors = ['option-card-blue', 'option-card-teal', 'option-card-yellow', 'option-card-red'];
  
  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion({ ...question, text: e.target.value });
  };

  const handleOptionTextChange = (id: string, text: string) => {
    setQuestion({
      ...question,
      options: question.options.map(option => 
        option.id === id ? { ...option, text } : option
      )
    });
  };

  const handleOptionCorrectChange = (id: string, isCorrect: boolean) => {
    if (!question.multipleCorrectAnswers) {
      // Single answer mode - only one option can be correct
      setQuestion({
        ...question,
        options: question.options.map(option => 
          option.id === id ? { ...option, isCorrect } : { ...option, isCorrect: false }
        )
      });
    } else {
      // Multiple answers mode - multiple options can be correct
      setQuestion({
        ...question,
        options: question.options.map(option => 
          option.id === id ? { ...option, isCorrect } : option
        )
      });
    }
  };

  const handleAddOption = () => {
    if (question.options.length < 6) {
      setQuestion({
        ...question,
        options: [
          ...question.options,
          { id: crypto.randomUUID(), text: '', isCorrect: false }
        ]
      });
    }
  };

  const handleRemoveOption = (id: string) => {
    if (question.options.length > 2) {
      setQuestion({
        ...question,
        options: question.options.filter(option => option.id !== id)
      });
    }
  };

  const handleAnswerTypeChange = (multipleCorrectAnswers: boolean) => {
    // When switching to single answer mode, ensure only one option is selected
    if (!multipleCorrectAnswers) {
      const correctOptions = question.options.filter(o => o.isCorrect);
      if (correctOptions.length > 1) {
        // Reset all to false, or keep just the first correct one
        setQuestion({
          ...question,
          multipleCorrectAnswers,
          options: question.options.map((option, index) => ({
            ...option,
            isCorrect: index === question.options.findIndex(o => o.isCorrect)
          }))
        });
        return;
      }
    }
    
    setQuestion({
      ...question,
      multipleCorrectAnswers
    });
  };

  const handlePointsChange = (points: string) => {
    setQuestion({
      ...question,
      points: parseInt(points, 10)
    });
  };

  const handleTimeLimitChange = (timeLimit: string) => {
    setQuestion({
      ...question,
      timeLimit: parseInt(timeLimit, 10)
    });
  };

  const handleSave = () => {
    // Validate before saving
    if (!question.text.trim()) {
      alert("Please enter a question");
      return;
    }
    
    // Check if at least one option is marked correct
    if (!question.options.some(o => o.isCorrect)) {
      alert("Please mark at least one option as correct");
      return;
    }
    
    // Check if all options have text
    if (question.options.some(o => !o.text.trim())) {
      alert("Please fill in text for all options");
      return;
    }
    
    onSave(question);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="bg-purple-900 rounded-lg p-6 mb-5 relative">
        <div className="flex justify-between mb-5">
          <div className="flex space-x-3">
            <div>
              <label htmlFor="points" className="block text-xs text-white mb-1">Points</label>
              <Select
                value={question.points.toString()}
                onValueChange={handlePointsChange}
              >
                <SelectTrigger className="w-24 h-8 text-sm bg-white">
                  <SelectValue placeholder="Points" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 10].map(value => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} {value === 1 ? 'point' : 'points'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="timeLimit" className="block text-xs text-white mb-1">Time Limit</label>
              <Select
                value={question.timeLimit.toString()}
                onValueChange={handleTimeLimitChange}
              >
                <SelectTrigger className="w-32 h-8 text-sm bg-white">
                  <SelectValue placeholder="Time limit" />
                </SelectTrigger>
                <SelectContent>
                  {[15, 30, 45, 60, 90, 120].map(value => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} seconds
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Textarea 
          value={question.text}
          onChange={handleQuestionChange}
          placeholder="Type question here"
          className="w-full h-32 p-4 text-xl text-center bg-transparent border-white border-2 rounded-lg placeholder-white/70 text-white resize-none focus-visible:ring-purple-400"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {question.options.map((option, index) => (
          <Card 
            key={option.id} 
            className={`relative h-40 flex flex-col items-center justify-center text-white text-center ${optionColors[index % optionColors.length]}`}
          >
            <button 
              className="absolute top-2 left-2 bg-white/20 rounded-full p-1 hover:bg-white/40"
              onClick={() => handleRemoveOption(option.id)}
              type="button"
              aria-label="Delete option"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
            {!question.multipleCorrectAnswers ? (
              <div className="absolute top-2 right-2">
                <RadioGroup 
                  value={option.isCorrect ? option.id : ""} 
                  onValueChange={(value) => handleOptionCorrectChange(option.id, value === option.id)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.id} 
                      id={`radio-${option.id}`} 
                      className="border-white text-white"
                    />
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <div className="absolute top-2 right-2">
                <Checkbox
                  id={`checkbox-${option.id}`}
                  checked={option.isCorrect}
                  onCheckedChange={(checked) => {
                    handleOptionCorrectChange(option.id, !!checked);
                  }}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-purple-800"
                />
              </div>
            )}
            <Input
              className="bg-transparent border-none text-center text-white placeholder-white/70 text-lg max-w-[80%]"
              value={option.text}
              onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
              placeholder="Type answer option here"
            />
          </Card>
        ))}
      </div>
      
      {question.options.length < 6 && (
        <div className="flex justify-center mb-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddOption}
            className="flex items-center border-2 border-purple-800 text-purple-800"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Option
          </Button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6 bg-slate-100 p-3 rounded-lg">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input 
              type="radio" 
              id="singleAnswer" 
              checked={!question.multipleCorrectAnswers} 
              onChange={() => handleAnswerTypeChange(false)}
              className="mr-2"
            />
            <label htmlFor="singleAnswer" className="font-medium">Single correct answer</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="multipleAnswers" 
              checked={question.multipleCorrectAnswers} 
              onChange={() => handleAnswerTypeChange(true)}
              className="mr-2"
            />
            <label htmlFor="multipleAnswers" className="font-medium">Multiple correct answers</label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-purple-800 hover:bg-purple-900 px-6"
        >
          Save Question
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditor;
