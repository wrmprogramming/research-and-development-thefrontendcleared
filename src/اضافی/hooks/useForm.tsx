// hooks/useForm.ts
import { useState, useCallback, ChangeEvent } from 'react';

export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  custom?: (value: any) => string | null;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Record<keyof T, ValidationRule>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isDirty, setIsDirty] = useState(false);

  const validateField = useCallback((name: keyof T, value: any): string | null => {
    const rules = validationRules?.[name];
    if (!rules) return null;

    if (rules.required && (!value || value === '')) {
      return 'این فیلد الزامی است';
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return 'فرمت وارد شده معتبر نیست';
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return `حداقل ${rules.minLength} کاراکتر وارد کنید`;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `حداکثر ${rules.maxLength} کاراکتر وارد کنید`;
    }

    if (rules.min && value !== undefined && value !== null && value < rules.min) {
      return `حداقل مقدار ${rules.min} است`;
    }

    if (rules.max && value !== undefined && value !== null && value > rules.max) {
      return `حداکثر مقدار ${rules.max} است`;
    }

    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error || undefined }));
  }, [validateField]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error || undefined }));
  }, [validateField, values]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const key in validationRules) {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    handleChange(name, value);
  }, [handleChange]);

  return {
    values,
    errors,
    touched,
    isDirty,
    handleChange,
    handleBlur,
    validateForm,
    reset,
    setFieldValue,
    setValues,
  };
}
//