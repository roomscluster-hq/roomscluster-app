"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";

interface ControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  canPublish: boolean;
  isHost: boolean;
  handRaised: boolean;
  isRecording: boolean;
  recordingLoading: boolean;
  isWhiteboard: boolean;
  unreadChat: number;
  peopleCount: number;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onRaiseHand: () => void;
  onToggleRecording: () => void;
  onToggleWhiteboard: () => void;
  onOpenChat: () => void;
  onOpenPeople: () => void;
  onEndSession: () => void;
  onLeave: () => void;
}

function ControlButton({
  onClick,
  active,
  danger,
  disabled,
  title,
  compact,
  badge,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  title: string;
  compact?: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors duration-150 text-white",
        compact ? "h-11 w-11 shrink-0" : "h-14 w-14",
        danger
          ? "bg-danger-600 hover:bg-danger-700"
          : active
          ? "bg-primary-600 hover:bg-primary-700"
          : "bg-white/5 hover:bg-white/10",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
      {!!badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70">{children}</span>
);

const MicIcon = ({ off }: { off: boolean }) =>
  off ? (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1 1 0 000-.501A10.008 10.008 0 0010 3a9.958 9.958 0 00-4.512 1.074L3.28 2.22zM10 5a3 3 0 013 3v1.28l-4.513-4.513A3 3 0 0110 5z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
      <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
    </svg>
  );

const CameraIcon = ({ off }: { off: boolean }) =>
  off ? (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M1 12.5A4.5 4.5 0 005.5 17H15a4.5 4.5 0 004.243-6.023L17.5 9.5v-2a.75.75 0 00-1.5 0v.573l-1.762-1.762A4.5 4.5 0 008.965 3H5.5A4.5 4.5 0 001 7.5v5zM5.5 4.5h3.465a3 3 0 012.121.879l5.536 5.535A3 3 0 0115 13.5H5.5a3 3 0 010-6z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-1.19l2.22 2.22a.75.75 0 001.28-.53V5.75a.75.75 0 00-1.28-.53L13 7.44V6.25A2.25 2.25 0 0010.75 4h-7.5z" />
    </svg>
  );

const ScreenShareIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v8.5A2.25 2.25 0 0115.75 15h-3.105a3.501 3.501 0 001.1 1.677A.75.75 0 0113.26 18H6.74a.75.75 0 01-.484-1.323A3.501 3.501 0 007.355 15H4.25A2.25 2.25 0 012 12.75v-8.5z" clipRule="evenodd" />
  </svg>
);

const BoardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 4h12v9H4z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 17l2-4 2 4" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
  </svg>
);

const PeopleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const HandIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.75 3A2.25 2.25 0 004.5 5.25v3.787a2.25 2.25 0 10-1.5 2.122V5.25C3 3.179 4.679 1.5 6.75 1.5h6.5C15.321 1.5 17 3.179 17 5.25v5.787a2.25 2.25 0 10-1.5-2.122V5.25A2.25 2.25 0 0013.25 3h-6.5z" />
  </svg>
);

const RecordIcon = ({ recording, loading }: { recording: boolean; loading: boolean }) =>
  loading ? (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ) : recording ? (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <rect x="5" y="5" width="10" height="10" rx="1.5" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="6" />
    </svg>
  );

const LeaveIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.08a.75.75 0 10-1.004-1.114l-2.5 2.5a.75.75 0 000 1.108l2.5 2.5a.75.75 0 101.004-1.114l-1.048-1.08H18.25A.75.75 0 0019 10z" clipRule="evenodd" />
  </svg>
);

const EndSessionIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M4 10a2 2 0 114 0 2 2 0 01-4 0zM8 10a2 2 0 114 0 2 2 0 01-4 0zM12 10a2 2 0 114 0 2 2 0 01-4 0z" />
  </svg>
);

export function ControlBar(props: ControlBarProps) {
  const {
    isMuted, isCameraOff, isScreenSharing, canPublish, isHost, handRaised,
    isRecording, recordingLoading, isWhiteboard, unreadChat, peopleCount,
    onToggleMic, onToggleCamera, onToggleScreenShare, onRaiseHand,
    onToggleRecording, onToggleWhiteboard, onOpenChat, onOpenPeople,
    onEndSession, onLeave,
  } = props;
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div
      className="bg-black/40 backdrop-blur-xl px-3 md:px-5 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 md:gap-4"
      style={{ marginBottom: "max(0px, env(safe-area-inset-bottom))" }}
    >
      {/* ── Full control set — desktop/tablet ─────────── */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <ControlButton onClick={onToggleMic} active={!isMuted} disabled={!canPublish} title={isMuted ? "Unmute" : "Mute"}>
            <MicIcon off={isMuted} />
            <Label>{isMuted ? "Unmute" : "Mute"}</Label>
          </ControlButton>

          <ControlButton onClick={onToggleCamera} active={!isCameraOff} disabled={!canPublish} title={isCameraOff ? "Turn on camera" : "Turn off camera"}>
            <CameraIcon off={isCameraOff} />
            <Label>{isCameraOff ? "Start" : "Stop"}</Label>
          </ControlButton>

          {isHost ? (
            <ControlButton onClick={onToggleRecording} active={isRecording} disabled={recordingLoading} title={isRecording ? "Stop recording" : "Start recording"}>
              <RecordIcon recording={isRecording} loading={recordingLoading} />
              <Label>{isRecording ? "Stop Rec" : "Record"}</Label>
            </ControlButton>
          ) : (
            <ControlButton onClick={onRaiseHand} active={handRaised} title={handRaised ? "Lower hand" : "Raise hand"}>
              <HandIcon />
              <Label>{handRaised ? "Lower" : "Raise"}</Label>
            </ControlButton>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ControlButton onClick={onToggleWhiteboard} active={isWhiteboard} title="Whiteboard">
            <BoardIcon />
            <Label>Board</Label>
          </ControlButton>

          <ControlButton onClick={onOpenChat} badge={unreadChat} title="Chat">
            <ChatIcon />
            <Label>Chat</Label>
          </ControlButton>

          <ControlButton onClick={onOpenPeople} badge={peopleCount} title="People">
            <PeopleIcon />
            <Label>People</Label>
          </ControlButton>

          <ControlButton onClick={onToggleScreenShare} active={isScreenSharing} disabled={!canPublish} title="Screen Share">
            <ScreenShareIcon />
            <Label>Share</Label>
          </ControlButton>
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
          <ControlButton onClick={onLeave} danger title="Leave session">
            <LeaveIcon />
            <Label>Leave</Label>
          </ControlButton>

          {isHost && (
            <ControlButton onClick={onEndSession} danger title="End session for all">
              <EndSessionIcon />
              <Label>End</Label>
            </ControlButton>
          )}
        </div>
      </div>

      {/* ── Condensed control set — mobile ─────────────── */}
      <div className="flex md:hidden items-center gap-1.5 w-full justify-center">
        <ControlButton compact onClick={onToggleMic} active={!isMuted} disabled={!canPublish} title={isMuted ? "Unmute" : "Mute"}>
          <MicIcon off={isMuted} />
        </ControlButton>

        <ControlButton compact onClick={onToggleCamera} active={!isCameraOff} disabled={!canPublish} title={isCameraOff ? "Turn on camera" : "Turn off camera"}>
          <CameraIcon off={isCameraOff} />
        </ControlButton>

        {isHost ? (
          <ControlButton compact onClick={onToggleRecording} active={isRecording} disabled={recordingLoading} title={isRecording ? "Stop recording" : "Start recording"}>
            <RecordIcon recording={isRecording} loading={recordingLoading} />
          </ControlButton>
        ) : (
          <ControlButton compact onClick={onRaiseHand} active={handRaised} title={handRaised ? "Lower hand" : "Raise hand"}>
            <HandIcon />
          </ControlButton>
        )}

        <ControlButton compact onClick={onOpenChat} badge={unreadChat} title="Chat and people">
          <ChatIcon />
        </ControlButton>

        <ControlButton compact onClick={onLeave} danger title="Leave session">
          <LeaveIcon />
        </ControlButton>

        <ControlButton compact onClick={() => setMoreOpen(true)} title="More options">
          <MoreIcon />
        </ControlButton>
      </div>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More options">
        <div className="p-2 pb-4 flex flex-col gap-1">
          <button
            onClick={() => { onToggleWhiteboard(); setMoreOpen(false); }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            <BoardIcon />
            {isWhiteboard ? "Switch to video" : "Open whiteboard"}
          </button>

          <button
            onClick={() => { onOpenPeople(); setMoreOpen(false); }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            <PeopleIcon />
            People {peopleCount > 0 && `(${peopleCount})`}
          </button>

          <button
            onClick={() => { onToggleScreenShare(); setMoreOpen(false); }}
            disabled={!canPublish}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5 disabled:opacity-40"
          >
            <ScreenShareIcon />
            {isScreenSharing ? "Stop screen share" : "Share screen"}
          </button>

          {isHost && (
            <button
              onClick={() => { onEndSession(); setMoreOpen(false); }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-600/10"
            >
              <EndSessionIcon />
              End session for all
            </button>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
