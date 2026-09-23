"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import type { ChatMessage } from "@/types";

interface ChatNotificationToastProps {
  message: ChatMessage;
  onReply: (content: string) => void;
  onOpenChat: () => void;
  onDismiss: () => void;
  onTypingChange: (isTyping: boolean) => void;
}

function truncate(content: string, max = 90) {
  return content.length > max ? `${content.slice(0, max).trimEnd()}…` : content;
}

export function ChatNotificationToast({
  message,
  onReply,
  onOpenChat,
  onDismiss,
  onTypingChange,
}: ChatNotificationToastProps) {
  const [replyValue, setReplyValue] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyValue.trim() || sent) return;
    onReply(replyValue.trim());
    setSent(true);
    onTypingChange(false);
    setTimeout(onDismiss, 1200);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpenChat}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpenChat();
      }}
      className="w-80 rounded-xl border border-white/10 bg-ink-800 shadow-xl shadow-black/30 overflow-hidden cursor-pointer"
    >
      <div className="px-3.5 pt-3 pb-2.5">
        <p className="text-xs font-semibold text-white">{message.senderName}</p>
        <p className="text-xs text-gray-300 mt-0.5 line-clamp-2">
          {truncate(message.content)}
        </p>
      </div>

      {sent ? (
        <div className="flex items-center gap-1.5 px-3.5 pb-3 text-xs text-primary-400">
          <Check size={14} /> Sent
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-2.5 pb-2.5"
        >
          <input
            autoFocus
            value={replyValue}
            onChange={(e) => {
              const value = e.target.value;
              setReplyValue(value);
              onTypingChange(value.length > 0);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Reply…"
            className="flex-1 min-w-0 border border-white/10 bg-white/5 text-white placeholder:text-gray-500 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
          />
          <button
            type="submit"
            disabled={!replyValue.trim()}
            className="shrink-0 text-primary-500 hover:text-primary-400 disabled:opacity-30 p-1.5"
            aria-label="Send reply"
          >
            <Send size={15} />
          </button>
        </form>
      )}
    </div>
  );
}
