"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { getCookie } from "@/lib/cookies";
import { formatRelative } from "@/lib/utils";
import { Send, Smile, Trash2 } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  chatEnabled?: boolean;
  canManage?: boolean;
}

export function ChatPanel({
  messages,
  onSend,
  onDeleteMessage,
  chatEnabled = true,
  canManage = false,
}: ChatPanelProps) {
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const myEmail = user?.email ?? getCookie("guest_email") ?? "";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  }

  const handleEmojiSelect = useCallback((emoji: any) => {
    const native = emoji.native;
    setInput((prev) => prev + native);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }, []);

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
            const isMe = msg.senderEmail === myEmail;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {!isMe && (
                  <span className="text-xs text-gray-400 mb-1">
                    {msg.senderName}
                  </span>
                )}
                <div className="flex items-end gap-1">
                  {/* Delete button — host/co-host, on hover */}
                  {canManage && hoveredMessageId === msg.id && (
                    <button
                      onClick={() => onDeleteMessage?.(msg.id)}
                      className={`p-1 text-danger-400 hover:text-danger-300 transition-colors ${isMe ? 'order-first' : 'order-last'}`}
                      title="Delete message"
                    >
                      <Trash2 size={12} />
                    </button>
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

      {/* Input */}
      {chatEnabled ? (
        <div className="px-4 py-3 border-t border-white/10 relative">
          {/* Emoji picker - portal to body to avoid overflow clipping */}
          {showEmojiPicker && (
            <div
              ref={pickerRef}
              className="fixed bottom-20 right-4 md:right-auto md:absolute md:bottom-full md:right-0 md:mb-2 z-100"
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
                previewPosition="none"
                skinTonePosition="none"
                maxFrequentRows={2}
              />
            </div>
          )}

          <form onSubmit={handleSend}>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full border border-white/10 bg-white/5 text-white placeholder:text-gray-500 rounded-xl pl-4 pr-20 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
              />
              {/* Emoji button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className={`absolute right-10 top-1/2 -translate-y-1/2 p-1.5 transition-colors ${
                  showEmojiPicker
                    ? "text-primary-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                title="Add emoji"
              >
                <Smile size={18} />
              </button>
              {/* Send button */}
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
        </div>
      ) : (
        <div className="px-4 py-4 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">Chat has been disabled by the host</p>
        </div>
      )}
    </div>
  );
}
