export interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  views: number;
}
