
export interface Button {
  label: string;
  type: 'button' | 'submit' | 'reset';
  disabled: boolean;
  className?: string;
  icon?: 'edit' | 'delete';
}