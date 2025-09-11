// Validation utility functions for form inputs

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => ValidationResult;
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  name: /^[a-zA-Z\s]{2,50}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s\-_]+$/,
};

// Validation functions
export const validateField = (
  value: string,
  rules: ValidationRule
): ValidationResult => {
  // Required validation
  if (rules.required && (!value || value.trim() === '')) {
    return { isValid: false, message: 'This field is required' };
  }

  // Skip other validations if value is empty and not required
  if (!value || value.trim() === '') {
    return { isValid: true };
  }

  const trimmedValue = value.trim();

  // Min length validation
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return {
      isValid: false,
      message: `Minimum length is ${rules.minLength} characters`
    };
  }

  // Max length validation
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return {
      isValid: false,
      message: `Maximum length is ${rules.maxLength} characters`
    };
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return { isValid: false, message: 'Invalid format' };
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(trimmedValue);
  }

  return { isValid: true };
};

// Specific validation functions
export const validateEmail = (email: string): ValidationResult => {
  return validateField(email, {
    required: true,
    pattern: patterns.email,
    maxLength: 100
  });
};

export const validateUsername = (username: string): ValidationResult => {
  return validateField(username, {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: patterns.username
  });
};

export const validatePassword = (password: string): ValidationResult => {
  return validateField(password, {
    required: true,
    minLength: 6,
    maxLength: 50,
    custom: (value) => {
      if (value.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters' };
      }
      if (!/(?=.*[a-z])/.test(value)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
      }
      if (!/(?=.*\d)/.test(value)) {
        return { isValid: false, message: 'Password must contain at least one number' };
      }
      return { isValid: true };
    }
  });
};

export const validateName = (name: string): ValidationResult => {
  return validateField(name, {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: patterns.name
  });
};

export const validatePhone = (phone: string): ValidationResult => {
  return validateField(phone, {
    required: false,
    pattern: patterns.phone,
    maxLength: 20
  });
};

export const validateSearchQuery = (query: string): ValidationResult => {
  return validateField(query, {
    required: false,
    maxLength: 100,
    pattern: patterns.alphanumeric
  });
};

export const validateFeedback = (feedback: string): ValidationResult => {
  return validateField(feedback, {
    required: true,
    minLength: 10,
    maxLength: 1000
  });
};

export const validateDepartment = (department: string): ValidationResult => {
  return validateField(department, {
    required: false,
    minLength: 2,
    maxLength: 50,
    pattern: patterns.noSpecialChars
  });
};

// Form validation helper
export const validateForm = (
  fields: Record<string, { value: string; rules: ValidationRule }>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [fieldName, { value, rules }] of Object.entries(fields)) {
    const result = validateField(value, rules);
    if (!result.isValid) {
      errors[fieldName] = result.message || 'Invalid input';
      isValid = false;
    }
  }

  return { isValid, errors };
};
