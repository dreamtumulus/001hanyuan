
import React from 'react';
import { AppState, UserRole } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardPageProps {
  state: AppState;
  onNavigate: (path: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ state, onNavigate }) => {
  // 动态数据计算
  const totalOfficers = Object.keys(state.personalInfo).length;
  
  // 风险统计逻辑
  const highRiskRecords = state.talkRecords.filter(r => 
    [r.hasFamilyConflict, r.hasMajorChange, r.hasDebt, r.hasAlcoholIssue, r.hasRelationshipIssue, r.hasComplexSocial, r.isUnderInvestigation, r.hasMentalIssue].some(v => v === true)
  );
  
  const highRiskCount = new Set(highRiskRecords.map(r => r.policeId)).size;
  const normalCount = totalOfficers - highRiskCount;

  const data = [
    { name: '平稳', value: Math.round((normalCount / (totalOfficers || 1)) * 100), color: '#10b981' },
    { name: '预警', value: Math.round((highRiskCount / (totalOfficers || 1)) * 100), color: '#dc2626' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          警队思想动态实时看板
          <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-black">LEADER VIEW</span>
        </h2>
        <div className="text-[10px] text-slate-400 font-bold uppercase">最后同步: {new Date().toLocaleTimeString()}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">已建档警力</p>
          <p className="text-3xl font-black text-slate-800">{totalOfficers} <span className="text-sm font-normal text-slate-400">人</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">谈心谈话覆盖</p>
          <p className="text-3xl font-black text-blue-600">{state.talkRecords.length} <span className="text-sm font-normal text-slate-400">次</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-red-600 border border-slate-200">
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">待关注/高风险</p>
          <p className="text-3xl font-black text-red-600">{highRiskCount} <span className="text-sm font-normal text-slate-400">人</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-700 mb-8 uppercase tracking-widest text-xs">整体心理态势分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value">
                  {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-10 mt-4">
            {data.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span className="text-xs font-bold text-slate-600">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-red-600 flex items-center gap-2 uppercase tracking-widest text-xs">
              异常风险名单 (需立即研判)
            </h3>
            <button onClick={() => onNavigate('analysis-report')} className="text-[10px] text-blue-700 font-black hover:underline uppercase">进入研判系统 →</button>
          </div>
          <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2">
            {highRiskRecords.length === 0 ? (
              <p className="text-slate-300 italic text-center text-sm py-10">当前无高风险预警警情</p>
            ) : highRiskRecords.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-black">{r.officerName[0]}</div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{r.officerName}</p>
                    <p className="text-[10px] text-red-500 font-bold uppercase">风险点: {[r.hasDebt && '债务', r.hasFamilyConflict && '家盾', r.hasMentalIssue && '心理'].filter(Boolean).join(' / ')}</p>
                  </div>
                </div>
                <button onClick={() => onNavigate('analysis-report')} className="text-[10px] bg-white text-red-600 border-2 border-red-200 px-3 py-1.5 rounded-lg font-black hover:bg-red-600 hover:text-white transition-all">启动AI研判</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
