import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, Plus, Check, Trash2, Calendar, AlertCircle, TrendingUp, Target, AlertTriangle } from 'lucide-react';

const SubjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subjects, getSubjects, addTopic, toggleTopic, deleteTopic, deleteSubject, isLoading } = useData();
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicUnit, setNewTopicUnit] = useState('');
  
  useEffect(() => {
    // If subjects are not loaded, fetch them
    if (subjects.length === 0) {
      getSubjects();
    }
  }, [subjects.length, getSubjects]);

  const subject = subjects.find(s => s._id === id);

  if (isLoading && !subject) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-black mb-4 uppercase tracking-wide text-primary">Subject Not Found</h2>
        <Link to="/subjects" className="text-primary underline hover:text-accent font-bold">Return to Subjects</Link>
      </div>
    );
  }

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    
    await addTopic(subject._id, newTopicName, newTopicUnit.trim() || 'General');
    setNewTopicName('');
    setNewTopicUnit('');
  };

  const handleDeleteSubject = async () => {
    if (window.confirm('Are you sure you want to delete this subject entirely?')) {
      await deleteSubject(subject._id);
      navigate('/subjects');
    }
  };

  const totalTopics = subject.topics.length;
  const completedTopics = subject.topics.filter(t => t.isCompleted).length;
  const remainingTopics = totalTopics - completedTopics;
  const readiness = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  // Smart Planner Calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(subject.examDate);
  examDate.setHours(0, 0, 0, 0);
  const daysLeft = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const topicsPerDay = Math.ceil(remainingTopics / daysLeft);

  // Readiness Prediction Calculations
  let currentRate = 0;
  if (completedTopics > 0) {
    const createdAtDate = subject.createdAt ? new Date(subject.createdAt) : new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 day fallback
    createdAtDate.setHours(0, 0, 0, 0);
    const daysSinceCreation = Math.max(1, Math.ceil((today.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24)));
    currentRate = completedTopics / daysSinceCreation;
  }
  const predictedAdditionalTopics = Math.floor(currentRate * daysLeft);
  const totalPredictedTopics = Math.min(totalTopics, completedTopics + predictedAdditionalTopics);
  const futureReadiness = totalTopics === 0 ? 0 : Math.round((totalPredictedTopics / totalTopics) * 100);

  let predictionMessage = "";
  let predictionColor = "";
  if (remainingTopics === 0) {
    predictionMessage = "Syllabus Completed!";
    predictionColor = "text-green-600 bg-green-50 border-green-200";
  } else if (futureReadiness >= 100) {
    predictionMessage = "On track to finish before exam";
    predictionColor = "text-green-600 bg-green-50 border-green-200";
  } else if (futureReadiness >= 80) {
    predictionMessage = `At current pace, reaching ${futureReadiness}% before exam`;
    predictionColor = "text-yellow-600 bg-yellow-50 border-yellow-200";
  } else {
    predictionMessage = `Warning: Will reach only ${futureReadiness}% readiness`;
    predictionColor = "text-red-600 bg-red-50 border-red-200";
  }

  // Weak Area Detector Calculations
  const unitsData: Record<string, { total: number; completed: number; }> = {};
  subject.topics.forEach(t => {
    const unit = t.unit || 'General';
    if (!unitsData[unit]) unitsData[unit] = { total: 0, completed: 0 };
    unitsData[unit].total += 1;
    if (t.isCompleted) unitsData[unit].completed += 1;
  });

  let weakestUnit = null;
  let lowestCompletion = 101; 
  Object.entries(unitsData).forEach(([unit, data]) => {
    if (data.total > 0) {
      const completion = (data.completed / data.total) * 100;
      if (completion < lowestCompletion) {
        lowestCompletion = completion;
        weakestUnit = unit;
      }
    }
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/subjects" className="inline-flex items-center text-sm font-bold text-primary/70 hover:text-primary transition-colors uppercase tracking-wider">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Subjects
        </Link>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-3xl shadow-sm border border-primary/10 mb-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 h-2 bg-primary/10 w-full">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${readiness}%` }}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl lg:text-4xl font-black text-primary uppercase tracking-wide">{subject.name}</h1>
              <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                subject.priority === 'High' ? 'bg-red-100 text-red-800' : 
                subject.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {subject.priority}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-primary/70 text-sm mt-4">
              <span className="flex items-center font-medium"><Calendar className="w-4 h-4 mr-1.5" /> Exam: {examDate.toLocaleDateString()}</span>
              <span className="flex items-center font-medium px-2 py-0.5 rounded bg-primary/5 text-primary">
                {daysLeft} days left
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 min-w-[140px]">
            <div className="text-right">
              <div className="text-sm font-bold uppercase tracking-wider text-primary/70 mb-1">Current Readiness</div>
              <div className="text-4xl font-black text-primary">{readiness}%</div>
              <div className="text-xs font-medium text-primary/60 mt-1">{completedTopics} of {totalTopics} completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* SMART EXAM TRACKER INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Smart Study Planner */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-800">
              <Target className="w-5 h-5"/>
              <h3 className="font-black uppercase tracking-wide">Daily Target</h3>
            </div>
            <p className="text-blue-900 font-medium text-sm">To finish on time, complete this many topics daily.</p>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-blue-600">{remainingTopics === 0 ? 0 : topicsPerDay}</span>
            <span className="text-blue-800 font-bold ml-2">topics/day</span>
          </div>
        </div>

        {/* Readiness Prediction Engine */}
        <div className={`border p-6 rounded-3xl shadow-sm flex flex-col justify-between ${predictionColor}`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5"/>
              <h3 className="font-black uppercase tracking-wide">Prediction</h3>
            </div>
            <p className="font-medium text-sm opacity-90">{predictionMessage}</p>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black">{futureReadiness}%</span>
            <span className="font-bold ml-2 opacity-80">expected</span>
          </div>
        </div>

        {/* Weak Area Detector */}
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-orange-800">
              <AlertTriangle className="w-5 h-5"/>
              <h3 className="font-black uppercase tracking-wide">Weak Area</h3>
            </div>
            {weakestUnit ? (
              <p className="font-medium text-sm text-orange-900">
                Focus more on <strong>{weakestUnit}</strong>.
              </p>
            ) : (
              <p className="font-medium text-sm text-orange-800">No weak areas detected yet.</p>
            )}
          </div>
          {weakestUnit && (
            <div className="mt-4">
              <span className="text-3xl font-black text-orange-600">{Math.round(lowestCompletion)}%</span>
              <span className="text-orange-800 font-bold ml-2">completed</span>
            </div>
          )}
        </div>

      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wide">Topics</h2>
          <button 
            onClick={handleDeleteSubject}
            className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors uppercase tracking-wider flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete Subject
          </button>
        </div>

        <form onSubmit={handleAddTopic} className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Unit (e.g. Unit 3)"
            className="w-full sm:w-1/3 px-5 py-3 border border-primary/20 bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            value={newTopicUnit}
            onChange={(e) => setNewTopicUnit(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Add a new topic (e.g. Database Normalization)"
            className="flex-1 px-5 py-3 border border-primary/20 bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-3 border border-transparent font-bold rounded-xl text-background bg-primary hover:bg-accent transition-colors shadow-sm uppercase tracking-wider flex justify-center items-center"
          >
            <Plus className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Add</span>
          </button>
        </form>

        {subject.topics.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-3xl border border-primary/10 border-dashed">
            <AlertCircle className="mx-auto h-10 w-10 text-primary/30 mb-3" />
            <p className="text-primary/70 font-medium">No topics added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subject.topics.map(topic => (
              <div 
                key={topic._id} 
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                  topic.isCompleted 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-card border-primary/10 hover:border-primary/30'
                }`}
              >
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => toggleTopic(subject._id, topic._id)}
                >
                  <button 
                    className={`shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors border ${
                      topic.isCompleted 
                        ? 'bg-primary border-primary text-background' 
                        : 'bg-background border-primary/40 hover:border-primary text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-lg font-medium transition-all ${
                      topic.isCompleted ? 'line-through text-primary/50' : 'text-primary'
                    }`}>
                      {topic.name}
                    </span>
                    {(topic.unit && topic.unit !== 'General') && (
                      <span className="text-xs font-bold text-primary/50 uppercase tracking-widest mt-1">
                        {topic.unit}
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTopic(subject._id, topic._id);
                  }}
                  className="p-2 text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                  aria-label="Delete topic"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetail;
