
import React from 'react';
import { UserRole } from '../types';

interface IdentitySelectProps {
  onSelect: (role: UserRole) => void;
}

const IdentitySelect: React.FC<IdentitySelectProps> = ({ onSelect }) => {
  const roles = [
    { 
      id: UserRole.OFFICER, 
      title: '普通民警辅警', 
      desc: '个人信息录入、体检分析、心理测评与疏导', 
      icon: '👮' 
    },
    { 
      id: UserRole.COMMANDER, 
      title: '科所队长 / 录入者', 
      desc: '团队谈心谈话管理、思想动态采集', 
      icon: '📋' 
    },
    { 
      id: UserRole.LEADER, 
      title: '政工 / 领导者', 
      desc: '全队心理态势分析、风险预警与AI研判', 
      icon: '🛡️' 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800">请选择您的操作身份</h2>
        <p className="text-slate-500 mt-2">系统将根据身份为您分配相应的功能权限</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
            className="bg-white border-2 border-slate-100 hover:border-blue-600 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all group text-left flex flex-col items-center md:items-start"
          >
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">
              {role.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{role.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{role.desc}</p>
            <div className="mt-8 text-blue-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              进入系统
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default IdentitySelect;
