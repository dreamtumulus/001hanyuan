
import { GoogleGenAI } from "@google/genai";
import { SystemConfig } from "./types";
import { REPORT_GENERATION_PROMPT } from "./constants";

export const geminiService = {
  /**
   * 核心 AI 调用逻辑：支持 OpenRouter 转发与原生 SDK 混合调度
   */
  async callAI(prompt: any, config: SystemConfig, systemInstruction?: string) {
    // 强制清理配置中的非法字符，防止 HTTP Header 报错
    const sanitizedKey = (config.openRouterKey || "").replace(/[^\x00-\x7F]/g, "").trim();
    
    // 链路 1: 如果配置了 OpenRouter Key，优先使用 OpenRouter
    if (sanitizedKey !== "" && sanitizedKey !== "sk-or-v1-") {
      try {
        const sanitizedOrigin = window.location.origin.replace(/[^\x00-\x7F]/g, "");
        const sanitizedBaseUrl = (config.apiBaseUrl || "https://openrouter.ai/api/v1")
          .trim()
          .replace(/[^\x00-\x7F]/g, "")
          .replace(/\/$/, "");

        // 格式化消息格式，适配 OpenRouter (DeepSeek/Claude 等)
        let messages = [];
        if (systemInstruction) {
          messages.push({ role: "system", content: systemInstruction });
        }
        
        if (typeof prompt === 'string') {
          messages.push({ role: "user", content: prompt });
        } else if (Array.isArray(prompt)) {
          // 处理多轮对话格式
          messages.push(...prompt.map(p => ({
            role: p.role === 'model' ? 'assistant' : p.role,
            content: p.parts?.[0]?.text || p.text || ""
          })));
        }

        const response = await fetch(`${sanitizedBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sanitizedKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": sanitizedOrigin,
            "X-Title": "JingXin Guardian System" 
          },
          body: JSON.stringify({
            model: config.preferredModel || "google/gemini-2.0-flash-001",
            messages: messages,
            temperature: 0.7
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          // 深度解析 OpenRouter 错误，避免 [object Object]
          const errorDetail = data.error;
          let errorMessage = "未知错误";
          
          if (typeof errorDetail === 'string') {
            errorMessage = errorDetail;
          } else if (typeof errorDetail === 'object' && errorDetail !== null) {
            // OpenRouter 错误通常在 error.message 中，但也可能嵌套
            errorMessage = errorDetail.message || JSON.stringify(errorDetail);
          }
          
          console.error("OpenRouter API Error Details:", errorDetail);
          throw new Error(errorMessage);
        }

        return data.choices?.[0]?.message?.content || "AI 响应内容为空";
      } catch (err: any) {
        console.warn("OpenRouter 链路异常，尝试回退到 Native SDK:", err.message);
        // 如果 OpenRouter 失败且没有配置 Native Key，则直接返回错误
        if (!process.env.API_KEY) {
          return `[OpenRouter 故障] ${err.message}。且未检测到系统原生 API_KEY，请检查设置。`;
        }
      }
    }

    // 链路 2: 回退方案 - 使用原生 Gemini SDK
    try {
      if (!process.env.API_KEY) {
        return `[系统提示] 默认 API 密钥可能已失效。请管理员在“系统设置”中更新有效的 OpenRouter API Key。`;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // 原生 SDK 不接受带斜杠的模型名（如 google/gemini...），需做处理
      const fallbackModel = (config.preferredModel && !config.preferredModel.includes('/')) 
        ? config.preferredModel 
        : 'gemini-3-flash-preview';
      
      const response = await ai.models.generateContent({
        model: fallbackModel,
        contents: typeof prompt === 'string' ? prompt : prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      // 严格使用 .text 属性
      return response.text || "Gemini SDK 响应内容为空";
    } catch (err: any) {
      console.error("SDK Fallback Error:", err);
      return `[核心链路故障] 无法连接到 AI 服务。错误详情: ${err.message}`;
    }
  },

  async analyzeExamReport(content: string, config: SystemConfig, history?: string) {
    const prompt = `【生理研判指令】\n分析以下体检数据，评估其高压勤务适岗度。\n当前数据：${content}\n历史参考：${history || '无'}`;
    return this.callAI(prompt, config, "你是一名警务职业健康专家。");
  },

  async getPsychTestResponse(messages: { role: 'user' | 'model'; text: string }[], officerInfo: any, round: number, config: SystemConfig) {
    const systemInstruction = `你是警务心理咨询师。这是第 ${round} 轮对话。当前对象：${officerInfo?.name || '战友'}。请以战友语气交流。第10轮输出评估报告。`;
    
    // 转换为 callAI 接受的格式
    const formattedMessages = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    return this.callAI(formattedMessages, config, systemInstruction);
  },

  async generateComprehensiveReport(data: { officer: any, exams: any[], psychs: any[], talks: any[] }, config: SystemConfig) {
    const context = `
    民警姓名: ${data.officer?.name}
    警号: ${data.officer?.policeId}
    部门: ${data.officer?.department}
    体检摘要: ${JSON.stringify(data.exams.map(e => e.analysis))}
    心理对话摘要: ${JSON.stringify(data.psychs.map(p => p.content))}
    历史谈话记录: ${JSON.stringify(data.talks)}
    `;
    return this.callAI(context, config, REPORT_GENERATION_PROMPT);
  }
};
