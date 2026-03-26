import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Subject } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  subjects: Subject[];
  isLoading: boolean;
  getSubjects: () => Promise<void>;
  addSubject: (data: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTopic: (subjectId: string, name: string, unit?: string) => Promise<void>;
  toggleTopic: (subjectId: string, topicId: string) => Promise<void>;
  deleteTopic: (subjectId: string, topicId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  const getSubjects = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addSubject = async (data: Partial<Subject>) => {
    try {
      await api.post('/subjects', data);
      await getSubjects(); // refresh
    } catch (error) {
      console.error('Failed to add subject', error);
      throw error;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await api.delete(`/subjects/${id}`);
      await getSubjects();
    } catch (error) {
      console.error('Failed to delete subject', error);
      throw error;
    }
  };

  const addTopic = async (subjectId: string, name: string, unit?: string) => {
    try {
      const res = await api.post('/subjects/topic', { subjectId, name, unit });
      setSubjects(prev => prev.map(s => s._id === subjectId ? res.data : s));
    } catch (error) {
      console.error('Failed to add topic', error);
      throw error;
    }
  };

  const toggleTopic = async (subjectId: string, topicId: string) => {
    try {
      const res = await api.put('/subjects/topic/toggle', { subjectId, topicId });
      setSubjects(prev => prev.map(s => s._id === subjectId ? res.data : s));
    } catch (error) {
      console.error('Failed to toggle topic', error);
      throw error;
    }
  };

  const deleteTopic = async (subjectId: string, topicId: string) => {
    try {
      // Axios delete with body
      const res = await api.delete('/subjects/topic', { data: { subjectId, topicId } });
      setSubjects(prev => prev.map(s => s._id === subjectId ? res.data : s));
    } catch (error) {
      console.error('Failed to delete topic', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      subjects, isLoading, getSubjects, addSubject, deleteSubject,
      addTopic, toggleTopic, deleteTopic
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
