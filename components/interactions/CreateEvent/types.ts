// components/interactions/EventCreation/types.ts
import { ReactNode } from 'react';

export interface EventFormData {
  title: string;
  description: string;
  date: Date;
  location: LocationData;
  photos: PhotoItem[];
}

export interface LocationData {
  query: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface PhotoItem {
  uri: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}

export interface EventFormProps {
  title: string;
  description: string;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
}

export interface EventDatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export interface LocationSelectorProps {
  query: string;
  selectedLocation: LocationData['coordinates'];
  onLocationSelect: (location: LocationData) => void;
}

export interface AddressSuggestionModalProps {
  visible: boolean;
  suggestions: any[];
  onSelect: (item: any) => void;
  onClose: () => void;
}

export interface ProgressModalProps {
  visible: boolean;
  progress: number;
}

export interface SubmissionStep {
  label: string;
  progress: number;
}

export interface SubmissionResult {
  success: boolean;
  error?: string;
}