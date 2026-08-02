"use client";

import { cn } from "@/lib/utils";

export type SidebarTab =
  | "chat"
  | "participants"
  | "waiting"
  | "settings"
  | "qa"
  | "polls";

interface RoomTabBarProps {
  activeTab: SidebarTab;
  onChange: (tab: SidebarTab) => void;
  onClose?: () => void;
  mobile?: boolean;
  messageCount: number;
  participantCount: number;
  waitingCount: number;
  canManage: boolean;
  qaCount: number;
  pollCount: number;
}

// Icon components
const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const PeopleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const WaitingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const QAIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PollIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface TabItemProps {
  id: SidebarTab;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
  badgeColor?: "primary" | "warning" | "neutral";
  pulse?: boolean;
  mobile?: boolean;
}

function TabItem({
  label,
  icon,
  isActive,
  onClick,
  badge,
  badgeColor = "primary",
  pulse = false,
  mobile,
}: TabItemProps) {
  const badgeStyles = {
    primary: "bg-primary-500 text-white",
    warning: "bg-warning-500 text-white",
    neutral: "bg-ink-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 transition-all duration-200",
        mobile ? "py-3 px-2 min-w-[64px]" : "py-3 px-3 min-w-[72px]",
        "hover:bg-white/5",
        isActive && "bg-white/10"
      )}
    >
      {/* Active indicator */}
      <div
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-200",
          isActive ? "w-8 bg-primary-500" : "w-0 bg-transparent"
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "relative transition-colors duration-200",
          mobile ? "w-5 h-5" : "w-5 h-5",
          isActive ? "text-white" : "text-white/50 hover:text-white/80"
        )}
      >
        {icon}
        
        {/* Small notification dot for pulse badges */}
        {pulse && badge && badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-warning-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "font-medium transition-colors duration-200",
          mobile ? "text-[10px]" : "text-xs",
          isActive ? "text-white" : "text-white/50 hover:text-white/80"
        )}
      >
        {label}
      </span>

      {/* Badge */}
      {badge !== undefined && badge > 0 && !pulse && (
        <span
          className={cn(
            "absolute top-2 right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
            badgeStyles[badgeColor]
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

export function RoomTabBar({
  activeTab,
  onChange,
  onClose,
  mobile = false,
  messageCount,
  participantCount,
  waitingCount,
  canManage,
  qaCount,
  pollCount,
}: RoomTabBarProps) {
  return (
    <div className="shrink-0 bg-ink-900/50 backdrop-blur-xl">
      {/* Main tabs container */}
      <div className="flex items-center justify-between">
        {/* Scrollable tabs area */}
        <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
          <TabItem
            id="chat"
            label="Chat"
            icon={<ChatIcon className="w-full h-full" />}
            isActive={activeTab === "chat"}
            onClick={() => onChange("chat")}
            badge={messageCount > 0 ? messageCount : undefined}
            badgeColor="primary"
            mobile={mobile}
          />
          
          <TabItem
            id="participants"
            label="People"
            icon={<PeopleIcon className="w-full h-full" />}
            isActive={activeTab === "participants"}
            onClick={() => onChange("participants")}
            badge={participantCount > 0 ? participantCount : undefined}
            badgeColor="neutral"
            mobile={mobile}
          />
          
          {canManage && (
            <TabItem
              id="waiting"
              label="Waiting"
              icon={<WaitingIcon className="w-full h-full" />}
              isActive={activeTab === "waiting"}
              onClick={() => onChange("waiting")}
              badge={waitingCount > 0 ? waitingCount : undefined}
              badgeColor="warning"
              pulse={waitingCount > 0}
              mobile={mobile}
            />
          )}
          
          <TabItem
            id="qa"
            label="Q&A"
            icon={<QAIcon className="w-full h-full" />}
            isActive={activeTab === "qa"}
            onClick={() => onChange("qa")}
            badge={qaCount > 0 ? qaCount : undefined}
            badgeColor="primary"
            mobile={mobile}
          />
          
          <TabItem
            id="polls"
            label="Polls"
            icon={<PollIcon className="w-full h-full" />}
            isActive={activeTab === "polls"}
            onClick={() => onChange("polls")}
            badge={pollCount > 0 ? pollCount : undefined}
            badgeColor="warning"
            pulse={pollCount > 0}
            mobile={mobile}
          />
          
          {canManage && (
            <TabItem
              id="settings"
              label="Settings"
              icon={<SettingsIcon className="w-full h-full" />}
              isActive={activeTab === "settings"}
              onClick={() => onChange("settings")}
              mobile={mobile}
            />
          )}
        </div>

        {/* Close button - desktop only */}
        {!mobile && onClose && (
          <div className="shrink-0 border-l border-white/10">
            <button
              onClick={onClose}
              className="flex flex-col items-center justify-center gap-1 py-3 px-4 text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
              title="Close panel"
            >
              <CloseIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Close</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom border gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
