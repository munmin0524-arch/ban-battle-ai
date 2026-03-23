import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Trophy, Zap, Flag, Settings, X, Swords } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface NavItem {
  to: string;
  label: string;
  emoji: string;
  icon: React.ReactNode;
  teacherOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: '대시보드', emoji: '📊', icon: <LayoutDashboard size={20} /> },
  { to: '/goals', label: '목표 기록', emoji: '🎯', icon: <Target size={20} /> },
  { to: '/league', label: '리그 순위', emoji: '🏆', icon: <Trophy size={20} /> },
  { to: '/quiz', label: '퀴즈 배틀', emoji: '⚡', icon: <Zap size={20} /> },
  { to: '/mission', label: '미션 챌린지', emoji: '🚀', icon: <Flag size={20} /> },
  { to: '/manage', label: '학급 관리', emoji: '⚙️', icon: <Settings size={20} />, teacherOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { currentUser } = useApp();
  const isTeacher = currentUser?.role === 'teacher';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
      isActive
        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 hover:scale-[1.02] active:scale-[0.98]'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
            <Swords size={20} />
          </div>
          <div>
            <span className="text-sm font-black text-gray-900 block">반배틀 AI</span>
            <span className="text-[10px] font-medium text-gray-400">우리 반이 이긴다</span>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems
          .filter((item) => !item.teacherOnly || isTeacher)
          .map((item) => (
            <NavLink key={item.to} to={item.to} onClick={onClose} className={linkClass}>
              <span className="text-lg">{item.emoji}</span>
              {item.label}
            </NavLink>
          ))}
      </nav>

      {/* User badge */}
      {currentUser && (
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-sm font-black text-white shadow">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{currentUser.name}</p>
              <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isTeacher ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {isTeacher ? '👨‍🏫 선생님' : '🧑‍🎓 학생'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
}
