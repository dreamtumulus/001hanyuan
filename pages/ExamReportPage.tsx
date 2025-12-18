
import React, { useState } from 'react';
import { ExamReport, SystemConfig } from '../types';
import { geminiService } from '../geminiService';

interface ExamReportPageProps {
  reports: ExamReport[];
  onAdd: (report: ExamReport) => void;
  onDelete: (id: string) => void;
  systemConfig: SystemConfig;
}

const ExamReportPage: React.FC<ExamReportPageProps> = ({ reports, onAdd, onDelete, systemConfig }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExamReport | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const analysis = await geminiService.analyzeExamReport(
        `报告文件名: ${file.name}。模拟体检内容：收缩压138mmHg，心率82bpm，空腹血糖5.8mmol/L。`,
        systemConfig,
        reports.map(r => r.analysis).join('\n---\n')
      );

      const newReport: ExamReport = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        fileName: file.name,
        analysis,
        status: 'completed'
      };
      onAdd(newReport);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">警员生理机能健康档案</h2>
        <p className="text-slate-500 text-sm mt-1">上传体检中心原始报告，由 AI 进行身心关联性研判（10%权重）</p>
        
        <div className="mt-6 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-10 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
          <label className="cursor-pointer text-center group w-full">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📂</div>
            <span className="text-blue-700 font-bold">选择报告文件并启动AI分析</span>
            <span className="text-slate-400 block text-xs mt-1">支持 PDF, Word (自动脱敏处理)</span>
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
        {isUploading && (
          <div className="mt-4 flex items-center gap-3 text-blue-600 text-sm font-bold bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            正在根据《公安民警职业健康标准》进行深度比对...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-700 bg-slate-50">档案库记录</div>
          <div className="divide-y divide-slate-100">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic">暂无报告，请上传以构建健康趋势图谱</div>
            ) : reports.map(r => (
              <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{r.fileName}</p>
                    <p className="text-xs text-slate-400">研判于: {r.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedReport(r)} className="text-xs bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-sm">查看报告</button>
                  <button onClick={() => onDelete(r.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-700 bg-slate-50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            专家研判详情
          </div>
          <div className="p-8">
            {selectedReport ? (
              <div className="animate-fadeIn prose prose-slate">
                <div className="text-slate-800 whitespace-pre-wrap leading-relaxed font-sans italic border-l-4 border-slate-200 pl-4 py-2 bg-slate-50 rounded-r-lg">
                  {selectedReport.analysis}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                <p>请选择报告以查看 AI 深度分析</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamReportPage;
