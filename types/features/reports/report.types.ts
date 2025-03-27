export interface Report {
    id: number;
    title: string;
    description?: string;
    type: string;
    status?: string;
    createdAt: string;
    updatedAt?: string;
    userId?: string;
    city: string;
    latitude: number;
    longitude: number;
    distance?: number;
    photos: ReportPhoto[];
    comments?: any[];
    votes?: any[];
    upVotes: number;
  downVotes: number;
  }
  
  export interface ReportPhoto {
    id: string;
    url: string;
    isProfile?: boolean;
  }
  
  export interface ReportCategory {
    name: string;
    label: string;
    icon: string;
    color: string;
  }