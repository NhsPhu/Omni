"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import api from '@/lib/axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

export default function AIChatWidget() {
  const { user, token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: 'Xin chào! Tôi là trợ lý AI của OMNI. Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn mua hàng, hoặc giải đáp thắc mắc. Bạn cần giúp gì nào?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen && token && !stompClient.current) {
      initChatSession();
    }
    return () => {
      if (!isOpen && stompClient.current) {
        stompClient.current.deactivate();
        stompClient.current = null;
      }
    };
  }, [isOpen, token]);

  const initChatSession = async () => {
    try {
      const res = await api.post('/ai-chat/sessions');
      const sId = res.data.id;
      setSessionId(sId);

      const msgsRes = await api.get(`/ai-chat/sessions/${sId}/messages`);
      if (msgsRes.data && msgsRes.data.length > 0) {
        const loadedMsgs = msgsRes.data.map((m: any) => ({
          id: m.id,
          role: m.senderType === 'USER' ? 'user' : 'ai',
          content: m.content
        }));
        setMessages(loadedMsgs);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const wsUrl = apiUrl.replace('/api', '/ws/chat');
      const socket = new SockJS(wsUrl);
      const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
      });

      client.onConnect = () => {
        client.subscribe(`/topic/ai-chat/${sId}`, (messageOutput) => {
          const newMsg = JSON.parse(messageOutput.body);
          
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id || Date.now().toString(),
              role: newMsg.senderType === 'USER' ? 'user' : 'ai',
              content: newMsg.content
            }];
          });
          
          if (newMsg.senderType === 'AI') {
            setIsLoading(false);
          }
        });
      };

      client.activate();
      stompClient.current = client;

    } catch (error) {
      console.error("Failed to init AI chat session", error);
    }
  };

  const toggleWidget = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const content = input.trim();
    setInput('');

    if (!token) {
      const userMessage: Message = { id: Date.now().toString(), role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await api.post('/public/ai-chat/anonymous', {
          sessionId: 'anonymous',
          message: content,
        });
        const data = response.data;
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(), role: 'ai',
          content: data.output || data.text || data.message || 'Xin lỗi, tôi không thể trả lời lúc này.',
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (e) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: 'Lỗi kết nối AI.' }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!stompClient.current || !stompClient.current.connected || !sessionId) {
       console.error("WebSocket not connected");
       return;
    }

    const payload = {
      sessionId: sessionId,
      userId: user?.id,
      shopId: null, 
      content: content
    };

    stompClient.current.publish({
      destination: '/app/ai-chat.send',
      body: JSON.stringify(payload)
    });
    
    setIsLoading(true);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleWidget}
          className="fixed bottom-6 left-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
          <Sparkles className="w-6 h-6 text-white relative z-10" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 left-6 w-[360px] h-[550px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl z-50 flex flex-col border border-black/5 overflow-hidden animate-fade-in"
             style={{ boxShadow: '0 20px 40px -10px rgba(99,102,241,0.3)' }}>
          
          <div className="p-4 flex items-center justify-between z-10" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg font-[family-name:var(--font-heading)] tracking-wide">
                  OMNI AI
                </h3>
                <p className="text-white/80 text-[10px]">Trợ lý mua sắm thông minh (Gemini)</p>
              </div>
            </div>
            <button onClick={toggleWidget} className="text-white/70 hover:text-white p-1.5 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAF9]/80">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm border border-indigo-200">
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isUser ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-black/5 rounded-bl-sm overflow-hidden'}`}>
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-a:text-indigo-600 hover:prose-a:text-indigo-700">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({node, ...props}) => {
                              // Detect if the link is a special product link e.g. [Áo thun](product:123:100000)
                              const href = props.href || '';
                              if (href.startsWith('product:')) {
                                 const parts = href.split(':');
                                 const id = parts[1];
                                 const price = parts[2];
                                 return (
                                   <div className="my-3 border border-indigo-100 rounded-xl p-3 flex flex-col gap-2 bg-indigo-50/30 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                                        onClick={() => window.location.href = `/product/${id}`}>
                                     <div className="font-semibold text-indigo-900">{props.children}</div>
                                     {price && <div className="text-red-600 font-bold">{parseInt(price).toLocaleString('vi-VN')} ₫</div>}
                                     <div className="text-xs text-indigo-600 mt-1 flex items-center">Xem chi tiết &rarr;</div>
                                   </div>
                                 );
                              }
                              return <a {...props} target="_blank" rel="noopener noreferrer" />
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm border border-indigo-200">
                  <Bot className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm bg-white text-gray-800 border border-black/5 rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span className="text-xs text-gray-400">AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white/90 backdrop-blur-md border-t border-black/5 flex gap-2 items-center z-10">
            <input
              type="text"
              placeholder="Hỏi AI về sản phẩm..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
              className="flex-1 bg-gray-100/80 text-gray-900 placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white transition-all border border-transparent focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
            />
            <button 
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95 shadow-sm"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", color: "white" }}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
