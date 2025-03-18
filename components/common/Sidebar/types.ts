import { ReactNode } from 'react';

export interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  isActive?: boolean;
  isSecondary?: boolean; 
}