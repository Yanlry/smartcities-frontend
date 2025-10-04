// src/components/home/CategoryReportsSection/index.ts
export { default } from './CategorySelectorSection';
export type { 
  CategoryReportsSectionProps,
  SectionHeaderProps,
  CategoryItemProps,
  InfoPanelProps,
  UseCategorySelectorOptions,
  UseCategorySelectorResult
} from '../../../types/features/reports/category.types';
export { useCategorySelector } from './useCategorySelector';