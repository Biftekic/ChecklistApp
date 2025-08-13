'use client';

import { Question, QuestionOption } from '@/lib/types/qa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Home, 
  Building2, 
  Bed, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { useState } from 'react';

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
}

const iconMap: Record<string, any> = {
  home: Home,
  building: Building2,
  bed: Bed,
};

export function QuestionRenderer({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  canGoBack,
  canGoNext,
}: QuestionRendererProps) {
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    setError(null);
    
    // Validate if needed
    if (question.validation) {
      const { min, max, pattern, message } = question.validation;
      
      if (min !== undefined && Number(newValue) < min) {
        setError(message || `Value must be at least ${min}`);
        return;
      }
      
      if (max !== undefined && Number(newValue) > max) {
        setError(message || `Value must be at most ${max}`);
        return;
      }
      
      if (pattern && !new RegExp(pattern).test(String(newValue))) {
        setError(message || 'Invalid format');
        return;
      }
    }
    
    onChange(newValue);
  };

  const handleNext = () => {
    if (question.required && !localValue) {
      setError('This question is required');
      return;
    }
    onNext();
  };

  const renderSingleSelect = () => (
    <div className="grid gap-3 sm:grid-cols-2">
      {question.options?.map((option) => {
        const optionObj = typeof option === "string" ? { id: option, value: option, label: option } : option;
        const Icon = iconMap[typeof option === "string" ? option : optionObj.icon || ''];
        const isSelected = localValue === (typeof option === "string" ? option : optionObj.value);
        
        return (
          <Card
            key={typeof option === "string" ? option : optionObj.id}
            className={`cursor-pointer border-2 p-4 transition-all hover:shadow-md ${
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleChange(typeof option === "string" ? option : optionObj.value)}
          >
            <div className="flex items-start gap-3">
              {Icon && (
                <div className="mt-1">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer font-medium">
                    {typeof option === "string" ? option : optionObj.label}
                  </Label>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                {typeof option !== "string" && optionObj.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {optionObj.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderMultiSelect = () => {
    const selectedValues = Array.isArray(localValue) ? localValue : [];
    
    return (
      <div className="space-y-3">
        {question.options?.map((option) => {
          const isSelected = selectedValues.includes(typeof option === "string" ? option : option.value);
          const optionObj = typeof option === "string" ? { id: option, value: option, label: option } : option;
          
          return (
            <Card
              key={typeof option === "string" ? option : optionObj.id}
              className={`cursor-pointer border p-4 transition-all ${
                isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => {
                const optionValue = typeof option === "string" ? option : optionObj.value;
                const newValues = isSelected
                  ? selectedValues.filter(v => v !== optionValue)
                  : [...selectedValues, optionValue];
                handleChange(newValues);
              }}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => {}}
                  className="pointer-events-none"
                />
                <div className="flex-1">
                  <Label className="cursor-pointer font-medium">
                    {typeof option === "string" ? option : optionObj.label}
                  </Label>
                  {typeof option !== "string" && optionObj.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {optionObj.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderNumberInput = () => (
    <div className="max-w-xs">
      <Input
        type="number"
        value={localValue || ''}
        onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
        placeholder={question.placeholder}
        min={question.validation?.min}
        max={question.validation?.max}
        className="h-12"
      />
    </div>
  );

  const renderTextInput = () => (
    <div className="max-w-lg">
      <Textarea
        value={localValue || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={question.placeholder}
        rows={4}
        className="resize-none"
      />
    </div>
  );

  const renderBooleanInput = () => (
    <div className="flex gap-4">
      <Button
        variant={localValue === true ? 'default' : 'outline'}
        size="lg"
        onClick={() => handleChange(true)}
        className="flex-1"
      >
        Yes
      </Button>
      <Button
        variant={localValue === false ? 'default' : 'outline'}
        size="lg"
        onClick={() => handleChange(false)}
        className="flex-1"
      >
        No
      </Button>
    </div>
  );

  const renderScaleInput = () => {
    const scaleOptions = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex gap-2">
        {scaleOptions.map((num) => (
          <Button
            key={num}
            variant={localValue === num ? 'default' : 'outline'}
            size="lg"
            onClick={() => handleChange(num)}
            className="h-12 w-12"
          >
            {num}
          </Button>
        ))}
      </div>
    );
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'single-select':
        return renderSingleSelect();
      case 'multi-select':
        return renderMultiSelect();
      case 'number':
        return renderNumberInput();
      case 'text':
        return renderTextInput();
      case 'boolean':
        return renderBooleanInput();
      case 'scale':
        return renderScaleInput();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{question.text}</h2>
        {question.description && (
          <p className="text-muted-foreground">{question.description}</p>
        )}
        {question.helpText && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
            <Info className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {question.helpText}
            </p>
          </div>
        )}
      </div>

      {/* Question Content */}
      <div>{renderQuestionContent()}</div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={!canGoBack}
          className="flex-1"
        >
          Previous
        </Button>
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!canGoNext && question.required && !localValue}
          className="flex-1"
        >
          {canGoNext ? 'Next' : 'Complete'}
        </Button>
      </div>
    </div>
  );
}