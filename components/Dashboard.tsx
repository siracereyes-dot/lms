
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson, Quiz, Profile, UserRole } from '../types';
// Added ClipboardCheck to fixed the "Cannot find name 'ClipboardCheck'" error
import { BookOpen, FileText, ChevronRight, Plus, Clock, Search, ClipboardCheck } from 'lucide-react';

interface DashboardProps {
  profile: Profile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: quizzesData } = await supabase
      .from('quizzes')
      .select('*');

    if (lessonsData) setLessons(lessonsData);
    if (quizzesData) setQuizzes(quizzesData);
    setLoading(false);
  };

  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile?.full_name}</h1>
          <p className="text-slate-500">Track your progress and pick up where you left off.</p>
        </div>
        
        {profile?.role === UserRole.TEACHER && (
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
            <Plus size={18} />
            <span>Create New Content</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Lessons" value={lessons.length.toString()} icon={<BookOpen size={20} className="text-blue-600" />} />
        <StatCard label="Completed" value="4" icon={<Clock size={20} className="text-green-600" />} />
        <StatCard label="Quizzes Available" value={quizzes.length.toString()} icon={<FileText size={20} className="text-orange-600" />} />
        <StatCard label="Average Score" value="85%" icon={<FileText size={20} className="text-purple-600" />} />
      </div>

      {/* Search and Content */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={20} className="text-indigo-600" />
              Recent Lessons
            </h3>
            {filteredLessons.length > 0 ? (
              filteredLessons.map(lesson => (
                <Link 
                  key={lesson.id}
                  to={`/lessons/${lesson.id}`}
                  className="block p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Added {new Date(lesson.created_at).toLocaleDateString()}
                        </span>
                        {lesson.due_date && (
                          <span className="text-red-400 font-medium">
                            Due {new Date(lesson.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-10 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400">No lessons found matching your search.</p>
              </div>
            )}
          </div>

          {/* Quizzes Sidebar */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText size={20} className="text-orange-600" />
              Available Quizzes
            </h3>
            <div className="space-y-3">
              {quizzes.map(quiz => (
                <Link 
                  key={quiz.id}
                  to={`/quiz/${quiz.id}`}
                  className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:bg-orange-50/50 hover:border-orange-100 transition-all"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                    <ClipboardCheck size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{quiz.title}</p>
                    <p className="text-xs text-slate-400">{quiz.questions_json.length} Questions</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </Link>
              ))}
              {quizzes.length === 0 && (
                <p className="text-sm text-slate-400 italic">No quizzes posted yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-slate-50 rounded-lg">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

export default Dashboard;
