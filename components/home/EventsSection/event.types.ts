import { ReportPhoto } from '../ReportsSection/report.types';

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  photos?: ReportPhoto[];
}
  export interface FeaturedEvent {
    id: string;
    title: string;
    image: string;
  }