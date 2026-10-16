export interface CustomInput {
  type: 'text' | 'email' | 'number' | 'password' | 'select' | 'search';
  label: string;
  required: boolean;
  name: string;
  value?: string | number;
  disable?: boolean;
  placeholder?: string;
  options?: string[];
  autocomplete?: string;
  hint?: string;
  hideLabel?: boolean;
  compact?: boolean;
  showValidState?: boolean;
  errorMessages?: Record<string, string>;
}
