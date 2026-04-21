import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Subjects: React.FC = () => {
  const { subjects, getSubjects, addSubject, deleteSubject, isLoading } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<{name: string, examDate: string, priority: 'High'|'Medium'|'Low'}>({
    name: '',
    examDate: '',
    priority: 'Medium'
  });

  useEffect(() => {
    getSubjects();
  }, [getSubjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSubject(formData);
    setFormData({ name: '', examDate: '', priority: 'Medium' });
    setIsAdding(false);
  };

  if (isLoading && subjects.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-wide">Subjects</h1>
          <p className="mt-1 text-primary/70">Manage your exam subjects</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-background bg-primary hover:bg-accent transition-colors shadow-sm uppercase tracking-wider h-max w-max"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-primary/10 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold uppercase tracking-wide mb-4">New Subject</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1 uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-primary/20 bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary mb-1 uppercase tracking-wide">Exam Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-primary/20 bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.examDate}
                  onChange={e => setFormData({...formData, examDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary mb-1 uppercase tracking-wide">Priority</label>
                <select
                  className="w-full px-4 py-2 border border-primary/20 bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value as 'High' | 'Medium' | 'Low'})}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-bold rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-bold rounded-xl text-background bg-primary hover:bg-accent transition-colors shadow-sm uppercase tracking-wider"
              >
                Save Subject
              </button>
            </div>
          </form>
        </div>
      )}

      {subjects.length === 0 && !isAdding ? (
        <div className="text-center py-16 bg-card rounded-3xl border border-primary/10 border-dashed">
          <p className="text-primary/70">No subjects found. Click 'Add Subject' to begin.</p>
        </div>
      ) : (
        <div className="bg-card rounded-3xl shadow-sm border border-primary/10 overflow-hidden">
          <div className="divide-y divide-primary/10">
            {subjects.map((subject) => (
              <div key={subject._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-primary/5 transition-colors">
                <div className="flex-1">
                  <Link to={`/subjects/${subject._id}`} className="block group">
                    <h3 className="text-xl font-bold group-hover:underline decoration-2 underline-offset-4 mb-2">{subject.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-primary/70">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5"/> {new Date(subject.examDate).toLocaleDateString()}</span>
                      <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-1.5"/> {subject.topics.length} topics</span>
                      <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md ${
                        subject.priority === 'High' ? 'bg-red-100 text-red-800' : 
                        subject.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {subject.priority}
                      </span>
                    </div>
                  </Link>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link 
                    to={`/subjects/${subject._id}`}
                    className="px-4 py-2 text-sm font-bold rounded-xl bg-primary text-background hover:bg-accent transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      if(window.confirm('Are you sure you want to delete this subject?')) {
                        deleteSubject(subject._id);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
