
import React, { useState, useRef, useEffect } from 'react';
import { PersonalInfo, ExamReport, PsychTestReport, SystemConfig } from '../types';
import { GoogleGenAI } from '@google/genai';

interface PsychCounselingPageProps {
  officerInfo?: PersonalInfo;
  exams: ExamReport[];
  psychReports: PsychTestReport[];
  systemConfig: SystemConfig;
}

const PsychCounselingPage: React.FC<PsychCounselingPageProps> = ({ officerInfo, exams, psychReports, systemConfig }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const initChat = async () => {
    if (messages.length > 0) return;
    
    setIsTyping(true);
    // Initialize GoogleGenAI with the provided API KEY from environment
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const latestPsych = psychReports[psychReports.length - 1];
    
    const context = `用户信息: ${JSON.stringify(officerInfo)}\n最新体检: ${JSON.stringify(exams[exams.length - 1])}\n最新心理测评: ${latestPsych?.content || '暂无'}`;
    
    const prompt = `你是警察心理疏导员。背景信息：${context}\n\n请根据用户的情况进行开场白。遵循去病理化、战术性建议的原则。`;
    
    try {
      // Use ai.models.generateContent with named parameters and property access for text output
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setMessages([{ role: 'model', text: response.text || '你好，很高兴能为你提供心理疏导。今天感觉怎么样？' }]);
    } catch (e) {
      setMessages([{ role: 'model', text: '你好，很高兴能为你提供心理疏导。今天感觉怎么样？' }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    initChat();
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg = inputValue;
    setInputValue('');
    const newMsgs = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMsgs);
    setIsTyping(true);

    // Create a new instance right before making an API call to ensure it always uses the most up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: newMsgs.map(m => ({ parts: [{ text: m.text }], role: m.role === 'user' ? 'user' : 'model' })),
      });
      setMessages([...newMsgs, { role: 'model', text: response.text || '' }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)]">
       <div className="bg-white p-4 border border-slate-200 rounded-t-xl shadow-sm">
        <h3 className="font-bold text-slate-800">深度心理疏导</h3>
        <p className="text-xs text-slate-400">基于您的全维度档案，为您提供战术性的放松与疏导建议</p>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-slate-50 border-x border-slate-200 overflow-y-auto p-6 space-y-4"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
              m.role === 'user' 
              ? 'bg-blue-700 text-white rounded-tr-none' 
              : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
               <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
               <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
             </div>
           </div>
        )}
      </div>

      <div className="bg-white p-4 border border-slate-200 rounded-b-xl shadow-sm flex gap-2">
        <input 
          type="text" 
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="和我说说您的想法..."
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={isTyping}
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-bold transition-colors"
        >
          发送
        </button>
      </div>
    </div>
  );
};

export default PsychCounselingPage;
