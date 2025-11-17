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
  if (rules.required && (!value || value.trim() === "")) {
    return { isValid: false, message: "This field is required" };
  }

  // Skip other validations if value is empty and not required
  if (!value || value.trim() === "") {
    return { isValid: true };
  }

  const trimmedValue = value.trim();

  // Min length validation
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return {
      isValid: false,
      message: `Minimum length is ${rules.minLength} characters`,
    };
  }

  // Max length validation
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return {
      isValid: false,
      message: `Maximum length is ${rules.maxLength} characters`,
    };
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return { isValid: false, message: "Invalid format" };
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
    maxLength: 100,
  });
};

export const validateUsername = (username: string): ValidationResult => {
  return validateField(username, {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: patterns.username,
  });
};

export const validatePassword = (password: string): ValidationResult => {
  return validateField(password, {
    required: true,
    minLength: 6,
    maxLength: 50,
    custom: (value) => {
      if (value.length < 6) {
        return {
          isValid: false,
          message: "Password must be at least 6 characters",
        };
      }
      if (!/(?=.*[a-z])/.test(value)) {
        return {
          isValid: false,
          message: "Password must contain at least one lowercase letter",
        };
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return {
          isValid: false,
          message: "Password must contain at least one uppercase letter",
        };
      }
      if (!/(?=.*\d)/.test(value)) {
        return {
          isValid: false,
          message: "Password must contain at least one number",
        };
      }
      return { isValid: true };
    },
  });
};

export const validateName = (name: string): ValidationResult => {
  return validateField(name, {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: patterns.name,
  });
};

export const validatePhone = (phone: string): ValidationResult => {
  return validateField(phone, {
    required: false,
    pattern: patterns.phone,
    maxLength: 20,
  });
};

export const validateSearchQuery = (query: string): ValidationResult => {
  return validateField(query, {
    required: false,
    maxLength: 100,
    pattern: patterns.alphanumeric,
  });
};

export const validateFeedback = (feedback: string): ValidationResult => {
  return validateField(feedback, {
    required: true,
    minLength: 10,
    maxLength: 1000,
  });
};

export const validateDepartment = (department: string): ValidationResult => {
  return validateField(department, {
    required: false,
    minLength: 2,
    maxLength: 50,
    pattern: patterns.noSpecialChars,
  });
};

// Validate time format: "10:00 AM - 6:00 PM" or "10:00 AM"
export const validateTime = (time: string): ValidationResult => {
  if (!time || time.trim() === "") {
    return { isValid: true }; // Time is optional
  }

  const trimmedTime = time.trim();

  // Pattern for time range: "10:00 AM - 6:00 PM"
  const timeRangePattern =
    /^(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  // Pattern for single time: "10:00 AM"
  const singleTimePattern = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

  const rangeMatch = trimmedTime.match(timeRangePattern);
  const singleMatch = trimmedTime.match(singleTimePattern);

  if (rangeMatch) {
    // Validate time range format
    const startHour = parseInt(rangeMatch[1], 10);
    const startMinute = parseInt(rangeMatch[2], 10);
    const endHour = parseInt(rangeMatch[4], 10);
    const endMinute = parseInt(rangeMatch[5], 10);

    // Validate hour range (1-12)
    if (startHour < 1 || startHour > 12) {
      return { isValid: false, message: "Start hour must be between 1 and 12" };
    }
    if (endHour < 1 || endHour > 12) {
      return { isValid: false, message: "End hour must be between 1 and 12" };
    }

    // Validate minute range (0-59)
    if (startMinute < 0 || startMinute > 59) {
      return {
        isValid: false,
        message: "Start minute must be between 0 and 59",
      };
    }
    if (endMinute < 0 || endMinute > 59) {
      return { isValid: false, message: "End minute must be between 0 and 59" };
    }

    // Convert to 24-hour format for comparison
    let startHour24 = startHour;
    if (rangeMatch[3].toUpperCase() === "PM" && startHour !== 12) {
      startHour24 += 12;
    } else if (rangeMatch[3].toUpperCase() === "AM" && startHour === 12) {
      startHour24 = 0;
    }

    let endHour24 = endHour;
    if (rangeMatch[6].toUpperCase() === "PM" && endHour !== 12) {
      endHour24 += 12;
    } else if (rangeMatch[6].toUpperCase() === "AM" && endHour === 12) {
      endHour24 = 0;
    }

    // Calculate total minutes for comparison
    const startTotalMinutes = startHour24 * 60 + startMinute;
    const endTotalMinutes = endHour24 * 60 + endMinute;

    // Validate that end time is after start time
    if (endTotalMinutes <= startTotalMinutes) {
      return { isValid: false, message: "End time must be after start time" };
    }

    return { isValid: true };
  } else if (singleMatch) {
    // Validate single time format
    const hour = parseInt(singleMatch[1], 10);
    const minute = parseInt(singleMatch[2], 10);

    // Validate hour range (1-12)
    if (hour < 1 || hour > 12) {
      return { isValid: false, message: "Hour must be between 1 and 12" };
    }

    // Validate minute range (0-59)
    if (minute < 0 || minute > 59) {
      return { isValid: false, message: "Minute must be between 0 and 59" };
    }

    return { isValid: true };
  } else {
    return {
      isValid: false,
      message: 'Time format should be like "10:00 AM - 6:00 PM" or "10:00 AM"',
    };
  }
};

// Validate capacity (must be positive integer or empty)
export const validateCapacity = (capacity: string): ValidationResult => {
  if (!capacity || capacity.trim() === "") {
    return { isValid: true }; // Capacity is optional (no limit)
  }

  const trimmedCapacity = capacity.trim();
  const numValue = parseInt(trimmedCapacity, 10);

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return { isValid: false, message: "Capacity must be a valid number" };
  }

  // Check if it's a positive integer
  if (numValue < 1) {
    return {
      isValid: false,
      message: "Capacity must be a positive number (at least 1)",
    };
  }

  // Check if it's an integer (no decimals)
  if (parseFloat(trimmedCapacity) !== numValue) {
    return {
      isValid: false,
      message: "Capacity must be a whole number (no decimals)",
    };
  }

  return { isValid: true };
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
      errors[fieldName] = result.message || "Invalid input";
      isValid = false;
    }
  }

  return { isValid, errors };
};
