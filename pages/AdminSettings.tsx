
import React, { useState } from 'react';
import { SystemConfig } from '../types';
import { geminiService } from '../geminiService';

interface AdminSettingsProps {
  config: SystemConfig;
  onSave: (config: SystemConfig) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ config, onSave }) => {
  const [formData, setFormData] = useState<SystemConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{msg: string, type: 'success' | 'error' | 'none'}>({msg: '', type: 'none'});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const cleanedConfig: SystemConfig = {
      openRouterKey: formData.openRouterKey.replace(/[^\x00-\x7F]/g, "").trim(),
      apiBaseUrl: formData.apiBaseUrl.replace(/[^\x00-\x7F]/g, "").trim(),
      preferredModel: formData.preferredModel.replace(/[^\x00-\x7F]/g, "").trim(),
    };

    await new Promise(resolve => setTimeout(resolve, 600));
    
    onSave(cleanedConfig);
    setFormData(cleanedConfig);
    setIsSaving(false);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult({msg: '正在建立连接...', type: 'none'});
    
    try {
      // 发送一个简单的 PING 请求测试连通性
      const result = await geminiService.callAI(
        "Connectivity test. Please reply with 'CONNECTED' if you receive this.", 
        formData, 
        "You are a system diagnostic tool."
      );
      
      if (result.includes("CONNECTED") || (result.length > 5 && !result.includes("["))) {
        setTestResult({
          msg: `连接成功！响应摘要: ${result.substring(0, 30)}...`, 
          type: 'success'
        });
      } else {
        setTestResult({
          msg: result, // 此时 result 已经是错误描述字符串
          type: 'error'
        });
      }
    } catch (err: any) {
      setTestResult({
        msg: `连接异常: ${err.message}`, 
        type: 'error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const commonModels = [
    'google/gemini-2.0-flash-001',
    'google/gemini-2.0-pro-exp-02-05:free',
    'anthropic/claude-3.5-sonnet',
    'deepseek/deepseek-r1',
    'meta-llama/llama-3.3-70b-instruct'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <span className="bg-blue-600 text-white p-1.5 rounded-lg text-sm">ADMIN</span>
              系统全局后台管理
            </h2>
            <p className="text-slate-400 text-sm mt-1">此处的修改将自动清理非法字符并应用于全系统</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={testConnection}
              disabled={isTesting}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-black rounded-lg border transition-all text-slate-600 uppercase"
            >
              {isTesting ? '正在嗅探...' : '测试 AI 链路'}
            </button>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${saveStatus === 'success' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Engine</span>
            </div>
          </div>
        </div>

        {testResult.type !== 'none' && (
          <div className={`mb-6 p-4 rounded-xl text-xs font-bold border animate-scaleIn ${
            testResult.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {testResult.type === 'success' ? '✅ ' : '❌ '} {testResult.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              核心模型接入 (OpenRouter)
              <div className="h-px flex-1 bg-slate-100"></div>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">OpenRouter API Key</label>
                <input 
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none font-mono text-sm transition-all"
                  value={formData.openRouterKey}
                  onChange={e => setFormData({...formData, openRouterKey: e.target.value})}
                  placeholder="sk-or-v1-..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">API 基础路径</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none text-sm transition-all"
                  value={formData.apiBaseUrl}
                  onChange={e => setFormData({...formData, apiBaseUrl: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">自定义模型标识 (Model ID)</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-mono text-blue-700 font-bold"
                value={formData.preferredModel}
                onChange={e => setFormData({...formData, preferredModel: e.target.value})}
                placeholder="例如: google/gemini-2.0-flash-001"
              />
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase py-1">快速选择:</span>
                {commonModels.map(m => (
                  <button 
                    key={m}
                    type="button"
                    onClick={() => setFormData({...formData, preferredModel: m})}
                    className="text-[10px] bg-slate-50 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded-full border border-slate-200 transition-all font-bold"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="pt-6 border-t flex items-center justify-between">
            <div>
              {saveStatus === 'success' && (
                <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                  ✓ 配置已安全存储并即时生效
                </span>
              )}
            </div>
            <button 
              type="submit"
              disabled={isSaving}
              className={`px-10 py-3 rounded-xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
                isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-blue-800'
              }`}
            >
              {isSaving ? '正在清理并保存...' : '保存全局配置'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
        <span className="text-2xl">💡</span>
        <div>
          <h4 className="text-sm font-bold text-amber-900">故障排查技巧</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            1. 如果连接测试失败并显示 "User not found"，请检查 API Key 是否存在空格或过期。 <br/>
            2. 本系统支持混合调度：若 OpenRouter 配置失效且 Vercel 注入了 API_KEY，将自动回退到原生 Google Gemini 引擎。
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
