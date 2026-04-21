import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Lightbulb, Trophy, AlertTriangle, Info, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
  const { subjects, getSubjects, isLoading } = useData();

  useEffect(() => {
    getSubjects();
  }, [getSubjects]);

  if (isLoading && subjects.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  const chartData = subjects.map(s => {
    const ts = s.topics.length;
    const cs = s.topics.filter(t => t.isCompleted).length;
    return {
      name: s.name,
      completion: ts === 0 ? 0 : Math.round((cs / ts) * 100)
    };
  });
  const insights = [];
  if (subjects.length === 0) {
    insights.push({
      type: 'info',
      icon: <Info className="w-6 h-6 text-blue-600" />,
      title: 'Getting Started',
      message: 'You haven\'t added any subjects yet. Analytics will appear here once you start tracking your studies.'
    });
  } else {
    const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);
    const completedTopics = subjects.reduce((sum, s) => sum + s.topics.filter(t => t.isCompleted).length, 0);
    if (totalTopics > 0) {
      const overallPercent = Math.round((completedTopics / totalTopics) * 100);
      if (overallPercent === 100) {
        insights.push({
          type: 'success',
          icon: <Trophy className="w-6 h-6 text-green-600" />,
          title: 'Outstanding!',
          message: 'You have completed 100% of all topics. You are fully ready for your exams.'
        });
      } else if (overallPercent >= 75) {
        insights.push({
          type: 'success',
          icon: <Trophy className="w-6 h-6 text-green-600" />,
          title: 'Great Progress',
          message: `You have completed ${completedTopics} out of ${totalTopics} topics (${overallPercent}%). Keep up the good work!`
        });
      } else {
        insights.push({
          type: 'info',
          icon: <Lightbulb className="w-6 h-6 text-blue-600" />,
          title: 'Steady Pace',
          message: `You've finished ${completedTopics} of ${totalTopics} topics. You have ${totalTopics - completedTopics} topics remaining across all subjects.`
        });
      }
    } else {
      insights.push({
        type: 'info',
        icon: <Info className="w-6 h-6 text-blue-600" />,
        title: 'Add Topics',
        message: 'Your subjects don\'t have any topics yet. Add topics to get readiness calculations.'
      });
    }
    const highPrioritySubjects = subjects.filter(s => s.priority === 'High');
    highPrioritySubjects.forEach(subject => {
      const ts = subject.topics.length;
      if (ts > 0) {
        const cs = subject.topics.filter(t => t.isCompleted).length;
        const percent = Math.round((cs / ts) * 100);
        
        if (percent < 50) {
          insights.push({
            type: 'warning',
            icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
            title: 'Action Required',
            message: `Focus on '${subject.name}'. It has High priority but only ${percent}% completion (${cs}/${ts} topics).`
          });
        } else if (percent === 100) {
          insights.push({
            type: 'success',
            icon: <Trophy className="w-6 h-6 text-green-600" />,
            title: 'High Priority Mastered',
            message: `Excellent! You've fully completed the High priority subject '${subject.name}'.`
          });
        }
      } else {
        insights.push({
          type: 'warning',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          title: 'Missing Topics',
          message: `'${subject.name}' is marked High priority but has no topics. Add topics ASAP to start tracking.`
        });
      }
    });
    const upcoming = [...subjects]
      .filter(s => new Date(s.examDate) >= new Date())
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
      .slice(0, 1);

    if (upcoming.length > 0) {
      const subj = upcoming[0];
      const days = Math.ceil((new Date(subj.examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      
      const ts = subj.topics.length;
      const cs = subj.topics.filter(t => t.isCompleted).length;
      const percent = ts === 0 ? 0 : Math.round((cs / ts) * 100);

      insights.push({
        type: 'info',
        icon: <Calendar className="w-6 h-6 text-blue-600" />,
        title: 'Next Exam',
        message: `'${subj.name}' is your next exam in ${days} days. Your current readiness is ${percent}%.`
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-wide">Analytics</h1>
          <p className="mt-1 text-primary/70">Smart insights based on your progress</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div 
            key={idx} 
            className={`p-6 rounded-3xl border flex items-start gap-4 ${
              insight.type === 'success' ? 'bg-green-50 border-green-200' :
              insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className={`p-3 rounded-2xl ${
              insight.type === 'success' ? 'bg-green-100' :
              insight.type === 'warning' ? 'bg-amber-100' :
              'bg-blue-100'
            }`}>
              {insight.icon}
            </div>
            <div>
              <h3 className={`text-lg font-bold uppercase tracking-wide mb-1 ${
                insight.type === 'success' ? 'text-green-900' :
                insight.type === 'warning' ? 'text-amber-900' :
                'text-blue-900'
              }`}>{insight.title}</h3>
              <p className={`font-medium ${
                insight.type === 'success' ? 'text-green-800' :
                insight.type === 'warning' ? 'text-amber-800' :
                'text-blue-800'
              }`}>{insight.message}</p>
              
              {insight.title === 'Missing Topics' && (
                <Link to="/subjects" className="inline-block mt-3 text-sm font-bold underline uppercase tracking-wider text-amber-900 hover:text-amber-700">
                  Manage Subjects
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {subjects.length > 0 && (
        <div className="mt-8 bg-card p-6 border border-primary/10 rounded-3xl shadow-sm">
          <h2 className="text-xl font-bold mb-6 uppercase tracking-wide text-primary">Subject Completion Range</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#121212" tick={{ fill: '#121212' }} />
                <YAxis stroke="#121212" tick={{ fill: '#121212' }} domain={[0, 100]} tickFormatter={(val: any) => `${val}%`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(18, 18, 18, 0.05)' }}
                  contentStyle={{ backgroundColor: '#f9f5eb', borderRadius: '0.75rem', border: '1px solid rgba(18, 18, 18, 0.1)' }}
                  formatter={(value: any) => [`${value}%`, 'Completion']}
                />
                <Bar dataKey="completion" fill="#121212" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
