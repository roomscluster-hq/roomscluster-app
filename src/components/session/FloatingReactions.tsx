"use client";

interface Reaction {
  id: string;
  emoji: string;
  senderName: string;
  x: number;
}

interface FloatingReactionsProps {
  reactions: Reaction[];
}

export function FloatingReactions({ reactions }: FloatingReactionsProps) {
  if (reactions.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute bottom-20 animate-float-up"
          style={{ left: `${reaction.x}%` }}
        >
          <div className="text-4xl drop-shadow-lg">{reaction.emoji}</div>
        </div>
      ))}
    </div>
  );
}
