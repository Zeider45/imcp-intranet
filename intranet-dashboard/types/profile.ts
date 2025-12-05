export interface Profile {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}
