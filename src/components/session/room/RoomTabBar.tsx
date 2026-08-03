"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, Users, Clock, Settings, HelpCircle, BarChart3, X } from "lucide-react";

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
        mobile ? "py-3 px-2 min-w-16" : "py-3 px-3 min-w-18",
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
            "absolute top-2 right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
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
            icon={<MessageSquare className="w-full h-full" />}
            isActive={activeTab === "chat"}
            onClick={() => onChange("chat")}
            badge={messageCount > 0 ? messageCount : undefined}
            badgeColor="primary"
            mobile={mobile}
          />
          
          <TabItem
            id="participants"
            label="People"
            icon={<Users className="w-full h-full" />}
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
              icon={<Clock className="w-full h-full" />}
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
            icon={<HelpCircle className="w-full h-full" />}
            isActive={activeTab === "qa"}
            onClick={() => onChange("qa")}
            badge={qaCount > 0 ? qaCount : undefined}
            badgeColor="primary"
            mobile={mobile}
          />
          
          <TabItem
            id="polls"
            label="Polls"
            icon={<BarChart3 className="w-full h-full" />}
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
              icon={<Settings className="w-full h-full" />}
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
              <X className="w-5 h-5" />
              <span className="text-xs font-medium">Close</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom border gradient */}
      <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
