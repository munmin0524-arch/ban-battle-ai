import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import type { Quiz, QuizQuestion, QuizType } from '../types';
import {
  Brain, Plus, Trash2, Play, Clock, CheckCircle2, XCircle,
  Trophy, HelpCircle, Loader2, BarChart3,
} from 'lucide-react';

// ─── Teacher View ───────────────────────────────────────────────
const TeacherQuizView: React.FC = () => {
  const { addQuiz, updateQuiz, quizzes, classes } = useApp();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qType, setQType] = useState<QuizType>('ox');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState<string[]>(['O', 'X']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qTimeLimit, setQTimeLimit] = useState(15);

  useEffect(() => {
    if (qType === 'ox') { setQOptions(['O', 'X']); setQCorrect(0); }
    else { setQOptions(['', '', '', '']); setQCorrect(0); }
  }, [qType]);

  const handleAddQuestion = () => {
    if (!qText.trim()) return;
    if (qType === 'multiple' && qOptions.some((o) => !o.trim())) return;
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      type: qType,
      question: qText.trim(),
      options: [...qOptions],
      correctIndex: qCorrect,
      timeLimit: qTimeLimit,
    };
    setQuestions((prev) => [...prev, newQ]);
    setQText('');
    setQType('ox');
    setQTimeLimit(15);
  };

  const handleStartQuiz = () => {
    if (!title.trim() || questions.length === 0) return;
    const quiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: title.trim(),
      questions,
      classIds: classes.map((c) => c.id),
      createdBy: 'teacher-1',
      status: 'active',
    };
    addQuiz(quiz);
    setTitle('');
    setQuestions([]);
  };

  const handleStopQuiz = (quiz: Quiz) => {
    updateQuiz({ ...quiz, status: 'finished' });
  };

  const activeQuizzes = quizzes.filter((q) => q.status === 'active');

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {activeQuizzes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-500" /> 진행 중인 퀴즈
          </h3>
          {activeQuizzes.map((q) => (
            <div key={q.id} className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow">
              <div>
                <p className="font-semibold text-green-800">{q.title}</p>
                <p className="text-sm text-green-600">{q.questions.length}문제</p>
              </div>
              <button onClick={() => handleStopQuiz(q)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                퀴즈 종료
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Brain className="w-7 h-7 text-blue-500" /> 새 퀴즈 만들기
        </h2>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">퀴즈 제목</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 3단원 복습 퀴즈"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg" />
        </div>

        <div className="bg-blue-50 rounded-xl p-5 space-y-4 border border-blue-100">
          <h3 className="font-bold text-blue-700">문제 추가</h3>
          <div className="flex gap-3">
            {(['ox', 'multiple'] as QuizType[]).map((t) => (
              <button key={t} onClick={() => setQType(t)}
                className={`flex-1 py-2 rounded-xl font-semibold transition-colors ${qType === t ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-600 border border-gray-200'}`}>
                {t === 'ox' ? 'OX 퀴즈' : '4지선다'}
              </button>
            ))}
          </div>
          <textarea value={qText} onChange={(e) => setQText(e.target.value)} placeholder="문제를 입력하세요" rows={2}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none" />
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-600">보기</label>
            {qOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <button type="button" onClick={() => setQCorrect(idx)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${qCorrect === idx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {idx + 1}
                </button>
                {qType === 'ox' ? <span className="text-lg font-bold text-gray-700">{opt}</span> : (
                  <input type="text" value={opt} onChange={(e) => { const next = [...qOptions]; next[idx] = e.target.value; setQOptions(next); }}
                    placeholder={`보기 ${idx + 1}`} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                )}
                {qCorrect === idx && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1"><Clock className="w-4 h-4 inline mr-1" />제한 시간</label>
            <select value={qTimeLimit} onChange={(e) => setQTimeLimit(Number(e.target.value))}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none">
              {[10, 15, 20, 30].map((s) => <option key={s} value={s}>{s}초</option>)}
            </select>
          </div>
          <button onClick={handleAddQuestion} disabled={!qText.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Plus className="w-5 h-5" /> 문제 추가
          </button>
        </div>

        {questions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-700">추가된 문제 ({questions.length}개)</h3>
            {questions.map((q, idx) => (
              <div key={q.id} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{q.question}</p>
                  <p className="text-xs text-gray-400 mt-1">{q.type === 'ox' ? 'OX' : '4지선다'} · {q.timeLimit}초 · 정답: {q.options[q.correctIndex]}</p>
                </div>
                <button onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleStartQuiz} disabled={!title.trim() || questions.length === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-extrabold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors shadow-lg">
          <Play className="w-6 h-6" /> 퀴즈 시작
        </button>
      </div>
    </div>
  );
};

// ─── Student View ───────────────────────────────────────────────
type StudentQuizState = 'waiting' | 'playing' | 'result';
const OPTION_COLORS = ['bg-blue-500 hover:bg-blue-600', 'bg-orange-500 hover:bg-orange-600', 'bg-green-500 hover:bg-green-600', 'bg-red-500 hover:bg-red-600'];

const StudentQuizView: React.FC = () => {
  const { quizzes } = useApp();
  const activeQuiz = quizzes.find((q) => q.status === 'active');
  const [state, setState] = useState<StudentQuizState>('waiting');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (activeQuiz && state === 'waiting') {
      setState('playing');
      setCurrentIdx(0);
      setScore(0);
      setTimeLeft(activeQuiz.questions[0]?.timeLimit ?? 15);
      setSelectedAnswer(null);
      setShowResult(false);
    }
    if (!activeQuiz && state !== 'waiting') setState('waiting');
  }, [activeQuiz]);

  useEffect(() => {
    if (state !== 'playing' || selectedAnswer !== null) return;
    if (timeLeft <= 0) { setShowResult(true); setTimeout(() => advanceQuestion(), 1500); return; }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [state, timeLeft, selectedAnswer]);

  const advanceQuestion = useCallback(() => {
    if (!activeQuiz) return;
    const nextIdx = currentIdx + 1;
    if (nextIdx >= activeQuiz.questions.length) { setState('result'); }
    else { setCurrentIdx(nextIdx); setTimeLeft(activeQuiz.questions[nextIdx].timeLimit); setSelectedAnswer(null); setShowResult(false); }
  }, [activeQuiz, currentIdx]);

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null || !activeQuiz) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === activeQuiz.questions[currentIdx].correctIndex) setScore((s) => s + 1);
    setTimeout(() => advanceQuestion(), 1500);
  };

  if (state === 'waiting' || !activeQuiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="bg-blue-50 rounded-full p-8"><HelpCircle className="w-20 h-20 text-blue-400" /></div>
        <h2 className="text-2xl font-bold text-gray-700">현재 진행 중인 퀴즈가 없습니다</h2>
        <p className="text-gray-400">선생님이 퀴즈를 시작하면 자동으로 참여됩니다!</p>
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (state === 'result') {
    const total = activeQuiz.questions.length;
    const pct = Math.round((score / total) * 100);
    const dummyClassData = [{ name: '4학년 2반', avg: pct }, { name: '4학년 3반', avg: 72 }, { name: '4학년 5반', avg: 68 }];
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-10">
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
        <h2 className="text-3xl font-extrabold text-gray-800">퀴즈 완료!</h2>
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-3">
          <p className="text-6xl font-black text-blue-500">{score} <span className="text-2xl text-gray-400">/ {total}</span></p>
          <p className="text-gray-500">정답률 {pct}%</p>
          {pct >= 80 ? <p className="text-green-500 font-bold text-lg">훌륭해요!</p> : pct >= 50 ? <p className="text-orange-500 font-bold text-lg">잘했어요!</p> : <p className="text-red-500 font-bold text-lg">다음엔 더 잘할 수 있어요!</p>}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h3 className="font-bold text-gray-700 flex items-center justify-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> 반별 비교</h3>
          <div className="space-y-3">
            {dummyClassData.map((cls) => (
              <div key={cls.name} className="space-y-1">
                <div className="flex justify-between text-sm"><span className="font-semibold text-gray-600">{cls.name}</span><span className="text-gray-500">{cls.avg}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${cls.avg === pct ? 'bg-blue-500' : 'bg-gray-400'}`} style={{ width: `${cls.avg}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => { setState('waiting'); setCurrentIdx(0); setScore(0); }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-colors">돌아가기</button>
      </div>
    );
  }

  const question = activeQuiz.questions[currentIdx];
  const total = activeQuiz.questions.length;
  const timerPct = (timeLeft / question.timeLimit) * 100;

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">{currentIdx + 1} / {total}</span>
        <span className="text-sm font-semibold text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4" /> {timeLeft}초</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerPct > 50 ? 'bg-green-500' : timerPct > 25 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${timerPct}%` }} />
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-2xl font-bold text-gray-800 leading-relaxed">{question.question}</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((opt, idx) => {
          let extraClass = '';
          if (showResult) {
            if (idx === question.correctIndex) extraClass = '!bg-green-500 ring-4 ring-green-300';
            else if (idx === selectedAnswer) extraClass = '!bg-red-500 ring-4 ring-red-300';
            else extraClass = 'opacity-50';
          }
          return (
            <button key={idx} onClick={() => handleAnswer(idx)} disabled={selectedAnswer !== null}
              className={`w-full py-5 rounded-xl text-white font-bold text-xl transition-all ${OPTION_COLORS[idx % 4]} ${extraClass} disabled:cursor-not-allowed flex items-center justify-center gap-3`}>
              {showResult && idx === question.correctIndex && <CheckCircle2 className="w-6 h-6" />}
              {showResult && idx === selectedAnswer && idx !== question.correctIndex && <XCircle className="w-6 h-6" />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────
const QuizPage: React.FC = () => {
  const { currentUser } = useApp();
  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
        <Brain className="w-8 h-8 text-blue-500" /> 퀴즈 배틀
      </h1>
      {currentUser?.role === 'teacher' ? <TeacherQuizView /> : <StudentQuizView />}
    </div>
  );
};

export default QuizPage;
