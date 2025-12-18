
import React, { useState } from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, currentPath, onNavigate }) => {
  const [basicOpen, setBasicOpen] = useState(true);
  const [mgmtOpen, setMgmtOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const navItems = [
    { id: 'personal-info', label: '个人信息', icon: '👤', role: [UserRole.OFFICER, UserRole.COMMANDER, UserRole.LEADER] },
    { id: 'exam-reports', label: '体检报告', icon: '📋', role: [UserRole.OFFICER, UserRole.COMMANDER, UserRole.LEADER] },
    { id: 'psych-test', label: '心理测试', icon: '🧠', role: [UserRole.OFFICER, UserRole.COMMANDER, UserRole.LEADER] },
    { id: 'psych-counseling', label: '心理疏导', icon: '💬', role: [UserRole.OFFICER, UserRole.COMMANDER, UserRole.LEADER] },
  ];

  const mgmtItems = [
    { id: 'talk-entry', label: '谈心谈话录入', icon: '✍️', role: [UserRole.COMMANDER] },
    { id: 'dashboard', label: '健康态势仪表', icon: '📊', role: [UserRole.LEADER] },
    { id: 'analysis-report', label: '思想动态分析', icon: '🔍', role: [UserRole.LEADER, UserRole.COMMANDER] },
  ];

  const adminItems = [
    { id: 'admin-settings', label: '系统设置', icon: '⚙️', role: [UserRole.ADMIN] },
  ];

  const renderItem = (item: any) => (
    <button
      key={item.id}
      onClick={() => onNavigate(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
        currentPath === item.id 
        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700 font-bold' 
        : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col shrink-0 overflow-y-auto">
      <div className="py-2">
        {role !== UserRole.ADMIN && (
          <div 
            className="px-4 py-2 flex items-center justify-between cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50"
            onClick={() => setBasicOpen(!basicOpen)}
          >
            <span>基础功能</span>
            <span>{basicOpen ? '▼' : '▶'}</span>
          </div>
        )}
        {basicOpen && navItems.filter(i => i.role.includes(role)).map(renderItem)}

        {(role === UserRole.COMMANDER || role === UserRole.LEADER) && (
          <div className="mt-4">
            <div 
              className="px-4 py-2 flex items-center justify-between cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50"
              onClick={() => setMgmtOpen(!mgmtOpen)}
            >
              <span>{role === UserRole.COMMANDER ? '管理功能' : '研判分析'}</span>
              <span>{mgmtOpen ? '▼' : '▶'}</span>
            </div>
            {mgmtOpen && mgmtItems.filter(i => i.role.includes(role)).map(renderItem)}
          </div>
        )}

        {role === UserRole.ADMIN && (
          <div className="mt-4">
             <div 
              className="px-4 py-2 flex items-center justify-between cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50"
              onClick={() => setAdminOpen(!adminOpen)}
            >
              <span>管理后台</span>
              <span>{adminOpen ? '▼' : '▶'}</span>
            </div>
            {adminOpen && adminItems.map(renderItem)}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
