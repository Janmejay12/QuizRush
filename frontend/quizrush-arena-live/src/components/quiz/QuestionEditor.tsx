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
import { Question } from '@/lib/types';
import { toast } from 'sonner';

interface QuestionEditorProps {
  onSave: (question: Question) => void;
  defaultQuestion?: Question;
  isLoading?: boolean;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ onSave, defaultQuestion, isLoading = false }) => {
  const [question, setQuestion] = useState<Question>(
    defaultQuestion || {
      text: '',
      options: ['', '', '', ''],
      correctOptionIndices: [],
      points: 1,
      duration: 30,
    }
  );

  const optionColors = ['option-card-blue', 'option-card-teal', 'option-card-yellow', 'option-card-red'];
  
  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion({ ...question, text: e.target.value });
  };

  const handleOptionTextChange = (index: number, text: string) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = text;
    
    setQuestion({
      ...question,
      options: updatedOptions
    });
  };

  const handleOptionCorrectChange = (index: number, isCorrect: boolean) => {
    const isMultipleCorrect = question.correctOptionIndices.length > 1 || 
      (question.correctOptionIndices.length === 1 && !question.correctOptionIndices.includes(index) && isCorrect);
    
    if (!isMultipleCorrect) {
      // Single answer mode - only one option can be correct
      setQuestion({
        ...question,
        correctOptionIndices: isCorrect ? [index] : []
      });
    } else {
      // Multiple answers mode - multiple options can be correct
      const updatedIndices = isCorrect 
        ? [...question.correctOptionIndices, index] 
        : question.correctOptionIndices.filter(i => i !== index);
      
      setQuestion({
        ...question,
        correctOptionIndices: updatedIndices
      });
    }
  };

  const handleAddOption = () => {
    if (question.options.length < 6) {
      setQuestion({
        ...question,
        options: [
          ...question.options,
          ''
        ]
      });
    }
  };

  const handleRemoveOption = (index: number) => {
    // Check if removing this option would violate the minimum options rule
    const isCorrectOption = question.correctOptionIndices.includes(index);
    const remainingCorrectOptions = isCorrectOption ? 
      question.correctOptionIndices.length - 1 : 
      question.correctOptionIndices.length;
    
    // For multiple correct answers, need at least correct + 1 option
    const minRequiredOptions = question.correctOptionIndices.length > 1 ? 
      remainingCorrectOptions + 1 : 2;

    if (question.options.length <= minRequiredOptions) {
      toast.error("Cannot remove option. Need at least one correct option and one incorrect option.");
      return;
    }

    const updatedOptions = question.options.filter((_, i) => i !== index);
    
    // Update correctOptionIndices to account for removed option
    const updatedIndices = question.correctOptionIndices
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i);
    
    setQuestion({
      ...question,
      options: updatedOptions,
      correctOptionIndices: updatedIndices
    });
  };

  const handleAnswerTypeChange = (multipleCorrect: boolean) => {
    // When switching to single answer mode, ensure only one option is selected
    if (!multipleCorrect && question.correctOptionIndices.length > 1) {
      setQuestion({
        ...question,
        correctOptionIndices: question.correctOptionIndices.length > 0 ? [question.correctOptionIndices[0]] : []
      });
    }
  };

  const handlePointsChange = (points: string) => {
    setQuestion({
      ...question,
      points: parseInt(points, 10)
    });
  };

  const handleDurationChange = (duration: string) => {
    setQuestion({
      ...question,
      duration: parseInt(duration, 10)
    });
  };

  const handleSave = () => {
    // Validate before saving
    if (!question.text.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    // Check if at least one option is marked correct
    if (question.correctOptionIndices.length === 0) {
      toast.error("Please mark at least one option as correct");
      return;
    }
    
    // Check if all options have text
    if (question.options.some(text => !text.trim())) {
      toast.error("Please fill in text for all options");
      return;
    }
    
    onSave(question);
  };

  const isMultipleCorrect = question.correctOptionIndices.length > 1;

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
              <label htmlFor="duration" className="block text-xs text-white mb-1">Time Limit</label>
              <Select
                value={question.duration.toString()}
                onValueChange={handleDurationChange}
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
        {question.options.map((optionText, index) => {
          const isCorrect = question.correctOptionIndices.includes(index);
          return (
            <Card 
              key={index} 
              className={`relative h-40 flex flex-col items-center justify-center text-white text-center ${optionColors[index % optionColors.length]}`}
            >
              <button 
                className="absolute top-2 left-2 bg-white/20 rounded-full p-1 hover:bg-white/40"
                onClick={() => handleRemoveOption(index)}
                type="button"
                aria-label="Delete option"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
              {!isMultipleCorrect ? (
                <div className="absolute top-2 right-2">
                  <RadioGroup 
                    value={isCorrect ? index.toString() : ""} 
                    onValueChange={(value) => handleOptionCorrectChange(index, value === index.toString())}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={index.toString()} 
                        id={`radio-${index}`} 
                        className="border-white text-white"
                      />
                    </div>
                  </RadioGroup>
                </div>
              ) : (
                <div className="absolute top-2 right-2">
                  <Checkbox
                    id={`checkbox-${index}`}
                    checked={isCorrect}
                    onCheckedChange={(checked) => {
                      handleOptionCorrectChange(index, !!checked);
                    }}
                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-purple-800 cursor-pointer"
                  />
                </div>
              )}
              <Input
                className="bg-transparent border-none text-center text-white placeholder-white/70 text-lg max-w-[80%]"
                value={optionText}
                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                placeholder="Type answer option here"
              />
            </Card>
          );
        })}
      </div>
      
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          disabled={question.options.length >= 6}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Option
        </Button>
        
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8"
        >
          {isLoading ? 'Saving...' : 'Save Question'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditor;
