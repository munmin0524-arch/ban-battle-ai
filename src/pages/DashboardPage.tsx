import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, BookOpen, CalendarCheck, Heart, Clock, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../contexts/AppContext';
import { calculateLeague } from '../data/dummy';

export default function DashboardPage() {
  const { currentUser, classes, goalLogs, goalCategories } = useApp();
  const myClassId = currentUser?.classId ?? '';
  const myClass = classes.find((c) => c.id === myClassId);

  const league = useMemo(() => calculateLeague(classes, goalLogs), [classes, goalLogs]);
  const myEntry = league.find((e) => e.classId === myClassId);
  const myRank = myEntry?.rank ?? 0;
  const prevRank = myEntry?.previousRank ?? 0;
  const rankChange = prevRank - myRank;

  const classLogs = useMemo(
    () => goalLogs.filter((l) => l.classId === myClassId && l.status === 'approved'),
    [goalLogs, myClassId],
  );

  const weeklyData = useMemo(() => {
    const days: { date: string; '\uB3C5\uC11C': number; '\uCD9C\uC11D': number; '\uCE5C\uC808': number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayLogs = classLogs.filter((l) => l.createdAt.slice(0, 10) === key);
      days.push({
        date: dayLabel,
        '\uB3C5\uC11C': dayLogs.filter((l) => l.categoryId === 'goal-reading').reduce((s, l) => s + l.points, 0),
        '\uCD9C\uC11D': dayLogs.filter((l) => l.categoryId === 'goal-attendance').reduce((s, l) => s + l.points, 0),
        '\uCE5C\uC808': dayLogs.filter((l) => l.categoryId === 'goal-kindness').reduce((s, l) => s + l.points, 0),
      });
    }
    return days;
  }, [classLogs]);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekLogs = useMemo(
    () => classLogs.filter((l) => new Date(l.createdAt) >= weekStart),
    [classLogs, weekStart],
  );

  const goalProgress = useMemo(() => {
    const cats = [
      { id: 'goal-reading', name: '독서', emoji: '📚', icon: BookOpen, color: '#3B82F6', unit: '권' },
      { id: 'goal-attendance', name: '출석', emoji: '✅', icon: CalendarCheck, color: '#10B981', unit: '일' },
      { id: 'goal-kindness', name: '친절 미션', emoji: '💖', icon: Heart, color: '#EC4899', unit: '회' },
    ];
    return cats.map((cat) => {
      const catDef = goalCategories.find((g) => g.id === cat.id);
      const total = weekLogs.filter((l) => l.categoryId === cat.id).reduce((s, l) => s + l.value, 0);
      const target = (catDef?.weeklyTarget ?? 5) * (myClass?.students.length ?? 1);
      return { ...cat, total, target, pct: Math.min(100, Math.round((total / target) * 100)) };
    });
  }, [weekLogs, goalCategories, myClass]);

  const recentLogs = useMemo(
    () =>
      goalLogs
        .filter((l) => l.classId === myClassId && l.status === 'approved')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    [goalLogs, myClassId],
  );

  function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '방금 전';
    if (mins < 60) return `${mins}분 전`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}시간 전`;
    return `${Math.floor(hrs / 24)}일 전`;
  }

  function unitForCategory(catId: string) {
    if (catId === 'goal-reading') return '권';
    if (catId === 'goal-attendance') return '일';
    return '회';
  }

  const rankEmoji = myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🏅';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Card */}
      <div className="rounded-3xl shadow-xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-bold flex items-center gap-1"><Sparkles size={14} /> 우리 반</p>
            <h1 className="text-3xl font-black mt-1">{myClass?.name ?? '학급 없음'}</h1>
            <p className="text-white/60 text-sm mt-1 font-medium">{myClass?.schoolName}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-4xl">{rankEmoji}</span>
              <span className="text-4xl font-black">{myRank}위</span>
            </div>
            <div className="flex items-center gap-1 justify-end mt-2">
              {rankChange > 0 && (
                <span className="bg-green-400/30 text-green-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp size={14} /> {rankChange}단계 UP!
                </span>
              )}
              {rankChange < 0 && (
                <span className="bg-red-400/30 text-red-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <TrendingDown size={14} /> {Math.abs(rankChange)}단계 DOWN
                </span>
              )}
              {rankChange === 0 && (
                <span className="bg-white/20 text-white/70 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Minus size={14} /> 유지 중
                </span>
              )}
            </div>
            <p className="text-white/80 text-sm mt-3 font-bold">
              총 <span className="text-yellow-300 text-xl font-black">{myEntry?.totalPoints ?? 0}</span> 점
            </p>
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <div>
        <h2 className="text-xl font-black text-gray-800 mb-4">🎯 이번 주 목표</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {goalProgress.map((g) => (
            <div key={g.id} className="card-fun p-5 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{g.emoji}</span>
                <span className="font-bold text-gray-700">{g.name}</span>
              </div>
              <div className="text-3xl font-black text-gray-900">
                {g.total}<span className="text-sm font-medium text-gray-400 ml-1">/ {g.target} {g.unit}</span>
              </div>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${g.pct}%`, background: `linear-gradient(90deg, ${g.color}, ${g.color}CC)` }} />
              </div>
              <p className="text-xs font-bold mt-2 text-right" style={{ color: g.color }}>{g.pct}% 달성!</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="card-fun p-6">
        <h2 className="text-xl font-black text-gray-800 mb-4">📊 주간 활동 차트</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weeklyData} barGap={2}>
            <XAxis dataKey="date" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Bar dataKey={'\uB3C5\uC11C'} stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
            <Bar dataKey={'\uCD9C\uC11D'} stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
            <Bar dataKey={'\uCE5C\uC808'} stackId="a" fill="#EC4899" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity Feed */}
      <div className="card-fun p-6">
        <h2 className="text-xl font-black text-gray-800 mb-4">⚡ 최근 활동</h2>
        {recentLogs.length === 0 && (
          <p className="text-gray-400 text-center py-8 font-medium">아직 활동 기록이 없어요!</p>
        )}
        <ul className="space-y-2">
          {recentLogs.map((log) => (
            <li key={log.id} className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-sm font-black text-white shadow-sm">
                  {log.studentName.charAt(0)}
                </div>
                <span className="text-sm text-gray-700">
                  <span className="font-bold">{log.studentName}</span>{' '}
                  {log.categoryName} {log.value}{unitForCategory(log.categoryId)} 기록
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Clock className="w-3 h-3" />
                {relativeTime(log.createdAt)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
