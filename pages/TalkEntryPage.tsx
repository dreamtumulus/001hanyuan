
import React, { useState } from 'react';
import { TalkRecord } from '../types';

interface TalkEntryPageProps {
  records: TalkRecord[];
  onAdd: (record: TalkRecord, password?: string) => void;
  onDelete: (id: string) => void;
}

const TalkEntryPage: React.FC<TalkEntryPageProps> = ({ records, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [officerPassword, setOfficerPassword] = useState('123456');
  const [formData, setFormData] = useState<Partial<TalkRecord>>({
    officerName: '', policeId: '', interviewer: '', participants: '',
    date: new Date().toISOString().split('T')[0], location: '', 
    entryTime: new Date().toLocaleString(), armedUnit: '',
    hasFamilyConflict: false, familyConflictDetail: '',
    hasMajorChange: false, majorChangeDetail: '',
    hasDebt: false, debtDetail: '',
    hasAlcoholIssue: false, alcoholDetail: '',
    hasRelationshipIssue: false, relationshipDetail: '',
    hasComplexSocial: false, complexSocialDetail: '',
    isUnderInvestigation: false, investigationDetail: '',
    hasMentalIssue: false, mentalIssueDetail: '',
    otherInfo: '', thoughtDynamic: '', realityPerformance: '',
    mentalStatus: '', canCarryGun: '适宜'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, id: Date.now().toString() } as TalkRecord, officerPassword);
    setShowModal(false);
    setFormData({ ...formData, officerName: '', policeId: '' });
  };

  const renderToggleField = (label: string, field: keyof TalkRecord, detailField: keyof TalkRecord) => (
    <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700">{label}</label>
        <div className="flex bg-white rounded-md border p-1">
          <button 
            type="button"
            onClick={() => setFormData({...formData, [field]: true})}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${formData[field] ? 'bg-red-600 text-white' : 'text-slate-400'}`}
          >是</button>
          <button 
            type="button"
            onClick={() => setFormData({...formData, [field]: false})}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${!formData[field] ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >否</button>
        </div>
      </div>
      {formData[field] && (
        <textarea 
          placeholder="请说明具体情况..." 
          className="w-full p-2 text-sm border rounded-md" 
          value={formData[detailField] as string}
          onChange={e => setFormData({...formData, [detailField]: e.target.value})}
        />
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            谈心谈话记录录入
            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-black">COMMANDER ROLE</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">记录警员思想动态，新录入警员将自动生成登录账号</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/10 hover:bg-blue-800 active:scale-95 transition-all"
        >
          + 新增谈话
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4 text-left">警员姓名/警号</th>
              <th className="px-6 py-4 text-left">谈话日期</th>
              <th className="px-6 py-4 text-left">负责人</th>
              <th className="px-6 py-4 text-left">风险评估状态</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="text-slate-200 text-5xl mb-4">✍️</div>
                  <p className="text-slate-400 font-medium italic">暂无录入记录，点击“新增谈话”开始数据采集</p>
                </td>
              </tr>
            ) : records.map(r => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{r.officerName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{r.policeId}</div>
                </td>
                <td className="px-6 py-4 text-slate-500">{r.date}</td>
                <td className="px-6 py-4 font-medium">{r.interviewer}</td>
                <td className="px-6 py-4">
                  {[r.hasFamilyConflict, r.hasMajorChange, r.hasDebt, r.hasAlcoholIssue, r.hasRelationshipIssue, r.hasComplexSocial, r.isUnderInvestigation, r.hasMentalIssue].filter(Boolean).length > 0 ? (
                    <span className="flex items-center gap-1.5 text-red-600 font-black text-[10px]">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                      触发风险项
                    </span>
                  ) : (
                    <span className="text-green-600 font-bold text-[10px]">情况平稳</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                   <button onClick={() => onDelete(r.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
            <div className="bg-[#1e3a8a] p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl tracking-tight">新增警员谈心记录</h3>
                <p className="text-[10px] text-blue-200 font-bold mt-1 uppercase">New Dynamic Observation Entry</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">基础信息与账号设置</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">被谈话人姓名</label>
                    <input required className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all" value={formData.officerName} onChange={e => setFormData({...formData, officerName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">警号 (登录账号)</label>
                    <input required className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all font-mono" value={formData.policeId} onChange={e => setFormData({...formData, policeId: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">初始登录密码</label>
                    <input required className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all" type="text" value={officerPassword} onChange={e => setOfficerPassword(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">谈话负责人</label>
                    <input required className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all" value={formData.interviewer} onChange={e => setFormData({...formData, interviewer: e.target.value})} />
                  </div>
                </div>
                <p className="text-[10px] text-amber-600 font-bold">提示：若警号为新用户，保存后将自动开通民警端访问权限。</p>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">八小时外风险排查</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderToggleField('家庭矛盾（分居/离异/争吵）', 'hasFamilyConflict', 'familyConflictDetail')}
                  {renderToggleField('重大变故（亲属病亡/自然灾害）', 'hasMajorChange', 'majorChangeDetail')}
                  {renderToggleField('经济压力（高额负债/网贷）', 'hasDebt', 'debtDetail')}
                  {renderToggleField('不良嗜好（酗酒/赌博/社交复杂）', 'hasAlcoholIssue', 'alcoholDetail')}
                  {renderToggleField('政治审查/接受组织调查中', 'isUnderInvestigation', 'investigationDetail')}
                  {renderToggleField('精神萎靡/异常行为表现', 'hasMentalIssue', 'mentalIssueDetail')}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">综合评述</h4>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">思想动态与现实表现</label>
                    <textarea className="w-full p-4 border-2 border-slate-100 rounded-2xl h-32 focus:border-blue-500 outline-none transition-all" value={formData.thoughtDynamic} onChange={e => setFormData({...formData, thoughtDynamic: e.target.value})} placeholder="详细描述其近期的思想变化、工作态度、社交圈动态..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">配枪资格研判建议</label>
                      <select className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all font-bold" value={formData.canCarryGun} onChange={e => setFormData({...formData, canCarryGun: e.target.value})}>
                        <option>适宜</option>
                        <option>建议观察</option>
                        <option>暂停配枪</option>
                        <option>取消资格</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>
            </form>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all">取消</button>
              <button onClick={handleSubmit} className="px-12 py-3 bg-[#1e3a8a] text-white rounded-xl font-black shadow-xl hover:bg-blue-900 active:scale-95 transition-all">
                开通账号并提交研判
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalkEntryPage;
