import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.ts';
import { Lesson, Profile } from '../types.ts';
import { 
  ArrowLeft, 
  CheckCircle, 
  Loader2, 
  MessageCircle, 
  Sparkles, 
  Send,
  User
} from 'lucide-react';
import { getAIExplanation } from '../services/geminiService.ts';

interface LessonDetailProps {
  profile: Profile | null;
}

const LessonDetail: React.FC<LessonDetailProps> = ({ profile }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);

  useEffect(() => {
    fetchLesson();
    checkProgress();
  }, [id]);

  const fetchLesson = async () => {
    const { data } = await supabase.from('lessons').select('*').eq('id', id).single();
    if (data) setLesson(data);
    setLoading(false);
  };

  const checkProgress = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', profile.id)
      .eq('lesson_id', id)
      .single();
    if (data) setIsCompleted(true);
  };

  const markComplete = async () => {
    if (!profile || isCompleted) return;
    await supabase
      .from('user_progress')
      .insert([{ user_id: profile.id, lesson_id: id }]);
    setIsCompleted(true);
  };

  const askAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || !lesson) return;

    const userText = aiQuestion;
    setAiQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setAiLoading(true);

    const response = await getAIExplanation(lesson.content, userText);
    setChatHistory(prev => [...prev, { role: 'ai', text: response || 'No response' }]);
    setAiLoading(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  if (!lesson) return <div>Lesson not found.</div>;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lesson Content */}
      <div className="lg:col-span-2 space-y-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium mb-4"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-slate-900">{lesson.title}</h1>
              <button
                onClick={markComplete}
                disabled={isCompleted}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all
                  ${isCompleted 
                    ? 'bg-green-50 text-green-600 cursor-default' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}
                `}
              >
                <CheckCircle size={18} />
                {isCompleted ? 'Completed' : 'Mark as Done'}
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 font-medium">Core Concept</span>
              <span>15 min read</span>
              <span>Updated {new Date(lesson.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="p-8 prose prose-indigo max-w-none">
            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {lesson.content}
            </div>
          </div>
        </div>
      </div>

      {/* AI Tutor Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl flex flex-col sticky top-8 h-[calc(100vh-8rem)]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <Sparkles size={18} />
              </div>
              <h3 className="font-bold text-slate-900">AI Study Assistant</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <MessageCircle size={24} />
                </div>
                <p className="text-sm text-slate-500">
                  Ask any questions about "{lesson.title}". I'm here to help you learn!
                </p>
              </div>
            ) : (
              chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-3 rounded-2xl text-sm
                    ${chat.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'}
                  `}>
                    {chat.text}
                  </div>
                </div>
              ))
            )}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={askAI} className="p-4 border-t border-slate-100">
            <div className="relative">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
              <button 
                type="submit"
                disabled={aiLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;