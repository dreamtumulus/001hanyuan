
import React, { useState, useRef, useEffect } from 'react';
import { PsychTestReport, PersonalInfo, SystemConfig } from '../types';
import { geminiService } from '../geminiService';

interface PsychTestPageProps {
  reports: PsychTestReport[];
  onAddReport: (report: PsychTestReport) => void;
  officerInfo?: PersonalInfo;
  systemConfig: SystemConfig;
}

const PsychTestPage: React.FC<PsychTestPageProps> = ({ reports, onAddReport, officerInfo, systemConfig }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [round, setRound] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startNewTest = async () => {
    setMessages([{ role: 'model', text: `嘿，${officerInfo?.name || '伙计'}！最近工作咋样？接处警多不多？忙归忙，咱也得聊聊，别把自己绷太紧了。最近感觉怎么样？` }]);
    setRound(1);
    setIsFinished(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isFinished) return;
    
    const userMsg = inputValue;
    setInputValue('');
    const newMsgs = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMsgs);
    setIsTyping(true);

    try {
      const response = await geminiService.getPsychTestResponse(newMsgs, officerInfo, round + 1, systemConfig);
      setMessages([...newMsgs, { role: 'model', text: response }]);
      
      if (round >= 10) {
        setIsFinished(true);
        const finalReport: PsychTestReport = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          score: 88,
          level: '优良',
          content: response,
          messages: [...newMsgs, { role: 'model', text: response }]
        };
        onAddReport(finalReport);
      } else {
        setRound(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="bg-white p-4 border border-slate-200 rounded-t-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-xl overflow-hidden shadow-inner">
             👮
          </div>
          <div>
            <h3 className="font-bold text-slate-800">警小伴 AI 心理研判</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">隐蔽式评估模式开启中</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold">测评轮次 {Math.min(round, 10)}/10</span>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 border">
              <div 
                className="h-full bg-blue-700 transition-all duration-500" 
                style={{ width: `${(round / 10) * 100}%` }}
              ></div>
            </div>
          </div>
          <button 
            onClick={startNewTest}
            className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold text-slate-600 border transition-all"
          >
            重启对话
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-[#f9fafb] border-x border-slate-200 overflow-y-auto p-6 space-y-4 shadow-inner"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-4 py-20">
            <div className="text-6xl opacity-10">🛡️</div>
            <p className="max-w-xs text-sm">系统将通过 10 轮深度对话，从职业压力、家庭支持等 5 个维度生成心理底色分析。</p>
            <button onClick={startNewTest} className="mt-4 px-8 py-3 bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-transform">开始新测评</button>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                m.role === 'user' 
                ? 'bg-blue-700 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        {isFinished && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center space-y-3 animate-fadeIn">
            <h4 className="font-bold text-blue-900">心理研判底稿已生成</h4>
            <p className="text-sm text-blue-700">本次测评结果已存入个人档案，将作为思想动态研判的重要权项。</p>
          </div>
        )}
      </div>

      <div className="bg-white p-4 border border-slate-200 rounded-b-xl shadow-sm">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isFinished || messages.length === 0}
            placeholder={messages.length === 0 ? "点击开始开始..." : (isFinished ? "对话已结束" : "输入战友的心声...")}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white transition-all text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isFinished || messages.length === 0 || isTyping}
            className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white px-8 py-2 rounded-xl font-bold transition-all shadow-md active:translate-y-0.5"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default PsychTestPage;
