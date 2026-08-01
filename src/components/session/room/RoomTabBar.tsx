"use client";

export type SidebarTab =
  | "chat"
  | "participants"
  | "waiting"
  | "settings"
  | "qa";

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
}: RoomTabBarProps) {
  const btnClass = (tab: SidebarTab) =>
    `flex-1 ${mobile ? "py-2.5 text-sm" : "py-2 text-xs"} font-medium transition ${
      activeTab === tab
        ? "text-white border-b-2 border-primary-500"
        : "text-gray-400 hover:text-white"
    }`;

  return (
    <div className="shrink-0 flex border-b border-white/10 items-center">
      <button onClick={() => onChange("chat")} className={btnClass("chat")}>
        Chat
        {messageCount > 0 && (
          <span className="ml-1 bg-primary-600 text-white text-xs px-1.5 rounded-full">
            {messageCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onChange("participants")}
        className={btnClass("participants")}
      >
        People
        <span className="ml-1 bg-ink-700 text-white text-xs px-1.5 rounded-full">
          {participantCount}
        </span>
      </button>
      {canManage && (
        <button
          onClick={() => onChange("waiting")}
          className={btnClass("waiting")}
        >
          Waiting
          {waitingCount > 0 && (
            <span className="ml-1 bg-warning-500 text-white text-xs px-1.5 rounded-full animate-pulse">
              {waitingCount}
            </span>
          )}
        </button>
      )}
      {canManage && (
        <button
          onClick={() => onChange("settings")}
          className={btnClass("settings")}
        >
          Settings
        </button>
      )}

      <button onClick={() => onChange("qa")} className={btnClass("qa")}>
        Q&A
        {qaCount > 0 && (
          <span className="ml-1 bg-primary-600 text-white text-xs px-1.5 rounded-full">
            {qaCount}
          </span>
        )}
      </button>

      {/* Close button — desktop only */}
      {!mobile && onClose && (
        <button
          onClick={onClose}
          className="shrink-0 px-2 py-2 text-gray-400 hover:text-white transition"
          title="Close panel"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </div>
  );
}
