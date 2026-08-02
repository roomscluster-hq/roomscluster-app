"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getCookie } from "@/lib/cookies";
import { BarChart3, Plus, X, CheckCircle, Clock, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

interface PollOption {
  id: string;
  text: string;
  order: number;
  voteCount: number;
  percentage: number;
  isMyVote: boolean;
}

interface Poll {
  id: string;
  question: string;
  type: 'SINGLE' | 'MULTIPLE';
  status: 'ACTIVE' | 'CLOSED';
  showResults: boolean;
  closesAt: string | null;
  createdAt: string;
  totalVoters: number;
  hasVoted: boolean;
  options: PollOption[];
}

interface PollPanelProps {
  joinCode: string;
  socketRef: React.RefObject<Socket | null>;
  canManage: boolean;
  onPollCountChange?: (count: number) => void;
}

// ── Create Poll Form ────────────────────────────────────
function CreatePollForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState<'SINGLE' | 'MULTIPLE'>('SINGLE');
  const [options, setOptions] = useState(["", ""]);
  const [showResults, setShowResults] = useState(true);
  const [autoClose, setAutoClose] = useState(false);
  const [closesInSeconds, setClosesInSeconds] = useState(60);

  function addOption() {
    if (options.length < 10) setOptions([...options, ""]);
  }

  function removeOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  function updateOption(index: number, value: string) {
    setOptions(options.map((o, i) => (i === index ? value : o)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    if (validOptions.length < 2) {
      toast.error("Please add at least 2 options");
      return;
    }
    onSubmit({
      question: question.trim(),
      type,
      options: validOptions,
      showResults,
      closesInSeconds: autoClose ? closesInSeconds : undefined,
    });
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Create Poll</h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Question */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Question *</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question..."
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-gray-500"
          />
        </div>

        {/* Type */}
        <div className="flex gap-2">
          {(['SINGLE', 'MULTIPLE'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "flex-1 text-xs py-1.5 rounded-lg border transition font-medium",
                type === t
                  ? "bg-primary-600/20 border-primary-500/50 text-primary-600"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              )}
            >
              {t === 'SINGLE' ? 'Single choice' : 'Multiple choice'}
            </button>
          ))}
        </div>

        {/* Options */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Options *</label>
          <div className="space-y-1.5">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-gray-500"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-gray-500 hover:text-danger-400 transition shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-xs text-primary-600 hover:text-primary-300 flex items-center gap-1 transition"
            >
              <Plus size={12} /> Add option
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showResults}
              onChange={(e) => setShowResults(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
            />
            <span className="text-xs text-gray-300">Show results to participants</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoClose}
              onChange={(e) => setAutoClose(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
            />
            <span className="text-xs text-gray-300">Auto-close after</span>
            {autoClose && (
              <select
                value={closesInSeconds}
                onChange={(e) => setClosesInSeconds(Number(e.target.value))}
                className="bg-white/5 border border-white/10 text-white text-xs rounded px-2 py-0.5 focus:outline-none"
              >
                <option value={30} className="text-black">30s</option>
                <option value={60} className="text-black">1m</option>
                <option value={120} className="text-black">2m</option>
                <option value={300} className="text-black">5m</option>
                <option value={600} className="text-black">10m</option>
              </select>
            )}
          </label>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium py-2 rounded-lg transition"
          >
            Launch Poll
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 text-xs text-gray-400 hover:text-white py-2 rounded-lg hover:bg-white/5 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Poll Card ───────────────────────────────────────────
function PollCard({
  poll,
  canManage,
  onVote,
  onClose,
  onDelete,
}: {
  poll: Poll;
  canManage: boolean;
  onVote: (pollId: string, optionIds: string[]) => void;
  onClose: (pollId: string) => void;
  onDelete: (pollId: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const isClosed = poll.status === 'CLOSED';
  const showResults = poll.showResults || isClosed || poll.hasVoted;
  const canVote = !poll.hasVoted && !isClosed;

  function toggleOption(optionId: string) {
    if (poll.type === 'SINGLE') {
      setSelected([optionId]);
    } else {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    }
  }

  function handleVote() {
    if (selected.length === 0) return;
    onVote(poll.id, selected);
    setSelected([]);
  }

  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3",
      isClosed ? "bg-white/3 border-white/5" : "bg-white/5 border-white/10"
    )}>
      {/* Poll header */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
              isClosed
                ? "bg-white/10 text-gray-600"
                : "bg-primary-500/20 text-primary-600"
            )}>
              {isClosed ? "Closed" : "Live"}
            </span>
            <span className="text-[10px] text-gray-500">
              {poll.type === 'SINGLE' ? 'Single choice' : 'Multiple choice'}
            </span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Users size={10} /> {poll.totalVoters} voted
            </span>
          </div>
          <p className="text-sm font-medium text-white mt-1 leading-snug">{poll.question}</p>
        </div>

        {canManage && (
          <div className="flex items-center gap-1 shrink-0">
            {!isClosed && (
              <button
                onClick={() => onClose(poll.id)}
                className="text-[10px] text-warning-500 hover:text-warning-100 px-2 py-1 rounded hover:bg-warning-500/10 transition flex items-center gap-1"
              >
                <Clock size={10} /> Close
              </button>
            )}
            <button
              onClick={() => onDelete(poll.id)}
              className="text-gray-500 hover:text-danger-400 p-1 rounded hover:bg-danger-500/10 transition"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {poll.options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const isMyVote = opt.isMyVote;

          return (
            <div key={opt.id}>
              {canVote ? (
                <button
                  onClick={() => toggleOption(opt.id)}
                  className={cn(
                    "w-full text-left text-xs px-3 py-2 rounded-lg border transition",
                    isSelected
                      ? "bg-primary-600/20 border-primary-500/50 text-primary-600"
                      : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center",
                      poll.type === 'SINGLE' ? 'rounded-full' : 'rounded',
                      isSelected ? "border-primary-500 bg-primary-500" : "border-white/30"
                    )}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    {opt.text}
                  </div>
                </button>
              ) : (
                <div className={cn(
                  "relative rounded-lg border overflow-hidden",
                  isMyVote ? "border-primary-500/50" : "border-white/10"
                )}>
                  {/* Progress bar */}
                  {showResults && (
                    <div
                      className={cn(
                        "absolute inset-0 transition-all duration-500",
                        isMyVote ? "bg-primary-600/20" : "bg-white/5"
                      )}
                      style={{ width: `${opt.percentage}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      {isMyVote && <CheckCircle size={12} className="text-primary-600 shrink-0" />}
                      <span className={cn(
                        "text-xs",
                        isMyVote ? "text-primary-600" : "text-gray-300"
                      )}>
                        {opt.text}
                      </span>
                    </div>
                    {showResults && (
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {opt.percentage}%
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Vote button */}
      {canVote && (
        <button
          onClick={handleVote}
          disabled={selected.length === 0}
          className="w-full text-xs bg-primary-600 hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition"
        >
          {poll.type === 'MULTIPLE' && selected.length > 1
            ? `Submit ${selected.length} votes`
            : 'Submit vote'}
        </button>
      )}

      {!canVote && !showResults && !isClosed && (
        <p className="text-xs text-gray-500 text-center">
          Results will be shown when the poll closes
        </p>
      )}
    </div>
  );
}

// ── Main Poll Panel ─────────────────────────────────────
export function PollPanel({ joinCode, socketRef, canManage, onPollCountChange }: PollPanelProps) {
  const { user } = useAuthStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [creating, setCreating] = useState(false);

  const myEmail = user?.email ?? getCookie("guest_email") ?? "";

  // Load polls on mount
  useEffect(() => {
    const sock = socketRef.current;
    if (!sock) return;

    sock.emit('poll:load', { joinCode });

    const handlePolls = (data: Poll[]) => setPolls(data);
    const handleNew = (poll: Poll) => {
      setPolls((prev) => {
        if (prev.find((p) => p.id === poll.id)) return prev;
        return [poll, ...prev];
      });
    };
    const handleUpdated = (poll: Poll) => {
      setPolls((prev) => prev.map((p) => (p.id === poll.id ? poll : p)));
    };
    const handleVoteCount = (data: { pollId: string; totalVoters: number }) => {
      setPolls((prev) =>
        prev.map((p) =>
          p.id === data.pollId ? { ...p, totalVoters: data.totalVoters } : p
        )
      );
    };
    const handleDeleted = ({ pollId }: { pollId: string }) => {
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
    };

    sock.on('poll:polls', handlePolls);
    sock.on('poll:new', handleNew);
    sock.on('poll:updated', handleUpdated);
    sock.on('poll:vote-count', handleVoteCount);
    sock.on('poll:deleted', handleDeleted);

    return () => {
      sock.off('poll:polls', handlePolls);
      sock.off('poll:new', handleNew);
      sock.off('poll:updated', handleUpdated);
      sock.off('poll:vote-count', handleVoteCount);
      sock.off('poll:deleted', handleDeleted);
    };
  }, [joinCode, socketRef]);

  // Notify parent of active poll count
  useEffect(() => {
    const activeCount = polls.filter((p) => p.status === 'ACTIVE').length;
    onPollCountChange?.(activeCount);
  }, [polls, onPollCountChange]);

  const createPoll = useCallback((data: any) => {
    socketRef.current?.emit('poll:create', data);
    setCreating(false);
    toast.success("Poll launched!");
  }, [socketRef]);

  const vote = useCallback((pollId: string, optionIds: string[]) => {
    socketRef.current?.emit('poll:vote', { pollId, optionIds });
    toast.success("Vote submitted!");
  }, [socketRef]);

  const closePoll = useCallback((pollId: string) => {
    socketRef.current?.emit('poll:close', { pollId });
  }, [socketRef]);

  const deletePoll = useCallback((pollId: string) => {
    socketRef.current?.emit('poll:delete', { pollId });
  }, [socketRef]);

  const activePolls = polls.filter((p) => p.status === 'ACTIVE');
  const closedPolls = polls.filter((p) => p.status === 'CLOSED');

  return (
    <div className="flex flex-col h-full bg-ink-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 hidden md:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-primary-400" />
            <h3 className="font-semibold text-white text-sm">Polls</h3>
          </div>
          {canManage && !creating && (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1 text-xs text-primary-100 hover:text-primary-600 transition"
            >
              <Plus size={14} /> New Poll
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {activePolls.length} active · {closedPolls.length} closed
        </p>
      </div>

      {/* Mobile header */}
      <div className="md:hidden px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <span className="text-xs text-gray-400">{activePolls.length} active · {closedPolls.length} closed</span>
        {canManage && !creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition"
          >
            <Plus size={14} /> New Poll
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Create form */}
        {creating && (
          <div className="border-b border-white/10">
            <CreatePollForm
              onSubmit={createPoll}
              onCancel={() => setCreating(false)}
            />
          </div>
        )}

        {polls.length === 0 && !creating ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <BarChart3 size={24} className="text-white/30" />
            </div>
            <p className="text-xs text-gray-400">
              {canManage
                ? 'No polls yet. Create one to engage your audience!'
                : 'No polls yet. Wait for the host to launch one.'}
            </p>
            {canManage && (
              <button
                onClick={() => setCreating(true)}
                className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg transition font-medium"
              >
                Create First Poll
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {/* Active polls first */}
            {activePolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                canManage={canManage}
                onVote={vote}
                onClose={closePoll}
                onDelete={deletePoll}
              />
            ))}

            {/* Closed polls */}
            {closedPolls.length > 0 && (
              <>
                {activePolls.length > 0 && (
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex-1 border-t border-white/10" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Closed</span>
                    <div className="flex-1 border-t border-white/10" />
                  </div>
                )}
                {closedPolls.map((poll) => (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    canManage={canManage}
                    onVote={vote}
                    onClose={closePoll}
                    onDelete={deletePoll}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}