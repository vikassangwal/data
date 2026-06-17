'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Plus, MessageSquare, MoreVertical, 
  Settings, Trash2, Database, Sparkles, BrainCircuit, Code,
  Paperclip, Terminal, FileText
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
}

const PAST_CHATS: ChatSession[] = [
  { id: '1', title: 'Dataset Integration Queries', date: 'Today' },
  { id: '2', title: 'Q3 Financial Analysis', date: 'Yesterday' },
  { id: '3', title: 'API Key Rotation Script', date: 'Previous 7 Days' },
];

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am DevFort AI, your enterprise context-aware assistant. I have access to your datasets, integrations, and workspace analytics. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let responseText = "I've analyzed your request. Based on your current enterprise data context, ";
      
      const lowerInput = userMsg.content.toLowerCase();
      if (lowerInput.includes('dataset') || lowerInput.includes('data')) {
        responseText += "I see you have 3 active datasets. Would you like me to run a predictive model on them?";
      } else if (lowerInput.includes('code') || lowerInput.includes('api')) {
        responseText += "here is the script you can use to automate that workflow.";
      } else {
        responseText += "I can help you build custom workflows or query your integrations. What specific task do you want to accomplish?";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-300 overflow-hidden">
      
      {/* ━━━ LEFT SIDEBAR (History) ━━━ */}
      <div className="w-64 bg-slate-900 border-r border-slate-800/50 flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-slate-800/50">
          <button 
            onClick={() => setMessages([messages[0]])}
            className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Recent Chats</h3>
              <div className="space-y-1">
                {PAST_CHATS.map(chat => (
                  <button key={chat.id} className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors truncate group flex justify-between items-center">
                    <span className="truncate flex items-center gap-2">
                      <MessageSquare size={14} className="text-slate-500 group-hover:text-indigo-400" />
                      {chat.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <Database size={14} className="text-emerald-500" />
            <span>Context: <strong className="text-slate-300">Workspace Data</strong></span>
          </div>
        </div>
      </div>

      {/* ━━━ MAIN CHAT AREA ━━━ */}
      <div className="flex-1 flex flex-col relative bg-[url('/grid.svg')] bg-center bg-repeat bg-[length:40px_40px]">
        
        {/* Header */}
        <div className="h-14 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">DevFort AI <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded ml-2">GPT-4 Turbo</span></h2>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <Settings size={18} />
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-lg mt-1 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-500 to-cyan-500' 
                    : 'bg-slate-800 border border-slate-700'
                }`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-indigo-400" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                    {msg.role === 'user' ? 'You' : 'DevFort AI'}
                  </span>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg shrink-0 bg-slate-800 border border-slate-700 flex items-center justify-center mt-1">
                  <Bot size={16} className="text-indigo-400" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ━━━ INPUT AREA ━━━ */}
        <div className="p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            {messages.length === 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-2">
                {['Analyze Q3 Dataset', 'Write API Endpoint', 'Connect to PostgreSQL'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setInput(s)}
                    className="whitespace-nowrap px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-2"
                  >
                    {s.includes('Analyze') ? <BrainCircuit size={14} /> : s.includes('API') ? <Code size={14} /> : <Database size={14} />}
                    {s}
                  </button>
                ))}
              </div>
            )}
            
            <form 
              onSubmit={handleSend}
              className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all"
            >
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Message DevFort AI..."
                className="w-full bg-transparent p-4 pr-14 text-sm text-white resize-none focus:outline-none min-h-[60px] max-h-[200px]"
                rows={1}
              />
              
              <div className="absolute left-3 bottom-3 flex items-center gap-1">
                <button type="button" className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" title="Attach context">
                  <Paperclip size={16} />
                </button>
                <button type="button" className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" title="Terminal commands">
                  <Terminal size={16} />
                </button>
              </div>

              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">
              AI Chat Assistant can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
