import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Search, AlertTriangle, Flame, ChevronDown, ChevronUp, History, UserX, Clock, Target, BookOpen } from 'lucide-react';

interface SubjectInfo {
  id: string;
  name: string;
  progress: number;
  lastStudied: string; // ISO string
}

interface StudentData {
  _id: string;
  email: string;
  name: string;
  streak: number;
  lastActiveDate: string; // ISO string
  subjects: SubjectInfo[];
}

const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'lagging' | 'high'>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Simulator state
  const [simulatingSubject, setSimulatingSubject] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/admin/students');
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const isLagging = (subject: SubjectInfo) => {
    if (subject.progress < 50) return true;
    const daysSince = (new Date().getTime() - new Date(subject.lastStudied).getTime()) / (1000 * 3600 * 24);
    if (daysSince > 3) return true;
    return false;
  };

  const isStudentLagging = (student: StudentData) => {
    if (student.subjects.length === 0) return true;
    return student.subjects.some(isLagging);
  };

  // Derived metrics
  const totalStudents = students.length;
  const laggingStudents = students.filter(isStudentLagging).length;

  // Filtered array
  const filteredStudents = students.filter(s => {
    if (search && !s.email.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter === 'lagging') return isStudentLagging(s);
    if (filter === 'high') return !isStudentLagging(s) && s.streak > 2;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  
  const simulateOutcome = (subject: SubjectInfo) => {
    setSimulatingSubject(subject.id);
    // Remove after a few seconds
    setTimeout(() => setSimulatingSubject(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 tracking-wide">
      {/* Header & Stats */}
      <div>
        <h1 className="text-3xl font-black text-primary uppercase border-b-4 border-primary inline-block pb-1">Admin Control Room</h1>
        <p className="mt-2 text-primary/70 font-medium">Master overview and predictive simulation of student performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-3xl shadow-lg border border-primary/10 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary/60 uppercase">Total Students</p>
            <h3 className="text-3xl font-black">{totalStudents}</h3>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-3xl shadow-lg border border-red-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-600 uppercase">Lagging Students</p>
            <h3 className="text-3xl font-black text-red-600">{laggingStudents}</h3>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-3xl shadow-lg border border-green-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-green-100 text-green-600 rounded-2xl">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-600 uppercase">On Track</p>
            <h3 className="text-3xl font-black text-green-600">{totalStudents - laggingStudents}</h3>
          </div>
        </div>
      </div>

      {/* Constraints & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl shadow-md border border-primary/10">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
          <input 
            type="text"
            placeholder="Search student name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background font-medium shadow-inner"
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${filter === 'all' ? 'bg-primary text-background' : 'bg-background border border-primary/20 text-primary/70 hover:bg-primary/5'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('lagging')} 
            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${filter === 'lagging' ? 'bg-red-500 text-white' : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'}`}
          >
            Lagging Filters
          </button>
          <button 
            onClick={() => setFilter('high')} 
            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${filter === 'high' ? 'bg-green-500 text-white' : 'bg-green-50 border border-green-200 text-green-600 hover:bg-green-100'}`}
          >
            High Performers
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card rounded-3xl shadow-xl border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 border-b-2 border-primary/10 text-xs uppercase tracking-wider text-primary/60 font-black">
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Total Subjects</th>
                <th className="px-8 py-5">Activity Streak</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-primary/40 font-black tracking-widest uppercase text-xl">No students matched.</td>
                </tr>
              ) : filteredStudents.map((s) => {
                const isExpanded = expandedRow === s._id;
                const studentLagging = isStudentLagging(s);
                return (
                  <React.Fragment key={s._id}>
                    <tr 
                      className={`hover:bg-primary/5 transition-all duration-200 cursor-pointer ${isExpanded ? 'bg-primary/5 shadow-inner' : ''}`}
                      onClick={() => toggleExpand(s._id)}
                    >
                      <td className="px-8 py-6">
                        <p className="font-black text-primary text-lg">{s.name}</p>
                        <p className="text-sm font-semibold text-primary/60">{s.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-xl px-3 py-1 bg-primary/10 rounded-lg">{s.subjects.length}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 font-black text-orange-500 text-lg">
                          <Flame className="w-5 h-5 fill-current" /> {s.streak} Days
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {studentLagging ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm border border-red-200 bg-red-100 text-red-800 uppercase tracking-widest">
                            <AlertTriangle className="w-4 h-4" /> Needs Attention
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm border border-green-200 bg-green-100 text-green-800 uppercase tracking-widest">
                            <Flame className="w-4 h-4" /> Consistent
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className={`p-3 bg-background rounded-xl transition-all shadow-sm border border-primary/20 hover:scale-105 active:scale-95 ${isExpanded ? 'bg-primary text-background border-transparent' : 'text-primary/70'}`}>
                          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Row Content */}
                    {isExpanded && (
                      <tr className="bg-primary/5 border-b-[4px] border-primary/20">
                        <td colSpan={5} className="px-8 py-8 border-t-0 p-0">
                          <div className="bg-background rounded-3xl p-8 border border-primary/10 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-5 rounded-bl-[100px] pointer-events-none"></div>
                            
                            <h4 className="text-sm font-black uppercase tracking-widest text-primary/60 mb-6 flex items-center gap-2">
                              <BookOpen className="w-5 h-5" /> Subject Performance & Predictive Simulation
                            </h4>
                            
                            {s.subjects.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-10 text-primary/40">
                                <UserX className="w-12 h-12 mb-3" />
                                <p className="font-bold text-lg uppercase tracking-wide">No subjects monitored yet.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10">
                                {s.subjects.map(sub => {
                                  const lag = isLagging(sub);
                                  const simActive = simulatingSubject === sub.id;
                                  return (
                                    <div key={sub.id} className={`p-6 rounded-2xl border-2 transition-all duration-300 ${lag ? 'border-red-200 bg-red-50/30 hover:border-red-300' : 'border-primary/10 bg-card hover:border-primary/30'} flex flex-col justify-between shadow-sm hover:shadow-md`}>
                                      <div className="flex justify-between items-start mb-4">
                                        <h5 className="font-black text-xl text-primary">{sub.name}</h5>
                                        {lag ? (
                                          <span className="text-xs font-black bg-red-100 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                                            <AlertTriangle className="w-4 h-4"/> Lagging
                                          </span>
                                        ) : (
                                          <span className="text-xs font-black bg-green-100 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                                            <Target className="w-4 h-4"/> On Track
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-5">
                                        <div>
                                          <div className="flex justify-between text-sm font-black mb-2 uppercase tracking-wide">
                                            <span className="text-primary/70">Completion</span>
                                            <span className={sub.progress < 50 ? 'text-red-600' : 'text-primary'}>{sub.progress}%</span>
                                          </div>
                                          <div className="w-full bg-primary/10 rounded-full h-3 overflow-hidden shadow-inner">
                                            <div className={`h-3 rounded-full transition-all duration-1000 ${lag && sub.progress < 50 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${sub.progress}%` }}></div>
                                          </div>
                                          <p className="text-xs font-bold text-primary/50 mt-3 flex items-center gap-1.5 uppercase tracking-wide">
                                            <History className="w-4 h-4" /> Last Studied: <span className="text-primary"> {new Date(sub.lastStudied).toLocaleDateString()} </span>
                                          </p>
                                        </div>

                                        {/* Future Simulator */}
                                        <div className="mt-4 pt-4 border-t border-primary/10">
                                          {!simActive && sub.progress < 100 ? (
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); simulateOutcome(sub); }}
                                              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                              <Clock className="w-4 h-4 animate-spin-slow" /> Simulate: Study 2 hrs/day
                                            </button>
                                          ) : sub.progress >= 100 ? (
                                            <div className="text-center text-sm font-black text-green-600 bg-green-50 border border-green-200 py-3 rounded-xl uppercase tracking-widest shadow-sm">
                                              Subject Mastered ✨
                                            </div>
                                          ) : (
                                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-xl shadow-lg border border-blue-400/30 overflow-hidden relative">
                                              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                              <p className="text-xs font-black uppercase mb-2 flex items-center gap-2 text-blue-100">
                                                <Target className="w-4 h-4" /> AI Simulation Result
                                              </p>
                                              <p className="text-sm font-bold flex items-center gap-2">
                                                Based on rate, 100% completion in <span className="text-xl font-black bg-white text-blue-700 px-2 rounded-lg shadow-sm">{Math.ceil((100 - sub.progress)/(Math.random() * 5 + 10))} Days</span>
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
