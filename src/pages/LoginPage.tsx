import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { GraduationCap, KeyRound, Users, LogIn, ChevronRight, Swords, Sparkles } from 'lucide-react';
import type { User, ClassInfo, Student } from '../types';

type Tab = 'teacher' | 'student';

export default function LoginPage() {
  const { login, classes } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('student');
  const [teacherName, setTeacherName] = useState('');
  const [password, setPassword] = useState('');
  const [teacherError, setTeacherError] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [matchedClass, setMatchedClass] = useState<ClassInfo | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentStep, setStudentStep] = useState<'code' | 'select' | 'confirm'>('code');
  const [studentError, setStudentError] = useState('');

  const handleTeacherLogin = () => {
    setTeacherError('');
    if (!teacherName.trim()) { setTeacherError('이름을 입력해 주세요!'); return; }
    if (password !== '1234') { setTeacherError('비밀번호가 틀렸어요!'); return; }
    const user: User = { id: 'teacher-1', name: teacherName.trim(), role: 'teacher', classId: classes[0]?.id ?? '' };
    login(user);
    navigate('/dashboard');
  };

  const handleCodeSubmit = () => {
    setStudentError('');
    const found = classes.find((c) => c.inviteCode === inviteCode.trim().toUpperCase());
    if (!found) { setStudentError('코드를 찾을 수 없어요 😢 다시 확인해 주세요!'); return; }
    setMatchedClass(found);
    setStudentStep('select');
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setStudentStep('confirm');
  };

  const handleStudentConfirm = () => {
    if (!matchedClass || !selectedStudent) return;
    const user: User = { id: selectedStudent.id, name: selectedStudent.name, role: 'student', classId: matchedClass.id, studentNumber: selectedStudent.number };
    login(user);
    navigate('/dashboard');
  };

  const resetStudentFlow = () => {
    setInviteCode(''); setMatchedClass(null); setSelectedStudent(null); setStudentStep('code'); setStudentError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%)' }}>
      {/* Floating decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] text-6xl animate-float opacity-20">⚔️</div>
        <div className="absolute top-[20%] right-[15%] text-5xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🏆</div>
        <div className="absolute bottom-[20%] left-[20%] text-5xl animate-float opacity-20" style={{ animationDelay: '2s' }}>📚</div>
        <div className="absolute bottom-[15%] right-[10%] text-6xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>🌟</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Title */}
        <div className="text-center mb-8 animate-bounce-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm text-white mb-4 shadow-xl border border-white/30">
            <Swords size={40} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
            반배틀 AI
          </h1>
          <p className="mt-2 text-lg font-bold text-white/80 flex items-center justify-center gap-1">
            <Sparkles size={18} /> 우리 반이 이긴다 <Sparkles size={18} />
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/50">
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => { setTab('student'); resetStudentFlow(); }}
              className={`flex-1 py-4 text-sm font-bold transition-all ${
                tab === 'student'
                  ? 'text-blue-600 bg-blue-50 border-b-3 border-blue-500'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users size={18} className="inline-block mr-1.5 -mt-0.5" />
              학생 입장 🙋
            </button>
            <button
              onClick={() => { setTab('teacher'); setTeacherError(''); }}
              className={`flex-1 py-4 text-sm font-bold transition-all ${
                tab === 'teacher'
                  ? 'text-purple-600 bg-purple-50 border-b-3 border-purple-500'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <GraduationCap size={18} className="inline-block mr-1.5 -mt-0.5" />
              선생님 🧑‍🏫
            </button>
          </div>

          <div className="p-7">
            {/* ── Teacher Tab ── */}
            {tab === 'teacher' && (
              <div className="space-y-5 animate-slide-up">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">이름</label>
                  <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="선생님 이름을 입력하세요"
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">비밀번호</label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력"
                      onKeyDown={(e) => e.key === 'Enter' && handleTeacherLogin()}
                      className="w-full pl-12 pr-5 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition text-sm font-medium" />
                  </div>
                </div>
                {teacherError && <p className="text-sm text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl">{teacherError}</p>}
                <button onClick={handleTeacherLogin}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                  <LogIn size={18} /> 로그인하기
                </button>
              </div>
            )}

            {/* ── Student: Code Step ── */}
            {tab === 'student' && studentStep === 'code' && (
              <div className="space-y-5 animate-slide-up">
                <div className="text-center mb-2">
                  <p className="text-gray-500 text-sm font-medium">선생님이 알려준 코드를 입력해요! 🔑</p>
                </div>
                <div>
                  <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="초대 코드"
                    maxLength={8} onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition tracking-[0.3em] text-center font-mono text-2xl font-bold text-gray-700" />
                </div>
                {studentError && <p className="text-sm text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl">{studentError}</p>}
                <button onClick={handleCodeSubmit}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                  다음으로 <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* ── Student: Select Step ── */}
            {tab === 'student' && studentStep === 'select' && matchedClass && (
              <div className="space-y-5 animate-slide-up">
                <div className="text-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl py-3 px-4">
                  <p className="text-xs text-gray-400">{matchedClass.schoolName}</p>
                  <p className="text-lg font-black text-blue-600">{matchedClass.name} 🏫</p>
                </div>
                <label className="block text-sm font-bold text-gray-600">내 번호를 눌러요! 👆</label>
                <div className="grid grid-cols-5 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {matchedClass.students.map((s) => (
                    <button key={s.id} onClick={() => handleStudentSelect(s)}
                      className="py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all">
                      {s.number}번
                    </button>
                  ))}
                </div>
                <button onClick={resetStudentFlow} className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 font-medium transition">
                  ← 뒤로 가기
                </button>
              </div>
            )}

            {/* ── Student: Confirm Step ── */}
            {tab === 'student' && studentStep === 'confirm' && selectedStudent && matchedClass && (
              <div className="space-y-6 text-center animate-bounce-in">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-white text-3xl font-black shadow-lg">
                  {selectedStudent.number}번
                </div>
                <div>
                  <p className="text-xs text-gray-400">{matchedClass.schoolName} {matchedClass.name}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{selectedStudent.name}</p>
                  <p className="text-sm text-gray-400 mt-2">나 맞아요? 🤔</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStudentStep('select')}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
                    아니에요 ✋
                  </button>
                  <button onClick={handleStudentConfirm}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1">
                    <LogIn size={16} /> 입장! 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/50 mt-6 font-medium">
          반배틀 AI · Prototype v0.1
        </p>
      </div>
    </div>
  );
}
