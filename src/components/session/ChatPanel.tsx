"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { formatRelative } from "@/lib/utils";
import { Send } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (content: string) => void;
  chatEnabled?: boolean;
}

export function ChatPanel({ messages, onSend, chatEnabled = true }: ChatPanelProps) {
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 hidden md:block">
        <h3 className="font-semibold text-white text-sm">Chat</h3>
        <p className="text-xs text-gray-400">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400 mt-8">
            No messages yet. Say hello! 👋
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderEmail === user?.email;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && (
                  <span className="text-xs text-gray-400 mb-1">
                    {msg.senderName}
                  </span>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm border ${
                    isMe
                      ? "bg-primary-600/20 border-primary-500/30 text-white rounded-tr-sm"
                      : "bg-white/5 border-white/5 text-gray-100 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {formatRelative(msg.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — disabled when chat is turned off */}
      {chatEnabled ? (
        <form onSubmit={handleSend} className="px-4 py-3 border-t border-white/10">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full border border-white/10 bg-white/5 text-white placeholder:text-gray-500 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 disabled:opacity-30 disabled:hover:text-primary-500 p-1.5"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      ) : (
        <div className="px-4 py-4 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">Chat has been disabled by the host</p>
        </div>
      )}
    </div>
  );
}