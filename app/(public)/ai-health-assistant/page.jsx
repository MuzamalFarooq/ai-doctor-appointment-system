'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Trash2, Copy, CheckCheck, Sparkles, AlertCircle, Activity, Pill, UtensilsCrossed, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/Badge';

// metadata must be in a server component - moved to layout or parent

const QUICK_ACTIONS = [
  { icon: Activity, label: 'Symptom Help', prompt: 'I have a question about my symptoms.' },
  { icon: Pill, label: 'Medicine Info', prompt: 'Can you tell me about a medication I was prescribed?' },
  { icon: UtensilsCrossed, label: 'Diet Advice', prompt: 'I need dietary advice for my health condition.' },
  { icon: Calendar, label: 'Book Appointment', prompt: 'Help me find the right doctor for my condition.' },
];

export default function AIHealthAssistantPage() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: 'Hello! I am your MediConnect AI Health Assistant, powered by GPT-4o. I can help you with:\n\n- Medical questions and symptom information\n- Medication details and interactions\n- Diet and lifestyle advice\n- Finding the right doctor\n- Appointment booking guidance\n\nRemember: I provide **informational guidance only** — always consult a qualified doctor for medical decisions. In emergencies, call **115** immediately.\n\nHow can I help you today?' }]
  );
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (content) => {
    if (!content.trim() || isStreaming) return;
    const userMessage = { id: Date.now().toString(), role: 'user', content: content.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', streaming: true }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: content.trim() }] }),
      });

      if (!res.ok) throw new Error('Chat failed');
      if (!res.body) throw new Error('No stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              accumulated += delta;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m));
            } catch { /* Skip parse errors */ }
          }
        }
      }

      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'I apologize, I encountered an error. Please try again.', streaming: false } : m));
      toast.error('Failed to get response.');
    } finally {
      setIsStreaming(false);
    }
  };

  const copyMessage = async (id, content) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([{ id: '1', role: 'assistant', content: 'Chat cleared! How can I help you today?' }]);
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-sm">MediConnect AI Assistant</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-500">Online • Powered by GPT-4o</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gradient">AI Assistant</Badge>
            <button onClick={clearChat} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors" title="Clear chat">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <strong>Emergency?</strong> Call 115 (Pakistan Emergency) or 1122 (Rescue) immediately. This AI cannot provide emergency assistance.
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 md:space-y-6">
          {messages.map((message) => (
            <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] group ${ message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm'
                }`}>
                  {message.role === 'assistant' ? (
                    <span dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                  ) : message.content}
                  {message.streaming && (
                    <span className="inline-flex gap-1 ml-2">
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }} />
                      ))}
                    </span>
                  )}
                </div>
                {message.role === 'assistant' && message.content && !message.streaming && (
                  <button onClick={() => copyMessage(message.id, message.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    {copiedId === message.id ? <><CheckCheck className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-gray-500 mb-2 text-center">Quick Actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
                <button key={label} onClick={() => sendMessage(prompt)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-all text-sm text-gray-700 dark:text-gray-300 hover:text-primary-700">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Ask me anything about your health... (Press Enter to send)"
                rows={1}
                disabled={isStreaming}
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none max-h-32 disabled:opacity-60"
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="p-3.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isStreaming ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            <Sparkles className="w-3 h-3 inline mr-1" /> AI responses are for informational purposes only. Not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
