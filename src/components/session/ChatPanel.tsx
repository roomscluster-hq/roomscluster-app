"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage, ChatMention } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { getCookie } from "@/lib/cookies";
import { formatRelative } from "@/lib/utils";
import { Send, Smile, Trash2, Reply, X } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (content: string, replyToId?: string, mentions?: ChatMention[]) => void;
  onDeleteMessage?: (messageId: string) => void;
  chatEnabled?: boolean;
  canManage?: boolean;
  /** Scrolls to and briefly highlights this message once, e.g. after opening the panel from a toast notification. */
  scrollToMessageId?: string | null;
  onScrolledToMessage?: () => void;
  /** Live, currently-connected participants — the @-mention dropdown's candidate list. */
  participants?: ChatMention[];
}

function replySnippet(content: string, max = 100) {
  return content.length > max ? `${content.slice(0, max)}…` : content;
}

// A confirmed mention is stored inline in the message text as `@[Name]` —
// an unambiguous marker distinct from someone just typing a literal `@`.
const MENTION_MARKER_RE = /@\[([^\]]+)\]/g;

function renderMessageContent(content: string) {
  const pattern = new RegExp(MENTION_MARKER_RE);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <span
        key={`mention-${key++}`}
        className="inline-block px-1 rounded bg-primary-500/25 text-primary-200 font-medium"
      >
        @{match[1]}
      </span>,
    );
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  return parts;
}

export function ChatPanel({
  messages,
  onSend,
  onDeleteMessage,
  chatEnabled = true,
  canManage = false,
  scrollToMessageId,
  onScrolledToMessage,
  participants = [],
}: ChatPanelProps) {
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState<{ anchor: number; text: string } | null>(null);
  const [mentionHighlight, setMentionHighlight] = useState(0);
  const [confirmedMentions, setConfirmedMentions] = useState<ChatMention[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const myEmail = user?.email ?? getCookie("guest_email") ?? "";

  const mentionCandidates = mentionQuery
    ? participants
        .filter((p) => p.name.toLowerCase().includes(mentionQuery.text.toLowerCase()))
        .slice(0, 6)
    : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Jump to a specific message (e.g. opened from a toast notification) and
  // briefly highlight it, then clear the request so it doesn't re-trigger.
  useEffect(() => {
    if (!scrollToMessageId) return;
    const el = messageRefs.current.get(scrollToMessageId);
    if (!el) {
      onScrolledToMessage?.();
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedMessageId(scrollToMessageId);
    const clearHighlight = setTimeout(() => setHighlightedMessageId(null), 1500);
    onScrolledToMessage?.();
    return () => clearTimeout(clearHighlight);
  }, [scrollToMessageId, onScrolledToMessage]);

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
    const trimmed = input.trim();
    if (!trimmed) return;
    // Only send mentions whose `@[Name]` marker is still actually present —
    // the user may have edited or deleted it after selecting it.
    const mentionsInContent = confirmedMentions.filter((m) =>
      trimmed.includes(`@[${m.name}]`),
    );
    onSend(trimmed, replyingTo?.id, mentionsInContent.length > 0 ? mentionsInContent : undefined);
    setInput("");
    setReplyingTo(null);
    setConfirmedMentions([]);
    setMentionQuery(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInput(value);

    const cursor = e.target.selectionStart ?? value.length;
    const uptoCursor = value.slice(0, cursor);
    const atIndex = uptoCursor.lastIndexOf("@");

    if (atIndex === -1 || (atIndex > 0 && !/\s/.test(uptoCursor[atIndex - 1]))) {
      setMentionQuery(null);
      return;
    }

    const afterAt = uptoCursor.slice(atIndex + 1);
    if (/\s/.test(afterAt)) {
      setMentionQuery(null);
      return;
    }

    setMentionQuery({ anchor: atIndex, text: afterAt });
    setMentionHighlight(0);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mentionQuery || mentionCandidates.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMentionHighlight((i) => (i + 1) % mentionCandidates.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMentionHighlight((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      selectMention(mentionCandidates[mentionHighlight]);
    } else if (e.key === "Escape") {
      setMentionQuery(null);
    }
  }

  function selectMention(candidate: ChatMention) {
    if (!mentionQuery) return;
    const marker = `@[${candidate.name}] `;
    const tokenEnd = mentionQuery.anchor + 1 + mentionQuery.text.length;
    const before = input.slice(0, mentionQuery.anchor);
    const after = input.slice(tokenEnd);
    const newValue = `${before}${marker}${after}`;

    setInput(newValue);
    setConfirmedMentions((prev) =>
      prev.some((m) => m.email === candidate.email) ? prev : [...prev, candidate],
    );
    setMentionQuery(null);

    requestAnimationFrame(() => {
      const pos = before.length + marker.length;
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(pos, pos);
    });
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
                ref={(el) => {
                  if (el) messageRefs.current.set(msg.id, el);
                  else messageRefs.current.delete(msg.id);
                }}
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
                  {/* Message actions — visible on hover */}
                  {hoveredMessageId === msg.id && (
                    <div className={`flex items-center gap-0.5 ${isMe ? 'order-first' : 'order-last'}`}>
                      {canManage && (
                        <button
                          onClick={() => onDeleteMessage?.(msg.id)}
                          className="p-1 text-danger-400 hover:text-danger-300 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setReplyingTo(msg);
                          inputRef.current?.focus();
                        }}
                        className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                        title="Reply"
                      >
                        <Reply size={12} />
                      </button>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm border transition-shadow ${
                      isMe
                        ? "bg-primary-600/20 border-primary-500/30 text-white rounded-tr-sm"
                        : "bg-white/5 border-white/5 text-gray-100 rounded-tl-sm"
                    } ${
                      highlightedMessageId === msg.id
                        ? "ring-2 ring-primary-400/70"
                        : ""
                    }`}
                  >
                    {msg.replyTo && (
                      <div className="mb-1.5 pl-2 border-l-2 border-white/20 text-xs text-gray-400">
                        <p className="font-medium text-gray-300">{msg.replyTo.senderName}</p>
                        <p className="truncate">{msg.replyTo.contentSnippet}</p>
                      </div>
                    )}
                    {renderMessageContent(msg.content)}
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
          {/* Replying-to indicator */}
          {replyingTo && (
            <div className="flex items-start justify-between gap-2 mb-2 pl-2 pr-1.5 py-1.5 rounded-lg bg-white/5 border-l-2 border-primary-500">
              <div className="min-w-0 text-xs text-gray-400">
                <p className="font-medium text-gray-300">
                  Replying to {replyingTo.senderName}
                </p>
                <p className="truncate">{replySnippet(replyingTo.content)}</p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="shrink-0 p-1 text-gray-400 hover:text-gray-200 transition-colors"
                title="Cancel reply"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Emoji picker - portal to body to avoid overflow clipping */}
          {showEmojiPicker && (
            <div
              ref={pickerRef}
              className="fixed bottom-20 right-4 md:right-0 md:absolute md:bottom-full md:mb-2 z-100"
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
              {/* @-mention dropdown */}
              {mentionQuery && mentionCandidates.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-white/10 bg-ink-800 shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                  {mentionCandidates.map((p, i) => (
                    <button
                      key={p.email}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectMention(p);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                        i === mentionHighlight
                          ? "bg-primary-600/20 text-white"
                          : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <span className="font-medium">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onBlur={() => setMentionQuery(null)}
                placeholder="Type a message... (@ to mention)"
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
