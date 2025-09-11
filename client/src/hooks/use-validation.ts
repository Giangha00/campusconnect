import { useState, useCallback } from 'react';
import { ValidationResult, ValidationRule, validateField } from '@/lib/validation';

export interface UseValidationReturn {
  errors: Record<string, string>;
  validate: (fieldName: string, value: string, rules: ValidationRule) => boolean;
  validateAll: (fields: Record<string, { value: string; rules: ValidationRule }>) => boolean;
  clearError: (fieldName: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

export function useValidation(): UseValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((fieldName: string, value: string, rules: ValidationRule): boolean => {
    const result = validateField(value, rules);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (result.isValid) {
        delete newErrors[fieldName];
      } else {
        newErrors[fieldName] = result.message || 'Invalid input';
      }
      return newErrors;
    });

    return result.isValid;
  }, []);

  const validateAll = useCallback((fields: Record<string, { value: string; rules: ValidationRule }>): boolean => {
    const newErrors: Record<string, string> = {};
    let allValid = true;

    for (const [fieldName, { value, rules }] of Object.entries(fields)) {
      const result = validateField(value, rules);
      if (!result.isValid) {
        newErrors[fieldName] = result.message || 'Invalid input';
        allValid = false;
      }
    }

    setErrors(newErrors);
    return allValid;
  }, []);

  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    validate,
    validateAll,
    clearError,
    clearAllErrors,
    hasErrors
  };
}
