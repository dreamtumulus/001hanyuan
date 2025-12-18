
import React, { useState, useEffect } from 'react';
import { AppState, UserRole, AIAnalysisReport } from '../types';
import { geminiService } from '../geminiService';

interface AnalysisReportPageProps {
  state: AppState;
  onSaveReport: (report: AIAnalysisReport) => void;
}

const AnalysisReportPage: React.FC<AnalysisReportPageProps> = ({ state, onSaveReport }) => {
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // 关键改进：实时获取当前系统中所有已注册/已录入的警员
  const allOfficers = Object.values(state.personalInfo);

  const currentReport = selectedOfficerId ? state.analysisReports[selectedOfficerId] : null;

  const generateReport = async (policeId: string) => {
    setSelectedOfficerId(policeId);
    setLoading(true);
    
    try {
      const data = {
        officer: state.personalInfo[policeId],
        exams: state.examReports[policeId] || [],
        psychs: state.psychTestReports[policeId] || [],
        talks: state.talkRecords.filter(r => r.policeId === policeId)
      };

      const result = await geminiService.generateComprehensiveReport(data, state.systemConfig);
      
      const newReport: AIAnalysisReport = {
        policeId,
        generatedAt: new Date().toLocaleString(),
        content: result,
        editStatus: 'ai'
      };
      onSaveReport(newReport);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEditSave = () => {
    if (!selectedOfficerId || !currentReport) return;
    
    const updatedReport: AIAnalysisReport = {
      ...currentReport,
      manualEdit: editedContent,
      editStatus: 'modified',
      editorName: state.currentUser?.username
    };
    onSaveReport(updatedReport);
    setIsEditing(false);
  };

  const applyProfessionalInstruction = (instruction: string) => {
    let text = editedContent;
    switch (instruction) {
      case 'politics': 
        text = "【政治定性】该同志在大是大非面前头脑清醒，政治立场坚定。\n" + text;
        break;
      case 'warning':
        text = text + "\n\n【风险警示】根据谈话记录，该同志近期社会面交往较为复杂，存在潜在纪律风险，建议加强日常监管。";
        break;
      case 'care':
        text = text + "\n\n【关怀建议】建议基层党组织发挥作用，针对其面临的实际困难开展精准帮扶，落实组织关爱。";
        break;
    }
    setEditedContent(text);
  };

  useEffect(() => {
    if (currentReport) {
      setEditedContent(currentReport.manualEdit || currentReport.content);
    }
  }, [currentReport, isEditing]);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-700 rounded-full"></span>
            研判档案库
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {allOfficers.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">暂无警员档案，请先通过民警端或队长端录入数据</p>
            ) : allOfficers.map(o => (
              <button 
                key={o.policeId}
                onClick={() => generateReport(o.policeId)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${
                  selectedOfficerId === o.policeId 
                  ? 'border-blue-700 bg-blue-50 shadow-md translate-x-1' 
                  : 'border-slate-50 bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-black text-sm ${selectedOfficerId === o.policeId ? 'text-blue-900' : 'text-slate-800'}`}>{o.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{o.department} · {o.policeId}</p>
                  </div>
                  {state.analysisReports[o.policeId]?.editStatus === 'modified' && (
                    <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-200">已审定</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col min-h-[800px] overflow-hidden">
          <div className="bg-[#1e3a8a] text-white p-6 flex items-center justify-between shadow-lg relative z-20">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
              </div>
              <div>
                <h3 className="font-black tracking-[0.2em] text-lg uppercase">身心动态研判分析底稿</h3>
                <p className="text-[10px] text-blue-300 font-bold tracking-widest uppercase">Expert System Appraisal Report</p>
              </div>
            </div>
            {currentReport && !loading && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-5 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                    isEditing ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white/10 border-white/20 hover:bg-white/30'
                  }`}
                >
                  {isEditing ? '退出编辑' : '✍️ 修改判语'}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-12 bg-[#fafafa] relative overflow-y-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-700 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-blue-900 font-black text-xl animate-pulse tracking-widest">全维度数据深度研判中...</p>
              </div>
            ) : isEditing ? (
              <div className="h-full flex flex-col gap-6 animate-fadeIn">
                <div className="bg-blue-900/5 p-4 rounded-2xl border border-blue-100 flex items-center gap-4 overflow-x-auto">
                   <span className="text-[10px] font-black text-blue-900 uppercase shrink-0">政工词库库：</span>
                   <button onClick={() => applyProfessionalInstruction('politics')} className="text-[10px] whitespace-nowrap bg-white px-3 py-1.5 rounded-lg border border-blue-200 font-bold hover:bg-blue-700 hover:text-white transition-all shadow-sm">政治定性</button>
                   <button onClick={() => applyProfessionalInstruction('warning')} className="text-[10px] whitespace-nowrap bg-white px-3 py-1.5 rounded-lg border-2 border-red-100 font-bold hover:bg-red-700 hover:text-white transition-all shadow-sm">风险预警</button>
                   <button onClick={() => applyProfessionalInstruction('care')} className="text-[10px] whitespace-nowrap bg-white px-3 py-1.5 rounded-lg border border-green-200 font-bold hover:bg-green-700 hover:text-white transition-all shadow-sm">组织关怀</button>
                </div>
                <textarea 
                  className="flex-1 w-full p-10 border-2 border-slate-100 rounded-3xl focus:border-blue-500 focus:ring-8 focus:ring-blue-50 focus:bg-white transition-all outline-none font-serif text-slate-800 leading-loose text-xl shadow-inner min-h-[500px]"
                  value={editedContent}
                  onChange={e => setEditedContent(e.target.value)}
                />
                <div className="flex justify-end gap-4">
                   <button onClick={handleManualEditSave} className="px-12 py-4 bg-[#1e3a8a] text-white rounded-2xl font-black shadow-2xl hover:bg-blue-900 active:scale-95 transition-all">确认并下发建议</button>
                </div>
              </div>
            ) : currentReport ? (
              <div className="animate-fadeIn max-w-4xl mx-auto font-serif relative">
                <div className="text-center mb-12 border-b-4 border-red-600 pb-10">
                  <h1 className="text-4xl font-black text-red-600 tracking-[0.1em] mb-4">警员身心动态综合研判报告</h1>
                  <div className="flex justify-between items-end text-xs text-slate-500 font-black">
                    <div className="text-left space-y-1">
                      <p>编号：JX-ST-2025-{currentReport.policeId}</p>
                      <p>密级：绝密 (Internal Use Only)</p>
                    </div>
                    <div className="text-right">
                      <p>研判生成日期：{currentReport.generatedAt}</p>
                    </div>
                  </div>
                </div>
                
                <div className="whitespace-pre-wrap leading-[2.6] text-slate-900 text-2xl tracking-tight mb-20">
                  {currentReport.manualEdit || currentReport.content}
                </div>

                <div className="mt-24 pt-12 border-t-2 border-slate-200 flex justify-between items-center">
                  <div className="relative">
                    <div className="absolute -top-16 -left-8 w-40 h-40 opacity-20 pointer-events-none">
                       <svg viewBox="0 0 200 200" fill="red">
                         <circle cx="100" cy="100" r="80" fill="none" stroke="red" strokeWidth="3" strokeDasharray="10 5"/>
                         <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="black">研判专用章</text>
                       </svg>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">研判人(电子签章)</p>
                    <p className="text-3xl font-black italic text-[#1e3a8a] border-b-2 border-slate-100 px-4">
                      {currentReport.editStatus === 'modified' ? currentReport.editorName : 'SYSTEM_AI'}
                    </p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] text-slate-300 font-black tracking-widest uppercase">Verified & Audited</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-200">
                 <p className="font-black text-slate-300 text-xl tracking-[0.5em] uppercase">请在左侧选择需要研判的警员</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportPage;
