'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Send, Maximize2, Minimize2, Edit3, MessageSquare, Globe } from 'lucide-react';
import GlassCard from './GlassCard';

export default function FloatingAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'chat' | 'write'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am your DevForge AI Assistant. How can I help you today?' }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assistantRef.current && !assistantRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: mode === 'chat' 
          ? `I understand you said: "${currentInput}". As an AI, I'm here to assist you with platform navigation, analytics, and settings.` 
          : `Here is a drafted content based on "${currentInput}":\n\nWelcome to the future of digital solutions. We provide cutting edge AI technology to scale your business.`
      }]);
    }, 1000);
  };

  return (
    <>
      {/* The Floating Trigger Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center cursor-pointer transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : ''}`}
      >
        <Globe className="w-7 h-7 animate-spin-slow text-white" />
      </motion.button>

      {/* The AI Assistant Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={assistantRef}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className={`fixed bottom-6 right-6 z-50 flex flex-col ${isExpanded ? 'w-[80vw] h-[80vh] max-w-4xl max-h-[800px]' : 'w-[380px] h-[600px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]'}`}
          >
            <GlassCard className="flex-1 flex flex-col border border-white/10 bg-black/80 backdrop-blur-3xl shadow-2xl overflow-hidden rounded-2xl relative">
              
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/20 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">DevForge AI</h3>
                    <p className="text-[10px] text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-2 p-2 gap-2 bg-black/40 border-b border-white/5">
                <button 
                  onClick={() => setMode('chat')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'chat' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-white/50 hover:bg-white/5'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> General Chat
                </button>
                <button 
                  onClick={() => setMode('write')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'write' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-white/50 hover:bg-white/5'}`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> AI Writer Mode
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-br-none' 
                        : 'bg-white/10 text-white/90 rounded-bl-none border border-white/5'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-black/60 border-t border-white/10">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={mode === 'chat' ? "Ask me anything..." : "Describe what you want to write..."}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:hover:bg-primary"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-white/30 font-mono">
                  <span>Powered by DevForge AI Engine</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
