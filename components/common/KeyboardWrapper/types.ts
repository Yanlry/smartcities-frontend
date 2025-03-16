import { ReactNode } from 'react';

export interface KeyboardWrapperProps {
  children: ReactNode;
  behavior?: 'padding' | 'height' | 'position';
  enabled?: boolean;
  keyboardVerticalOffset?: number;
}