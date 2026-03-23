import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import type { Student } from '../types';
import * as XLSX from 'xlsx';
import {
  Settings, Copy, Check, Upload, FileSpreadsheet, UserPlus,
  Trash2, CheckCircle2, XCircle, Plus, ClipboardList, Users, GraduationCap,
} from 'lucide-react';

// ─── Class Info Card ────────────────────────────────────────────
const ClassInfoCard: React.FC = () => {
  const { currentUser, classes } = useApp();
  const [copied, setCopied] = useState(false);
  const myClass = classes.find((c) => c.id === currentUser?.classId);
  const inviteCode = myClass?.inviteCode ?? '------';
  const className = myClass?.name ?? '학급 없음';

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(inviteCode); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><GraduationCap className="w-6 h-6 text-blue-500" /> 반 정보</h2>
      <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4">
        <div><p className="text-sm text-blue-500 font-semibold">반 이름</p><p className="text-lg font-bold text-gray-800">{className}</p></div>
      </div>
      <div className="bg-orange-50 rounded-xl p-4">
        <p className="text-sm text-orange-500 font-semibold mb-1">초대 코드</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black tracking-widest text-gray-800 select-all">{inviteCode}</span>
          <button onClick={handleCopy} className="bg-white border border-gray-200 hover:border-blue-400 rounded-lg p-2 transition-colors" title="복사">
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
        {copied && <p className="text-xs text-green-500 mt-1">복사되었습니다!</p>}
      </div>
    </div>
  );
};

// ─── Student List Table ─────────────────────────────────────────
const StudentListTable: React.FC = () => {
  const { currentUser, classes } = useApp();
  const myClass = classes.find((c) => c.id === currentUser?.classId);
  const list = myClass?.students ?? [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-500" /> 학생 목록 <span className="text-sm font-normal text-gray-400 ml-2">{list.length}명</span>
      </h2>
      {list.length === 0 ? (
        <p className="text-gray-400 text-center py-8">등록된 학생이 없습니다</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-500"><th className="py-3 px-4 text-left rounded-tl-lg">번호</th><th className="py-3 px-4 text-left">이름</th><th className="py-3 px-4 text-left rounded-tr-lg">성별</th></tr></thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-700">{s.number}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{s.name}</td>
                  <td className="py-3 px-4 text-gray-500">{s.gender ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Excel Upload Section ───────────────────────────────────────
const ExcelUploadSection: React.FC = () => {
  const { currentUser, addStudentsToClass } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<{ number: number; name: string; gender: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const parseFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const rows = json.slice(1).filter((row) => row.length >= 2);
      const students = rows.map((row, i) => ({
        number: Number(row[0]) || i + 1,
        name: String(row[1] ?? '').trim(),
        gender: String(row[2] ?? '').trim(),
      })).filter((s) => s.name);
      setParsedData(students);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleConfirm = () => {
    if (parsedData.length === 0 || !currentUser?.classId) return;
    const students: Student[] = parsedData.map((s) => ({
      id: `s-new-${s.number}-${Date.now()}`,
      number: s.number,
      name: s.name,
      gender: (s.gender === '남' || s.gender === '여') ? s.gender : undefined,
    }));
    addStudentsToClass(currentUser.classId, students);
    setParsedData([]);
    setFileName('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileSpreadsheet className="w-6 h-6 text-green-500" /> 엑셀로 학생 등록</h2>
      <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) parseFile(f); }}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400'}`}
        onClick={() => fileInputRef.current?.click()}>
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="font-semibold text-gray-600">파일을 드래그하거나 클릭하여 업로드</p>
        <p className="text-sm text-gray-400 mt-1">엑셀 파일(.xlsx, .xls) 지원</p>
        {fileName && <p className="text-sm text-blue-500 mt-2 font-medium">{fileName}</p>}
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }} className="hidden" />
      </div>
      {parsedData.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700">미리보기 ({parsedData.length}명)</h3>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0"><tr className="bg-green-50 text-green-700"><th className="py-2 px-4 text-left">번호</th><th className="py-2 px-4 text-left">이름</th><th className="py-2 px-4 text-left">성별</th></tr></thead>
              <tbody>
                {parsedData.map((s, idx) => (
                  <tr key={idx} className="border-t border-gray-100"><td className="py-2 px-4">{s.number}</td><td className="py-2 px-4 font-medium">{s.name}</td><td className="py-2 px-4">{s.gender || '-'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleConfirm} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <UserPlus className="w-5 h-5" /> 등록하기
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Goal Category Section ──────────────────────────────────────
const GoalCategorySection: React.FC = () => {
  const [categories, setCategories] = useState<{ id: string; name: string; unit: string; pointsPerUnit: number; requiresApproval: boolean }[]>([]);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [points, setPoints] = useState('');
  const [approval, setApproval] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || !unit.trim() || !points) return;
    setCategories((prev) => [...prev, { id: `gc-${Date.now()}`, name: name.trim(), unit: unit.trim(), pointsPerUnit: Number(points), requiresApproval: approval }]);
    setName(''); setUnit(''); setPoints(''); setApproval(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ClipboardList className="w-6 h-6 text-orange-500" /> 목표 카테고리 관리</h2>
      <div className="bg-orange-50 rounded-xl p-4 space-y-3 border border-orange-100">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">카테고리 이름</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 독서" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">단위</label><input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="예: 권" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3 items-end">
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">단위당 포인트</label><input type="number" min={1} value={points} onChange={(e) => setPoints(e.target.value)} placeholder="예: 10" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" /></div>
          <div className="flex items-center gap-2 pb-0.5">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={approval} onChange={(e) => setApproval(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
            </label>
            <span className="text-sm text-gray-600">승인 필요</span>
          </div>
        </div>
        <button onClick={handleAdd} disabled={!name.trim() || !unit.trim() || !points}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
          <Plus className="w-4 h-4" /> 카테고리 추가
        </button>
      </div>
      {categories.length > 0 && (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div>
                <span className="font-semibold text-gray-800">{cat.name}</span>
                <span className="text-gray-400 text-sm ml-2">{cat.pointsPerUnit}점 / {cat.unit}</span>
                {cat.requiresApproval && <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">승인 필요</span>}
              </div>
              <button onClick={() => setCategories((prev) => prev.filter((c) => c.id !== cat.id))} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Approval Queue Section ─────────────────────────────────────
const ApprovalQueueSection: React.FC = () => {
  const { goalLogs, currentUser, updateLogStatus } = useApp();
  const pendingLogs = goalLogs.filter((l) => l.classId === currentUser?.classId && l.status === 'pending');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <CheckCircle2 className="w-6 h-6 text-green-500" /> 승인 대기
        {pendingLogs.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingLogs.length}</span>}
      </h2>
      {pendingLogs.length === 0 ? (
        <p className="text-gray-400 text-center py-8">승인 대기 중인 항목이 없습니다</p>
      ) : (
        <div className="space-y-3">
          {pendingLogs.slice(0, 20).map((log) => (
            <div key={log.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div>
                <p className="font-semibold text-gray-800">{log.studentName} <span className="text-gray-400 font-normal text-sm">— {log.categoryName}</span></p>
                <p className="text-sm text-gray-500">{log.value}개 · {log.points}pt</p>
                {log.note && <p className="text-xs text-gray-400 mt-1">{log.note}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => updateLogStatus(log.id, 'approved')} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors" title="승인"><CheckCircle2 className="w-5 h-5" /></button>
                <button onClick={() => updateLogStatus(log.id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors" title="반려"><XCircle className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────
const TeacherSetupPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-2"><Settings className="w-8 h-8 text-blue-500" /> 학급 관리</h1>
      <div className="max-w-3xl mx-auto space-y-6">
        <ClassInfoCard />
        <StudentListTable />
        <ExcelUploadSection />
        <GoalCategorySection />
        <ApprovalQueueSection />
      </div>
    </div>
  );
};

export default TeacherSetupPage;
