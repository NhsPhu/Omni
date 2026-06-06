"use client";
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Store, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useChatStore } from '@/store/chatStore';
import { format } from 'date-fns';

export default function ChatWidget() {
  const { user, token } = useAuthStore();
  const { isWidgetOpen, activeRoomId, toggleWidget, setActiveRoom, contextMessage } = useChatStore();
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'LIST' | 'CHAT'>('LIST'); // LIST of rooms or inside a CHAT
  const [activeRoomData, setActiveRoomData] = useState<any>(null);
  
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isConnected = useRef(false);

  useEffect(() => {
    if (token && user) {
      fetchRooms();
      connectWebSocket();
    } else {
      // User logged out — clear all chat data
      setRooms([]);
      setMessages([]);
      setActiveRoomData(null);
      setView('LIST');
      if (stompClient.current) {
        stompClient.current.deactivate();
        isConnected.current = false;
        stompClient.current = null;
      }
    }
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
        isConnected.current = false;
      }
    };
  }, [token, user?.id]); // dep on user.id so switching accounts also triggers

  useEffect(() => {
    if (activeRoomId) {
      setView('CHAT');
      const room = rooms.find(r => r.id === activeRoomId);
      if (room) {
        setActiveRoomData(room);
        fetchMessages(activeRoomId);
      } else {
        // Might be a newly created room, let's fetch rooms again
        fetchRooms().then((newRooms) => {
          const found = newRooms.find((r: any) => r.id === activeRoomId);
          if (found) {
            setActiveRoomData(found);
            fetchMessages(activeRoomId);
          }
        });
      }
    } else {
      setView('LIST');
      setActiveRoomData(null);
    }
  }, [activeRoomId]);

  useEffect(() => {
    // If contextMessage is present and we are in chat view, pre-fill it
    if (contextMessage && activeRoomData && view === 'CHAT') {
      setMessageInput(contextMessage);
      useChatStore.setState({ contextMessage: null });
    }
  }, [contextMessage, activeRoomData, view]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, view]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchRooms = async () => {
    if (!token) return [];
    try {
      const res = await api.get('/chat/rooms/me');
      setRooms(res.data.content);
      return res.data.content;
    } catch (e) {
      console.error("Failed to fetch rooms", e);
      return [];
    }
  };

  const fetchMessages = async (roomId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/chat/rooms/${roomId}/messages`);
      setMessages(res.data.content.reverse());
      // Mark as read
      await api.patch(`/chat/rooms/${roomId}/read`, { readerType: 'USER' });
      // Update unread count locally
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, unreadCount: 0 } : r));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (isConnected.current) return; // Already connected

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/chat'),
      reconnectDelay: 5000,
      onConnect: () => {
        isConnected.current = true;
        client.subscribe(`/user/${user?.id}/queue/messages`, (msg) => {
          const newMessage = JSON.parse(msg.body);
          setMessages(prev => [...prev, newMessage]);
          fetchRooms();
        });
      },
      onDisconnect: () => {
        isConnected.current = false;
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        isConnected.current = false;
      },
    });

    client.activate();
    stompClient.current = client;
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !activeRoomData || !user) return;
    if (!stompClient.current || !isConnected.current) {
      console.warn('WebSocket not connected yet');
      return;
    }

    const payload = {
      roomId: activeRoomData.id,
      senderId: user.id,
      senderType: 'USER',
      receiverId: activeRoomData.shopId,
      content: messageInput
    };

    stompClient.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload)
    });
    
    // Optimistic
    const optimisticMessage = {
      id: Date.now().toString(),
      roomId: activeRoomData.id,
      senderId: user.id,
      senderType: 'USER',
      content: messageInput,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageInput('');
  };

  if (!user || !token) return null; // Don't show if not logged in

  const totalUnread = rooms.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

  return (
    <>
      {/* Floating Button */}
      {!isWidgetOpen && (
        <button
          onClick={toggleWidget}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50"
          style={{ background: 'var(--grad-gold)' }}
        >
          <MessageCircle className="w-6 h-6 text-gray-900" />
          {totalUnread > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
              {totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isWidgetOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[550px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-100 overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }}>
            <div className="flex items-center gap-3">
              {view === 'CHAT' && (
                <button onClick={() => { setView('LIST'); setActiveRoom(null); }} className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                </button>
              )}
              <h3 className="font-bold text-white text-lg font-[family-name:var(--font-heading)] tracking-wide">
                {view === 'CHAT' ? activeRoomData?.shopName : 'Tin nhắn'}
              </h3>
            </div>
            <button onClick={toggleWidget} className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
            {view === 'LIST' ? (
              <div className="p-2">
                {rooms.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20 text-sm">Chưa có cuộc trò chuyện nào</div>
                ) : (
                  rooms.map(room => (
                    <div 
                      key={room.id} 
                      onClick={() => setActiveRoom(room.id)}
                      className="p-3 bg-white rounded-xl mb-2 flex items-center gap-3 cursor-pointer hover:shadow-sm border border-gray-50"
                    >
                      <div className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #1f2937, #111827)" }}>
                        <Store className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-sm truncate">{room.shopName}</span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {room.lastMessageAt ? format(new Date(room.lastMessageAt), 'HH:mm') : ''}
                          </span>
                        </div>
                        <div className={`text-xs truncate ${room.unreadCount > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                          {room.lastMessage || 'Bắt đầu trò chuyện...'}
                        </div>
                      </div>
                      {room.unreadCount > 0 && (
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex justify-center mt-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderType === 'USER';
                      return (
                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isMe ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}
                               style={isMe ? { background: "linear-gradient(135deg, #1f2937, #111827)" } : {}}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer (Input) */}
          {view === 'CHAT' && (
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full px-4 py-2.5 text-sm outline-none focus:bg-gray-200 transition-colors border border-transparent focus:border-gray-300"
              />
              <button 
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95"
                style={{ background: "linear-gradient(135deg, #1f2937, #111827)", color: "white" }}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          )}

        </div>
      )}
    </>
  );
}
