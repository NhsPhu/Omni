import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Avatar, Badge, Spin, Typography, Space } from 'antd';
import { Send, Search, Store, User, MessageCircle } from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { format } from 'date-fns';

const { Text, Title } = Typography;

export default function ChatInbox() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isConnected = useRef(false);

  const { shopId } = useAuthStore();

  useEffect(() => {
    fetchRooms();
    connectWebSocket();
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
      markAsRead(activeRoom.id);
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.get('/chat/rooms/shop');
      setRooms(res.data.content);
      if (res.data.content.length > 0 && !activeRoom) {
        setActiveRoom(res.data.content[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chat/rooms/${roomId}/messages`);
      // Backend returns ordered by desc, so we reverse it to display oldest first
      setMessages(res.data.content.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markAsRead = async (roomId: string) => {
    try {
      await api.patch(`/chat/rooms/${roomId}/read`, { readerType: 'SHOP' });
      // Update local unread count
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, unreadCount: 0 } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const connectWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/chat'),
      reconnectDelay: 5000,
      onConnect: () => {
        isConnected.current = true;
        client.subscribe(`/shop/${shopId}/queue/messages`, (msg) => {
          const newMessage = JSON.parse(msg.body);
          setMessages(prev => [...prev, newMessage]);
          fetchRooms();
        });
      },
      onDisconnect: () => { isConnected.current = false; },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        isConnected.current = false;
      },
    });
    client.activate();
    stompClient.current = client;
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !activeRoom) return;
    if (!stompClient.current || !isConnected.current) return;

    const payload = {
      roomId: activeRoom.id,
      senderId: shopId,
      senderType: 'SHOP',
      receiverId: activeRoom.userId,
      content: messageInput
    };

    stompClient.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload)
    });
    
    // Optimistic UI update
    const optimisticMessage = {
      id: Date.now().toString(),
      roomId: activeRoom.id,
      senderId: shopId,
      senderType: 'SHOP',
      content: messageInput,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageInput('');
  };

  return (
    <div className="h-[calc(100vh-120px)] animate-fade-in flex gap-6">
      {/* Sidebar: Room List */}
      <Card className="w-1/3 h-full border-0 rounded-3xl shadow-sm flex flex-col" styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}>
        <div className="p-6 border-b border-gray-100">
          <Title level={4} className="!m-0 !font-extrabold text-gray-900 tracking-tight">Tin nhắn</Title>
          <Input 
            placeholder="Tìm kiếm khách hàng..." 
            prefix={<Search size={16} className="text-gray-400" />}
            className="mt-4 rounded-xl"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loadingRooms ? (
            <div className="flex justify-center p-8"><Spin /></div>
          ) : rooms.length === 0 ? (
            <div className="text-center p-8 text-gray-400">Không có tin nhắn nào</div>
          ) : (
            rooms.map(room => (
              <div 
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`p-3 mb-2 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-3 ${activeRoom?.id === room.id ? 'bg-primary/5 border border-primary/10 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
              >
                <Badge count={room.unreadCount} size="small">
                  <Avatar icon={<User size={18} />} className={`${activeRoom?.id === room.id ? 'bg-primary' : 'bg-gray-300'}`} />
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-gray-900 truncate pr-2">{room.userName}</span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {room.lastMessageAt ? format(new Date(room.lastMessageAt), 'HH:mm') : ''}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{room.lastMessage || 'Bắt đầu trò chuyện...'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Main: Chat Window */}
      <Card className="flex-1 h-full border-0 rounded-3xl shadow-sm flex flex-col" styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}>
        {activeRoom ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-sm z-10 relative">
              <Avatar icon={<User size={18} />} className="bg-primary" />
              <div>
                <div className="font-bold text-gray-900">{activeRoom.userName}</div>
                <div className="text-xs text-secondary font-medium">Đang trực tuyến</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAF9]">
              {loadingMessages ? (
                <div className="flex justify-center p-8"><Spin /></div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, idx) => {
                    const isShop = msg.senderType === 'SHOP';
                    return (
                      <div key={msg.id || idx} className={`flex items-end gap-2 ${isShop ? 'justify-end' : 'justify-start'}`}>
                        {/* Avatar USER (left side) */}
                        {!isShop && (
                          <Avatar size={28} icon={<User size={14} />} className="bg-gray-300 shrink-0 mb-1" />
                        )}
                        <div className="flex flex-col max-w-[70%]">
                          <span className={`text-[10px] font-medium mb-1 ${isShop ? 'text-right text-gold' : 'text-left text-gray-400'}`}>
                            {isShop ? 'Shop ✦' : (activeRoom?.userName || 'Khách')}
                          </span>
                          <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${isShop
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                          }`}>
                            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                            <div className={`text-[10px] mt-1 text-right ${isShop ? 'text-gray-400' : 'text-gray-400'}`}>
                              {format(new Date(msg.createdAt), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                        {/* Avatar SHOP (right side) */}
                        {isShop && (
                          <Avatar size={28} icon={<Store size={14} />} className="bg-primary shrink-0 mb-1" />
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-xl rounded-b-3xl flex gap-2 items-center z-10 relative">
              <Input
                placeholder="Nhập tin nhắn..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onPressEnter={sendMessage}
                size="large"
                className="rounded-xl border-gray-200 hover:border-gold focus:border-gold focus:ring-1 focus:ring-gold"
              />
              <Button 
                type="primary" 
                size="large" 
                icon={<Send size={18} />} 
                onClick={sendMessage}
                className="rounded-xl bg-primary hover:bg-gray-800 shadow-sm px-6 border-0"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle size={48} className="mb-4 text-gray-300" strokeWidth={1.5} />
            <Text type="secondary">Chọn một khách hàng để bắt đầu trò chuyện</Text>
          </div>
        )}
      </Card>
    </div>
  );
}
