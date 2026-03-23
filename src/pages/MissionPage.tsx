import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import type { Mission, MissionProgress } from '../types';
import { Target, CalendarClock, TrendingUp, Send, Inbox, ChevronDown, ChevronUp, Flame } from 'lucide-react';

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}
function dDayLabel(dateStr: string): string {
  const d = daysUntil(dateStr);
  if (d > 0) return `D-${d}`;
  if (d === 0) return 'D-DAY';
  return `D+${Math.abs(d)}`;
}
function dDayColor(dateStr: string): string {
  const d = daysUntil(dateStr);
  if (d <= 1) return 'text-red-500';
  if (d <= 3) return 'text-orange-500';
  return 'text-blue-500';
}

interface MissionCardProps {
  mission: Mission;
  progresses: MissionProgress[];
  myClassId?: string;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, progresses, myClassId }) => {
  const { currentUser, updateMissionProgress } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [contribution, setContribution] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    const value = Number(contribution);
    if (!value || value <= 0 || !myClassId || !currentUser) return;
    updateMissionProgress(mission.id, myClassId, value, currentUser.id, currentUser.name);
    setContribution('');
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 rounded-full p-2.5"><Target className="w-6 h-6 text-orange-500" /></div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{mission.title}</h3>
              <p className="text-sm text-gray-500">{mission.description}</p>
            </div>
          </div>
          <span className={`text-sm font-extrabold ${dDayColor(mission.endDate)} whitespace-nowrap`}>
            <CalendarClock className="w-4 h-4 inline mr-1" />{dDayLabel(mission.endDate)}
          </span>
        </div>

        <div className="space-y-2">
          {progresses.map((cp) => {
            const pct = mission.targetValue > 0 ? Math.min(100, Math.round((cp.currentValue / mission.targetValue) * 100)) : 0;
            const isMine = cp.classId === myClassId;
            return (
              <div key={cp.classId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={`font-semibold ${isMine ? 'text-blue-600' : 'text-gray-500'}`}>
                    {cp.className}{isMine && ' (우리 반)'}
                  </span>
                  <span className="text-gray-400">{cp.currentValue}/{mission.targetValue} {mission.unit} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isMine ? 'bg-blue-500' : 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => setExpanded(!expanded)} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? '접기' : '상세 보기'}
        </button>
      </div>

      {expanded && (
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400">목표</span><p className="font-bold text-gray-700">{mission.targetValue} {mission.unit}</p></div>
            <div><span className="text-gray-400">마감일</span><p className="font-bold text-gray-700">{new Date(mission.endDate).toLocaleDateString('ko-KR')}</p></div>
          </div>
          {currentUser?.role === 'student' && (
            <div>
              {!showForm ? (
                <button onClick={() => setShowForm(true)} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Flame className="w-5 h-5" /> 기여하기
                </button>
              ) : (
                <div className="flex gap-2">
                  <input type="number" min={1} value={contribution} onChange={(e) => setContribution(e.target.value)} placeholder="기여 수량 입력"
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  <button onClick={handleSubmit} disabled={!contribution || Number(contribution) <= 0}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold px-5 py-2 rounded-xl flex items-center gap-1 transition-colors">
                    <Send className="w-4 h-4" /> 제출
                  </button>
                  <button onClick={() => { setShowForm(false); setContribution(''); }} className="text-gray-400 hover:text-gray-600 px-3">취소</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MissionPage: React.FC = () => {
  const { missions, missionProgress, currentUser } = useApp();
  const myClassId = currentUser?.classId;

  const activeMissions = missions.filter((m) => daysUntil(m.endDate) >= 0);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
        <Target className="w-8 h-8 text-orange-500" /> 미션 챌린지
      </h1>
      {activeMissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <div className="bg-orange-50 rounded-full p-8"><Inbox className="w-16 h-16 text-orange-300" /></div>
          <h2 className="text-xl font-bold text-gray-600">현재 진행 중인 미션이 없습니다</h2>
          <p className="text-gray-400">새로운 미션이 등록되면 여기에 표시됩니다!</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-3 bg-white rounded-xl shadow p-4">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <span className="font-semibold text-gray-700">진행 중인 미션 <span className="text-blue-500">{activeMissions.length}</span>개</span>
          </div>
          {activeMissions.map((m) => (
            <MissionCard key={m.id} mission={m} progresses={missionProgress.filter((mp) => mp.missionId === m.id)} myClassId={myClassId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MissionPage;
