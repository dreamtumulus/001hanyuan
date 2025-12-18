
import React, { useState, useEffect } from 'react';
import { PersonalInfo, FamilyMember } from '../types';

interface PersonalInfoPageProps {
  info?: PersonalInfo;
  onSave: (info: PersonalInfo) => void;
}

const PersonalInfoPage: React.FC<PersonalInfoPageProps> = ({ info, onSave }) => {
  const [formData, setFormData] = useState<PersonalInfo>(info || {
    name: '', department: '', position: '', policeId: 'TEST001',
    gender: '男', age: '', idCard: '', hometown: '', address: '',
    phone: '', email: '', family: []
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const addFamily = () => {
    setFormData(prev => ({
      ...prev,
      family: [...prev.family, { id: Date.now().toString(), name: '', relation: '', job: '', company: '', phone: '' }]
    }));
  };

  const updateFamily = (id: string, field: keyof FamilyMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      family: prev.family.map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

  const deleteFamily = (id: string) => {
    setFormData(prev => ({
      ...prev,
      family: prev.family.filter(f => f.id !== id)
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">个人档案信息</h2>
          <p className="text-slate-500 text-sm">请如实填写您的基础信息，系统将基于此进行精准研判</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
          >
            {isExpanded ? '收起详情' : '展开详情'}
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition-colors"
          >
            保存档案
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">姓名</label>
              <input className="w-full px-3 py-2 border rounded-md" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">单位</label>
              <input className="w-full px-3 py-2 border rounded-md" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">职位</label>
              <input className="w-full px-3 py-2 border rounded-md" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">警号</label>
              <input className="w-full px-3 py-2 border rounded-md" value={formData.policeId} readOnly />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">性别</label>
              <select className="w-full px-3 py-2 border rounded-md" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option>男</option>
                <option>女</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">年龄</label>
              <input className="w-full px-3 py-2 border rounded-md" type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-400">身份证号</label>
              <input className="w-full px-3 py-2 border rounded-md" value={formData.idCard} onChange={e => setFormData({...formData, idCard: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">电话</label>
              <input className="w-full px-3 py-2 border rounded-md" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-400">户籍地址</label>
              <input className="w-full px-3 py-2 border rounded-md" value={formData.hometown} onChange={e => setFormData({...formData, hometown: e.target.value})} />
            </div>
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">家庭关系</h3>
              <button onClick={addFamily} className="text-sm text-blue-700 hover:underline font-medium">+ 添加亲属</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="pb-2 font-medium">姓名</th>
                    <th className="pb-2 font-medium">关系</th>
                    <th className="pb-2 font-medium">职业</th>
                    <th className="pb-2 font-medium">单位</th>
                    <th className="pb-2 font-medium">电话</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {formData.family.map(f => (
                    <tr key={f.id} className="bg-white border-b last:border-0">
                      <td className="py-2 pr-2"><input className="w-full bg-transparent outline-none" value={f.name} onChange={e => updateFamily(f.id, 'name', e.target.value)} /></td>
                      <td className="py-2 pr-2"><input className="w-full bg-transparent outline-none" value={f.relation} onChange={e => updateFamily(f.id, 'relation', e.target.value)} /></td>
                      <td className="py-2 pr-2"><input className="w-full bg-transparent outline-none" value={f.job} onChange={e => updateFamily(f.id, 'job', e.target.value)} /></td>
                      <td className="py-2 pr-2"><input className="w-full bg-transparent outline-none" value={f.company} onChange={e => updateFamily(f.id, 'company', e.target.value)} /></td>
                      <td className="py-2 pr-2"><input className="w-full bg-transparent outline-none" value={f.phone} onChange={e => updateFamily(f.id, 'phone', e.target.value)} /></td>
                      <td className="py-2 text-right">
                        <button onClick={() => deleteFamily(f.id)} className="text-red-500 hover:text-red-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoPage;
