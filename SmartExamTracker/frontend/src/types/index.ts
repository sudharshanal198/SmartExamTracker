export interface User {
  id: string;
  email: string;
  streak?: number;
}

export interface Topic {
  _id: string;
  name: string;
  isCompleted: boolean;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  _id: string;
  name: string;
  examDate: string;
  priority: 'High' | 'Medium' | 'Low';
  user: string;
  topics: Topic[];
  createdAt?: string;
  updatedAt?: string;
}
