"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { MessageSquare, Send, User, Search, Loader2 } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function SellerChatPage() {
  const { user, token } = useAuthStore();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [search, setSearch] = useState("");

  const stompClient = useRef<Client | null>(null);
  const isConnected = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
    connectWebSocket();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
        isConnected.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
    }
  }, [activeRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get("/chat/rooms/shop");
      setRooms(res.data.content);
    } catch (error) {
      console.error("Failed to fetch shop rooms", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    setMessagesLoading(true);
    try {
      const res = await api.get(`/chat/rooms/${roomId}/messages`);
      setMessages(res.data.content.reverse());
      await api.patch(`/chat/rooms/${roomId}/read`, { readerType: "SHOP" });
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, shopUnreadCount: 0 } : r)));
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (isConnected.current || !user?.shopId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws/chat"),
      reconnectDelay: 5000,
      onConnect: () => {
        isConnected.current = true;
        // Shop subscribes to their own shop queue
        client.subscribe(`/shop/${user.shopId}/queue/messages`, (msg) => {
          const newMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMessage]);
          fetchRooms(); // refresh rooms to update last message and unread count
        });
      },
      onDisconnect: () => {
        isConnected.current = false;
      },
    });

    client.activate();
    stompClient.current = client;
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !activeRoomId || !user) return;
    if (!stompClient.current || !isConnected.current) return;

    const room = rooms.find((r) => r.id === activeRoomId);
    if (!room) return;

    const payload = {
      roomId: room.id,
      senderId: user.shopId,
      senderType: "SHOP",
      receiverId: room.userId,
      content: messageInput,
    };

    stompClient.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });

    const optimisticMessage = {
      id: Date.now().toString(),
      roomId: room.id,
      senderId: user.shopId,
      senderType: "SHOP",
      content: messageInput,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageInput("");
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const filteredRooms = rooms.filter((r) =>
    (r.userName || "Khách hàng").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center shadow-lg">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tin Nhắn Của Khách</h1>
          <p className="text-text-secondary">Tư vấn và giải đáp thắc mắc cho người mua</p>
        </div>
      </div>

      <div className="flex-1 glass border border-border rounded-2xl overflow-hidden flex shadow-lg">
        {/* Left Panel: Room List */}
        <div className="w-80 border-r border-border flex flex-col bg-surface/50">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-text-muted" /></div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center text-text-muted p-4 text-sm">Chưa có tin nhắn nào</div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`p-3 rounded-xl mb-1 cursor-pointer flex items-center gap-3 transition-colors ${
                    activeRoomId === room.id
                      ? "bg-gold/10 border border-gold/20"
                      : "hover:bg-surface border border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-surface border border-border flex flex-shrink-0 items-center justify-center">
                    <User className="w-5 h-5 text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-bold text-sm text-text-primary truncate">
                        {room.userName || "Khách hàng"}
                      </h4>
                      <span className="text-[10px] text-text-muted whitespace-nowrap">
                        {room.lastMessageAt ? format(new Date(room.lastMessageAt), "HH:mm") : ""}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${room.shopUnreadCount > 0 ? "font-bold text-text-primary" : "text-text-secondary"}`}>
                      {room.lastMessage || "Bắt đầu trò chuyện"}
                    </p>
                  </div>
                  {room.shopUnreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full flex flex-shrink-0 items-center justify-center bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {room.shopUnreadCount}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {activeRoomId && activeRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center gap-3 bg-surface/50 backdrop-blur-md">
                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center">
                  <User className="w-5 h-5 text-text-muted" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">{activeRoom.userName || "Khách hàng"}</h3>
                  <p className="text-xs text-text-secondary">Khách hàng Omni</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messagesLoading ? (
                  <div className="flex justify-center h-full items-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderType === "SHOP";
                      return (
                        <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                              isMe
                                ? "bg-gradient-to-br from-gold to-orange-500 text-white rounded-br-sm"
                                : "bg-surface border border-border text-text-primary rounded-bl-sm"
                            }`}
                          >
                            <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                            <div className={`text-[10px] mt-1 text-right ${isMe ? "text-white/70" : "text-text-muted"}`}>
                              {format(new Date(msg.createdAt), "HH:mm")}
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-surface/50 backdrop-blur-md border-t border-border flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95 shadow-lg bg-gradient-to-br from-gold to-orange-500 text-white"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
