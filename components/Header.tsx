
import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  user: { username: string, role: UserRole };
  onBack: () => void;
  onLogout: () => void;
  showBack: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onBack, onLogout, showBack }) => {
  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.OFFICER: return '普通民警';
      case UserRole.COMMANDER: return '科所队长';
      case UserRole.LEADER: return '政工领导';
    }
  };

  return (
    <header className="bg-[#1e3a8a] text-white h-16 flex items-center justify-between px-6 shadow-md z-10 shrink-0">
      <div className="flex items-center gap-4">
        {showBack && (
          <button 
            onClick={onBack}
            className="hover:bg-white/10 p-2 rounded-full transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">返回</span>
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-full">
            <svg className="w-8 h-8 text-[#1e3a8a]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 5V11C4 16.19 7.41 21.05 12 22.33C16.59 21.05 20 16.19 20 11V5L12 2M12 20C8.47 18.85 6 15.11 6 11V6.3L12 4.05L18 6.3V11C18 15.11 15.53 18.85 12 20M11 7H13V15H11V7M11 17H13V19H11V17Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-wider">警心卫士</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">{user.username}</p>
          <p className="text-xs text-blue-200">{getRoleName(user.role)}</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-md text-sm transition-colors"
        >
          退出
        </button>
      </div>
    </header>
  );
};

export default Header;
