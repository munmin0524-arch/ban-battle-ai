import { useState, useMemo } from 'react';
import { BookOpen, CalendarCheck, Heart, Send, CheckCircle2, Clock, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { GoalLog } from '../types';

const tabs = [
  { id: 'goal-reading', label: '독서', icon: BookOpen, color: '#3B82F6', unit: '권', type: 'reading' as const },
  { id: 'goal-attendance', label: '출석', icon: CalendarCheck, color: '#10B981', unit: '일', type: 'attendance' as const },
  { id: 'goal-kindness', label: '친절 미션', icon: Heart, color: '#EC4899', unit: '회', type: 'kindness' as const },
];

export default function GoalsPage() {
  const { currentUser, goalLogs, goalCategories, addGoalLog, updateLogStatus } = useApp();
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [value, setValue] = useState(1);
  const [note, setNote] = useState('');

  const isTeacher = currentUser?.role === 'teacher';
  const myClassId = currentUser?.classId ?? '';
  const tab = tabs.find((t) => t.id === activeTab)!;
  const category = goalCategories.find((c) => c.id === activeTab);

  // My recent logs for selected tab
  const myLogs = useMemo(
    () =>
      goalLogs
        .filter(
          (l) =>
            l.classId === myClassId &&
            l.categoryId === activeTab &&
            (isTeacher || l.studentId === currentUser?.id),
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20),
    [goalLogs, myClassId, activeTab, currentUser, isTeacher],
  );

  // Pending logs for teacher approval
  const pendingLogs = useMemo(
    () =>
      goalLogs
        .filter((l) => l.classId === myClassId && l.status === 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [goalLogs, myClassId],
  );

  function handleLog() {
    if (!currentUser || !category) return;
    const isAttendance = activeTab === 'goal-attendance';
    const logValue = isAttendance ? 1 : value;

    const newLog: GoalLog = {
      id: Date.now().toString(),
      classId: myClassId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      categoryId: activeTab,
      categoryName: tab.label,
      value: logValue,
      points: logValue * (category.pointsPerUnit ?? 0),
      note,
      status: isAttendance ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
    };

    addGoalLog(newLog);
    setValue(1);
    setNote('');
  }

  const statusBadge = (status: GoalLog['status']) => {
    if (status === 'approved')
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="w-3 h-3" /> 승인됨
        </span>
      );
    if (status === 'pending')
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" /> 대기중
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" /> 반려됨
      </span>
    );
  };

  const isAttendance = activeTab === 'goal-attendance';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-2 bg-white rounded-2xl shadow-md p-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active ? 'text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
              style={active ? { backgroundColor: t.color } : undefined}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Quick Log Form */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {isAttendance ? '오늘 출석 체크' : `${tab.label} 기록하기`}
        </h2>

        {isAttendance ? (
          <button
            onClick={handleLog}
            className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            style={{ backgroundColor: tab.color }}
          >
            <div className="flex items-center justify-center gap-2">
              <CalendarCheck className="w-6 h-6" />
              출석 체크
            </div>
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                수량 ({tab.unit})
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={value}
                onChange={(e) => setValue(Math.max(1, Number(e.target.value)))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">메모</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="어떤 활동을 했는지 적어주세요"
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none resize-none"
              />
            </div>
            <button
              onClick={handleLog}
              className="w-full py-3 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ backgroundColor: tab.color }}
            >
              <Send className="w-4 h-4" />
              기록하기
            </button>
          </div>
        )}
      </div>

      {/* My Recent Logs */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {isTeacher ? '최근 기록' : '내 기록'}
        </h2>
        {myLogs.length === 0 && (
          <p className="text-gray-400 text-center py-6">아직 기록이 없습니다.</p>
        )}
        <ul className="space-y-2">
          {myLogs.map((log) => (
            <li
              key={log.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div>
                <span className="text-sm font-semibold text-gray-700">{log.studentName}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {log.value}{tab.unit} · {log.note || '-'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(log.status)}
                <span className="text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Teacher Approval Queue */}
      {isTeacher && pendingLogs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5 border-2 border-orange-200">
          <h2 className="text-lg font-bold text-gray-800 mb-1">📋 승인 대기 목록</h2>
          <p className="text-sm text-gray-500 mb-4">{pendingLogs.length}건의 기록이 승인을 기다리고 있습니다</p>
          <ul className="space-y-3">
            {pendingLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl bg-orange-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-700">
                      {log.studentName.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{log.studentName}</span>
                    <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">
                      {log.categoryName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-9">
                    {log.value}
                    {log.categoryId === 'goal-reading' ? '권' : log.categoryId === 'goal-kindness' ? '회' : '일'}
                    {log.note ? ` · ${log.note}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateLogStatus(log.id, 'approved')}
                    className="p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
                    title="승인"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateLogStatus(log.id, 'rejected')}
                    className="p-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="반려"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
