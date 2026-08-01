"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getCookie } from "@/lib/cookies";
import { ThumbsUp, ThumbsDown, CheckCircle, Trash2, Send, MessageSquarePlus, HelpCircle } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

interface Question {
  id: string;
  content: string;
  answer: string | null;
  isAnswered: boolean;
  upvotes: number;
  downvotes: number;
  askerName: string;
  askerEmail: string;
  createdAt: string;
  myVote: 'UP' | 'DOWN' | null;
}

interface QAPanelProps {
  joinCode: string;
  socketRef: React.RefObject<Socket | null>;
  canManage: boolean;
  onQuestionCountChange?: (openCount: number, answeredCount: number) => void;
}

export function QAPanel({ joinCode, socketRef, canManage, onQuestionCountChange }: QAPanelProps) {
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState("");
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [activeTab, setActiveTab] = useState<'open' | 'answered'>('open');

  const myEmail = user?.email ?? getCookie("guest_email") ?? "";
  const myName = user?.name ?? getCookie("guest_name") ?? "Guest";

  // Load questions on mount
  useEffect(() => {
    const sock = socketRef.current;
    if (!sock) return;

    sock.emit('qa:load', { joinCode });

    const handleQuestions = (data: Question[]) => setQuestions(data);
    const handleNewQuestion = (q: Question) => {
      setQuestions((prev) => {
        if (prev.find((p) => p.id === q.id)) return prev;
        return [...prev, { ...q, myVote: null }];
      });
    };
    const handleUpdated = (q: Question) => {
      setQuestions((prev) =>
        prev.map((p) => (p.id === q.id ? { ...q, myVote: p.myVote } : p))
      );
    };
    const handleDeleted = ({ questionId }: { questionId: string }) => {
      setQuestions((prev) => prev.filter((p) => p.id !== questionId));
    };

    sock.on('qa:questions', handleQuestions);
    sock.on('qa:new-question', handleNewQuestion);
    sock.on('qa:question-updated', handleUpdated);
    sock.on('qa:question-deleted', handleDeleted);

    return () => {
      sock.off('qa:questions', handleQuestions);
      sock.off('qa:new-question', handleNewQuestion);
      sock.off('qa:question-updated', handleUpdated);
      sock.off('qa:question-deleted', handleDeleted);
    };
  }, [joinCode, socketRef]);

  // Notify parent of count changes
  useEffect(() => {
    const openCount = questions.filter(q => !q.isAnswered).length;
    const answeredCount = questions.filter(q => q.isAnswered).length;
    onQuestionCountChange?.(openCount, answeredCount);
  }, [questions, onQuestionCountChange]);

  const submitQuestion = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    socketRef.current?.emit('qa:submit', { content: input.trim() });
    setInput("");
  }, [input, socketRef]);

  const vote = useCallback((questionId: string, type: 'UP' | 'DOWN') => {
    const q = questions.find((q) => q.id === questionId);
    if (!q) return;

    // Optimistic update
    setQuestions((prev) =>
      prev.map((p) => {
        if (p.id !== questionId) return p;
        const removing = p.myVote === type;
        const switching = p.myVote && p.myVote !== type;
        return {
          ...p,
          myVote: removing ? null : type,
          upvotes: type === 'UP'
            ? removing ? p.upvotes - 1 : switching ? p.upvotes + 1 : p.upvotes + 1
            : switching ? p.upvotes - 1 : p.upvotes,
          downvotes: type === 'DOWN'
            ? removing ? p.downvotes - 1 : switching ? p.downvotes + 1 : p.downvotes + 1
            : switching ? p.downvotes - 1 : p.downvotes,
        };
      })
    );

    socketRef.current?.emit('qa:vote', { questionId, type });
  }, [questions, socketRef]);

  const answerQuestion = useCallback((questionId: string) => {
    socketRef.current?.emit('qa:answer', {
      questionId,
      answer: answerInput.trim() || undefined,
    });
    setAnsweringId(null);
    setAnswerInput("");
    toast.success("Question marked as answered");
  }, [answerInput, socketRef]);

  const deleteQuestion = useCallback((questionId: string) => {
    socketRef.current?.emit('qa:delete', { questionId });
  }, [socketRef]);

  // Sort: by net votes descending
  const sortedQuestions = [...questions].sort(
    (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
  );

  const openQuestions = sortedQuestions.filter((q) => !q.isAnswered);
  const answeredQuestions = sortedQuestions.filter((q) => q.isAnswered);
  const displayed = activeTab === 'open' ? openQuestions : answeredQuestions;

  return (
    <div className="flex flex-col h-full bg-ink-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 hidden md:block">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-primary-400" />
          <h3 className="font-semibold text-white text-sm">Q&A</h3>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{openQuestions.length} open · {answeredQuestions.length} answered</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 shrink-0">
        <button
          onClick={() => setActiveTab('open')}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition flex items-center justify-center gap-1.5",
            activeTab === 'open'
              ? "text-white border-b-2 border-primary-500 bg-white/5"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          Open
          {openQuestions.length > 0 && (
            <span className="bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px]">
              {openQuestions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('answered')}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition flex items-center justify-center gap-1.5",
            activeTab === 'answered'
              ? "text-white border-b-2 border-success-500 bg-white/5"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          Answered
          {answeredQuestions.length > 0 && (
            <span className="bg-success-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px]">
              {answeredQuestions.length}
            </span>
          )}
        </button>
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <MessageSquarePlus size={24} className="text-white/30" />
            </div>
            <p className="text-xs text-gray-400">
              {activeTab === 'open'
                ? "No questions yet. Be the first to ask!"
                : "No answered questions yet."}
            </p>
          </div>
        ) : (
          displayed.map((q) => (
            <div
              key={q.id}
              className={cn(
                "rounded-xl p-3 border transition-all",
                q.isAnswered
                  ? "bg-success-900/10 border-success-500/30"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              )}
            >
              {/* Question header with author */}
              <div className="flex items-start gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-600/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-medium text-primary-400">
                    {q.askerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-snug">{q.content}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {q.askerName} · {formatRelative(q.createdAt)}
                  </p>
                </div>
              </div>

              {/* Answer */}
              {q.isAnswered && q.answer && (
                <div className="mt-2 pt-2 border-t border-success-500/20 ml-8">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle size={10} className="text-success-400" />
                    <p className="text-[10px] text-success-400 font-medium">Answer</p>
                  </div>
                  <p className="text-sm text-white/80">{q.answer}</p>
                </div>
              )}

              {/* Inline answer form */}
              {answeringId === q.id && (
                <div className="mt-3 ml-8">
                  <textarea
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Type your answer (optional — leave empty to just mark as answered)"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-success-500 focus:border-success-500 resize-none placeholder:text-gray-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => answerQuestion(q.id)}
                      className="flex-1 text-xs bg-success-600 hover:bg-success-500 text-white rounded-lg py-1.5 transition font-medium"
                    >
                      {answerInput.trim() ? "Answer & Mark Done" : "Mark as Answered"}
                    </button>
                    <button
                      onClick={() => { setAnsweringId(null); setAnswerInput(""); }}
                      className="text-xs text-gray-400 hover:text-white px-3 py-1.5 transition hover:bg-white/5 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Actions row */}
              <div className="flex items-center gap-2 mt-3 ml-8">
                {/* Upvote */}
                <button
                  onClick={() => vote(q.id, 'UP')}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition font-medium",
                    q.myVote === 'UP'
                      ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                      : "text-gray-400 hover:text-primary-300 hover:bg-primary-500/10 border border-transparent"
                  )}
                >
                  <ThumbsUp size={13} className={q.myVote === 'UP' ? "fill-primary-400" : ""} />
                  <span>{q.upvotes}</span>
                </button>

                {/* Downvote */}
                <button
                  onClick={() => vote(q.id, 'DOWN')}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition font-medium",
                    q.myVote === 'DOWN'
                      ? "bg-danger-500/20 text-danger-300 border border-danger-500/30"
                      : "text-gray-400 hover:text-danger-300 hover:bg-danger-500/10 border border-transparent"
                  )}
                >
                  <ThumbsDown size={13} className={q.myVote === 'DOWN' ? "fill-danger-400" : ""} />
                  <span>{q.downvotes}</span>
                </button>

                <div className="flex-1" />

                {/* Host/co-host actions */}
                {canManage && !q.isAnswered && answeringId !== q.id && (
                  <button
                    onClick={() => setAnsweringId(q.id)}
                    className="flex items-center gap-1.5 text-xs text-success-400 hover:text-success-300 px-2 py-1 rounded-lg hover:bg-success-500/10 transition font-medium"
                  >
                    <CheckCircle size={13} />
                    Answer
                  </button>
                )}

                {canManage && (
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="text-xs text-gray-500 hover:text-danger-400 p-1.5 rounded-lg hover:bg-danger-500/10 transition"
                    title="Delete question"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit question input */}
      <form onSubmit={submitQuestion} className="px-4 py-3 border-t border-white/10 shrink-0 bg-ink-900">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full border border-white/10 bg-white/5 text-white placeholder:text-gray-500 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-300 disabled:opacity-30 disabled:hover:text-primary-400 p-1.5 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}