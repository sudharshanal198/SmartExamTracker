import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { BookOpen, CheckCircle2, TrendingUp, AlertCircle, Lightbulb, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { subjects, getSubjects, isLoading } = useData();
  const { user } = useAuth();

  useEffect(() => {
    getSubjects();
  }, [getSubjects]);

  const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);
  const completedTopics = subjects.reduce((sum, s) => sum + s.topics.filter(t => t.isCompleted).length, 0);
  const readiness = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  // Recommendation Logic
  let recommendedSubject = null;
  const incompleteSubjects = subjects.filter(s => {
    const isFullyComplete = s.topics.length > 0 && s.topics.every(t => t.isCompleted);
    return !isFullyComplete;
  });

  if (incompleteSubjects.length > 0) {
    incompleteSubjects.sort((a, b) => {
      // 1. Sort by Priority
      const priorityWeights: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const priorityDiff = priorityWeights[b.priority] - priorityWeights[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // 2. Sort by Exam Date (closer first)
      return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
    });
    recommendedSubject = incompleteSubjects[0];
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-wide">Dashboard</h1>
          <p className="mt-1 text-primary/70">Overview of your exam preparation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-primary/10 flex flex-col items-center justify-center text-center">
          <div className="relative inline-flex items-center justify-center mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                className="text-primary/10"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
              <circle
                className="text-primary"
                strokeWidth="12"
                strokeDasharray={351.8}
                strokeDashoffset={351.8 - (351.8 * readiness) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <span className="absolute text-2xl font-black text-primary">{readiness}%</span>
          </div>
          <h3 className="text-lg font-bold uppercase tracking-wide mb-2">Overall Readiness</h3>
          
          <div className={`mt-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border w-full ${
            readiness >= 80 ? 'bg-green-50 text-green-800 border-green-200' :
            readiness >= 50 ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
            'bg-red-50 text-red-800 border-red-200'
          }`}>
            {(() => {
              if (readiness >= 80) return "🔥 You're exam-ready. Revise key topics.";
              if (readiness >= 50) return "⚡ Focus on weak areas now.";
              return "🚨 High priority: Start studying immediately.";
            })()}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-3xl shadow-sm border border-primary/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wide text-primary/70">Total Subjects</h3>
            </div>
            <p className="text-4xl font-black">{subjects.length}</p>
          </div>
          
          <div className="bg-card p-6 rounded-3xl shadow-sm border border-primary/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wide text-primary/70">Completed</h3>
            </div>
            <p className="text-4xl font-black">{completedTopics} / {totalTopics}</p>
          </div>

          <div className="bg-card p-6 rounded-3xl shadow-sm border border-primary/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wide text-primary/70">Current Streak</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-orange-500">{user?.streak || 0}</p>
              <span className="text-sm font-bold text-primary/60 uppercase">Days</span>
            </div>
          </div>
        </div>
      </div>

      {recommendedSubject && (
        <div className="mb-8 bg-blue-50 border border-blue-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-bl-full pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 z-10 relative">
            <div className="bg-blue-100 p-3 rounded-2xl shrink-0">
              <Lightbulb className="w-8 h-8 text-blue-700" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-lg font-black text-blue-900 uppercase tracking-wide mb-1">Recommended Next Step</h2>
              <p className="text-blue-800 font-medium mb-3">
                Based on your priorities and upcoming exams, we suggest you study <strong className="text-blue-900 border-b-2 border-blue-300">{recommendedSubject.name}</strong> next.
                It has a {recommendedSubject.priority} priority and the exam is on {new Date(recommendedSubject.examDate).toLocaleDateString()}.
              </p>
              <Link
                to={`/subjects/${recommendedSubject._id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm uppercase tracking-wider"
              >
                Study Now
              </Link>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Subjects Summary</h2>
      
      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-3xl border border-primary/10 border-dashed">
          <BookOpen className="mx-auto h-12 w-12 text-primary/40 mb-3" />
          <h3 className="text-lg font-bold text-primary mb-1">No subjects yet</h3>
          <p className="text-primary/70 mb-4">Get started by adding your first subject</p>
          <Link
            to="/subjects"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-background bg-primary hover:bg-accent transition-colors"
          >
            Add Subject
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => {
            const subjTopics = subject.topics.length;
            const subjCompleted = subject.topics.filter(t => t.isCompleted).length;
            const subjReadiness = subjTopics === 0 ? 0 : Math.round((subjCompleted / subjTopics) * 100);
            
            return (
              <Link 
                key={subject._id} 
                to={`/subjects/${subject._id}`}
                className="bg-card p-6 rounded-3xl shadow-sm border border-primary/10 hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold group-hover:underline decoration-2 underline-offset-4">{subject.name}</h3>
                  <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                    subject.priority === 'High' ? 'bg-red-100 text-red-800' : 
                    subject.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {subject.priority}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary/70 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> Progress</span>
                    <span className="font-bold">{subjReadiness}%</span>
                  </div>
                  
                  <div className="w-full bg-primary/10 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${subjReadiness}%` }}
                    ></div>
                  </div>
                  
                  <div className="pt-2 flex justify-between text-xs text-primary/70">
                    <span className="flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Exam: {new Date(subject.examDate).toLocaleDateString()}</span>
                    <span>{subjCompleted}/{subjTopics} topics</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
