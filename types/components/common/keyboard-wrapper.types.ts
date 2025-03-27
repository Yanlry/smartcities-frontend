import { ReactNode } from 'react';

/**
 * Props pour le composant KeyboardWrapper
 */
export interface KeyboardWrapperProps {
  /** Contenu enfant à envelopper */
  children: ReactNode;
  /** Comportement du wrapper lors de l'apparition du clavier */
  behavior?: 'padding' | 'height' | 'position';
  /** Si le comportement d'adaptation au clavier est activé */
  enabled?: boolean;
  /** Décalage vertical par rapport au clavier */
  keyboardVerticalOffset?: number;
}