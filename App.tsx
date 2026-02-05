
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutDashboard, 
  User, 
  LogOut, 
  FileUp, 
  Users, 
  Loader2,
  Menu,
  AlertTriangle
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { Profile, UserRole } from './types';

// Components
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LessonDetail from './components/LessonDetail';
import QuizView from './components/QuizView';
import Gradebook from './components/Gradebook';
import ActivityUpload from './components/ActivityUpload';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(session);
        if (session) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        setInitError('Failed to connect to the server. Please check your connection or configuration.');
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('fetchProfile unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium animate-pulse">Initializing Lumina LMS...</p>
      </div>
    );
  }

  if (initError && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-6">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex bg-slate-50">
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30 transition-transform duration-300 transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
        `}>
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                L
              </div>
              <h1 className="text-xl font-bold text-indigo-600">Lumina</h1>
            </div>

            <nav className="flex-1 space-y-2">
              <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <NavLink to="/lessons" icon={<BookOpen size={20} />} label="Lessons" />
              {profile?.role === UserRole.TEACHER && (
                <NavLink to="/gradebook" icon={<Users size={20} />} label="Gradebook" />
              )}
              <NavLink to="/activities" icon={<FileUp size={20} />} label="Activities" />
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 px-2 mb-4 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{profile?.full_name || 'Loading...'}</p>
                  <p className="text-xs text-slate-400 truncate">{profile?.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 md:hidden shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold text-lg text-indigo-600">Lumina</span>
          </header>

          <div className="p-4 md:p-8 flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard profile={profile} />} />
              <Route path="/lessons" element={<Dashboard profile={profile} />} />
              <Route path="/lessons/:id" element={<LessonDetail profile={profile} />} />
              <Route path="/quiz/:quizId" element={<QuizView profile={profile} />} />
              <Route path="/activities" element={<ActivityUpload profile={profile} />} />
              {profile?.role === UserRole.TEACHER && (
                <Route path="/gradebook" element={<Gradebook />} />
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const isActive = window.location.hash === `#${to}` || (to === '/' && window.location.hash === '#/');
  return (
    <Link 
      to={to} 
      className={`
        flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all
        ${isActive 
          ? 'bg-indigo-50 text-indigo-600' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
      `}
    >
      {icon}
      {label}
    </Link>
  );
};

export default App;
