import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.ts';
import { Quiz, Profile, QuizQuestion } from '../types.ts';
import { Loader2, ArrowLeft, CheckCircle, XCircle, Award, Lightbulb } from 'lucide-react';
import { generateQuizHints } from '../services/geminiService.ts';

interface QuizViewProps {
  profile: Profile | null;
}

const QuizView: React.FC<QuizViewProps> = ({ profile }) => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    const { data } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
    if (data) setQuiz(data);
    setLoading(false);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;
    
    const correct = quiz?.questions_json[currentStep].correct_answer;
    if (selectedAnswer === correct) {
      setScore(s => s + 1);
    }

    if (currentStep < (quiz?.questions_json.length || 0) - 1) {
      setCurrentStep(s => s + 1);
      setSelectedAnswer(null);
      setHint(null);
    } else {
      setShowResult(true);
    }
  };

  const getHint = async () => {
    if (!quiz) return;
    setHintLoading(true);
    const h = await generateQuizHints(quiz.questions_json[currentStep].question);
    setHint(h);
    setHintLoading(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  if (!quiz) return <div>Quiz not found.</div>;

  const currentQuestion = quiz.questions_json[currentStep];

  if (showResult) {
    const percentage = Math.round((score / quiz.questions_json.length) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-10">
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-xl">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
            <Award size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Completed!</h2>
          <p className="text-slate-500 mb-8">Great job on finishing the quiz for {quiz.title}.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <p className="text-sm text-slate-400 font-medium">Your Score</p>
              <p className="text-3xl font-bold text-indigo-600">{score} / {quiz.questions_json.length}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <p className="text-sm text-slate-400 font-medium">Percentage</p>
              <p className="text-3xl font-bold text-indigo-600">{percentage}%</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={18} />
          Exit Quiz
        </button>
        <div className="text-sm font-bold text-slate-400">
          Question {currentStep + 1} of {quiz.questions_json.length}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 md:p-12 space-y-8">
        <div className="space-y-4">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${((currentStep + 1) / quiz.questions_json.length) * 100}%` }}
            />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 leading-tight">
            {currentQuestion.question}
          </h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAnswer(idx)}
              className={`
                w-full p-5 text-left rounded-2xl border-2 transition-all flex items-center justify-between group
                ${selectedAnswer === idx 
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900' 
                  : 'border-slate-100 hover:border-indigo-200 text-slate-600 hover:bg-slate-50'}
              `}
            >
              <span className="font-medium">{option}</span>
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${selectedAnswer === idx ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200 group-hover:border-indigo-300'}
              `}>
                {selectedAnswer === idx && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>

        {hint ? (
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3 text-orange-800 text-sm animate-in fade-in slide-in-from-top-2">
            <Lightbulb size={20} className="shrink-0 text-orange-500" />
            <p><span className="font-bold">AI Hint:</span> {hint}</p>
          </div>
        ) : (
          <button 
            onClick={getHint}
            disabled={hintLoading}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            {hintLoading ? <Loader2 size={16} className="animate-spin" /> : <Lightbulb size={16} />}
            Need a hint? Ask AI
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
        >
          {currentStep === quiz.questions_json.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default QuizView;