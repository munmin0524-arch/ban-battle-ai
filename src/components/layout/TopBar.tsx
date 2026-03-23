import { Menu, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { currentUser, classes, logout } = useApp();
  const navigate = useNavigate();
  const currentClass = classes.find((c) => c.id === currentUser?.classId);
  const isTeacher = currentUser?.role === 'teacher';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-lg border-b border-gray-100/80">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition">
            <Menu size={22} />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            {currentClass && (
              <>
                <span className="text-gray-400 font-medium">{currentClass.schoolName}</span>
                <span className="text-gray-200">•</span>
                <span className="font-bold text-gray-800 bg-blue-50 px-3 py-1 rounded-full">{currentClass.name}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <>
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xs font-black text-white">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-sm font-bold text-gray-700">{currentUser.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isTeacher ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {isTeacher ? '선생님' : '학생'}
                </span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition" title="로그아웃">
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
