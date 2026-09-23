"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "@/types";
import { ChatNotificationToast } from "@/components/session/ChatNotificationToast";

const CHAT_TOAST_ID = "chat-notification-toast";
const CHAT_TOAST_DURATION = 9000;

// A single reusable toast — a new message while chat is closed replaces
// whatever the previous notification was showing, rather than stacking.
// See useChatToastNotifications for the reasoning.
function showChatToast(
  message: ChatMessage,
  handlers: {
    sendMessage: (content: string, replyToId?: string) => void;
    onOpenChat: (messageId: string) => void;
  },
  mentioned: boolean,
) {
  const render = (duration: number) =>
    toast.custom(
      (id) => (
        <ChatNotificationToast
          key={message.id}
          message={message}
          mentioned={mentioned}
          onReply={(content) => handlers.sendMessage(content, message.id)}
          onOpenChat={() => {
            handlers.onOpenChat(message.id);
            toast.dismiss(id);
          }}
          onDismiss={() => toast.dismiss(id)}
          onTypingChange={(isTyping) =>
            render(isTyping ? Infinity : CHAT_TOAST_DURATION)
          }
        />
      ),
      { id: CHAT_TOAST_ID, duration, position: "bottom-right" },
    );

  render(CHAT_TOAST_DURATION);
}

interface UseChatToastNotificationsArgs {
  messages: ChatMessage[];
  isChatVisible: boolean;
  myEmail: string;
  sendMessage: (content: string, replyToId?: string) => void;
  onOpenChat: (messageId: string) => void;
}

// Watches the same `messages` array ChatPanel renders from and pops a
// floating reply-able toast for any message from someone else that arrives
// while the chat panel isn't visible to this user.
export function useChatToastNotifications({
  messages,
  isChatVisible,
  myEmail,
  sendMessage,
  onOpenChat,
}: UseChatToastNotificationsArgs) {
  const seenIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    // First run — seed with whatever's already in state instead of
    // notifying for it, so mounting doesn't toast a backlog.
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(messages.map((m) => m.id));
      return;
    }

    const seen = seenIdsRef.current;
    let latestUnseen: ChatMessage | null = null;
    let latestMention: ChatMessage | null = null;
    for (const msg of messages) {
      if (seen.has(msg.id)) continue;
      seen.add(msg.id);
      if (msg.senderEmail === myEmail) continue;
      latestUnseen = msg;
      if (msg.mentions?.some((m) => m.email === myEmail)) {
        latestMention = msg;
      }
    }

    // Chat visible: only interrupt for @mentions of me. Chat hidden: any message.
    const toShow = isChatVisible ? latestMention : (latestMention ?? latestUnseen);
    if (toShow) {
      showChatToast(toShow, { sendMessage, onOpenChat }, toShow === latestMention);
    }
  }, [messages, isChatVisible, myEmail, sendMessage, onOpenChat]);
}
