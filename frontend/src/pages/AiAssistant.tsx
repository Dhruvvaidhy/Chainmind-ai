import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, AlertCircle } from 'lucide-react';
import { aiService, AIMessageResponse } from '../services/aiService';

export const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<AIMessageResponse[]>([
    {
      id: 1,
      sender: 'ASSISTANT',
      content:
        "Hello! I am your **ChainMind AI Supply Chain Assistant**.\n\nAsk me about supplier delivery delays, stockout risks, shipment tracking events, or demand forecasting recommendations across your organization.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'Which suppliers have the highest delivery delays?',
    'Which products are at risk of stockout?',
    'Show me the highest risk shipments currently en-route.',
    'How is our supply chain performing this month?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim() || loading) return;

    const userMessage: AIMessageResponse = {
      id: Date.now(),
      sender: 'USER',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setPrompt('');
    setLoading(true);

    try {
      const response = await aiService.chatWithAssistant(textToSend);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ASSISTANT',
          content: '⚠️ Failed to connect to AI assistant service.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-brand-500" /> Conversational AI Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Secure AI assistant powered by organization operational context</p>
        </div>
      </div>

      {/* Suggested Questions Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">Presets:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 rounded-full text-xs text-slate-700 dark:text-slate-300 transition-colors flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg, idx) => (
          <div
            key={msg.id ?? `msg-${idx}`}
            className={`flex gap-3 max-w-3xl ${msg.sender === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                msg.sender === 'USER'
                  ? 'bg-slate-800 text-white'
                  : 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              }`}
            >
              {msg.sender === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                msg.sender === 'USER'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing supply chain context query...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI assistant about suppliers, stockout risks, POs, or shipments..."
          className="flex-1 px-4 py-2.5 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-brand-600/20 disabled:opacity-40 flex items-center gap-2"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
