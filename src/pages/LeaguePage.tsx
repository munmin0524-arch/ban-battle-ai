import { useState, useMemo } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../contexts/AppContext';
import { calculateLeague } from '../data/dummy';
import type { LeagueEntry } from '../types';

const medalMap: Record<number, string> = { 1: '\u{1F947}', 2: '\u{1F948}', 3: '\u{1F949}' };

export default function LeaguePage() {
  const { currentUser, classes, goalLogs } = useApp();
  const [selectedClass, setSelectedClass] = useState<LeagueEntry | null>(null);

  const myClassId = currentUser?.classId ?? '';

  const league = useMemo(() => calculateLeague(classes, goalLogs), [classes, goalLogs]);
  const myEntry = league.find((e) => e.classId === myClassId);

  // Comparison chart data
  const comparisonData = useMemo(() => {
    if (!selectedClass || !myEntry) return [];
    return [
      { category: '독서', [myEntry.className]: myEntry.readingPoints, [selectedClass.className]: selectedClass.readingPoints },
      { category: '출석', [myEntry.className]: myEntry.attendancePoints, [selectedClass.className]: selectedClass.attendancePoints },
      { category: '친절', [myEntry.className]: myEntry.kindnessPoints, [selectedClass.className]: selectedClass.kindnessPoints },
      { category: '총점', [myEntry.className]: myEntry.totalPoints, [selectedClass.className]: selectedClass.totalPoints },
    ];
  }, [selectedClass, myEntry]);

  function rankIndicator(entry: LeagueEntry) {
    const diff = entry.previousRank - entry.rank;
    if (diff > 0) return <span className="text-green-500 font-bold text-sm">▲{diff}</span>;
    if (diff < 0) return <span className="text-red-500 font-bold text-sm">▼{Math.abs(diff)}</span>;
    return <span className="text-gray-400 font-bold text-sm">-</span>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-100 rounded-xl">
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">학급 리그</h1>
          <p className="text-sm text-gray-500">우리 반의 순위를 확인해보세요!</p>
        </div>
      </div>

      {/* League Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
              <th className="py-3 px-4 text-left font-semibold">순위</th>
              <th className="py-3 px-4 text-left font-semibold">반 이름</th>
              <th className="py-3 px-2 text-center font-semibold">총점</th>
              <th className="py-3 px-2 text-center font-semibold">독서</th>
              <th className="py-3 px-2 text-center font-semibold">출석</th>
              <th className="py-3 px-2 text-center font-semibold">친절</th>
              <th className="py-3 px-2 text-center font-semibold">변동</th>
            </tr>
          </thead>
          <tbody>
            {league.map((entry) => {
              const isMine = entry.classId === myClassId;
              return (
                <tr
                  key={entry.classId}
                  onClick={() => entry.classId !== myClassId && setSelectedClass(entry)}
                  className={`border-t border-gray-100 cursor-pointer transition-colors ${
                    isMine
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{medalMap[entry.rank] ?? ''}</span>
                      <span className={`font-bold ${isMine ? 'text-blue-600' : 'text-gray-700'}`}>
                        {entry.rank}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-semibold ${isMine ? 'text-blue-600' : 'text-gray-800'}`}>
                      {entry.className}
                    </span>
                    {isMine && (
                      <span className="ml-2 text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                        우리 반
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-2 text-center font-bold text-gray-800">{entry.totalPoints}</td>
                  <td className="py-3.5 px-2 text-center text-blue-500 font-medium">{entry.readingPoints}</td>
                  <td className="py-3.5 px-2 text-center text-green-500 font-medium">{entry.attendancePoints}</td>
                  <td className="py-3.5 px-2 text-center text-pink-500 font-medium">{entry.kindnessPoints}</td>
                  <td className="py-3.5 px-2 text-center">{rankIndicator(entry)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Comparison View */}
      {selectedClass && myEntry && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              📊 {myEntry.className} vs {selectedClass.className}
            </h2>
            <button
              onClick={() => setSelectedClass(null)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              닫기
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData} barGap={8}>
              <XAxis dataKey="category" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey={myEntry.className} fill="#3B82F6" radius={[6, 6, 0, 0]} />
              <Bar dataKey={selectedClass.className} fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
