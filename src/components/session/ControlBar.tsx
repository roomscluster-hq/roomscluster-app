"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Mic, MicOff, Video, VideoOff, Hand, VideoIcon, Music, MonitorUp, MoreHorizontal, Lock, Unlock, LogOut, X, Presentation } from "lucide-react";

interface ControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  canPublish: boolean;
  isHost: boolean;
  isCohost: boolean;
  isSpeaker: boolean;
  handRaised: boolean;
  isRecording: boolean;
  recordingLoading: boolean;
  recordingEnabled: boolean;
  isWhiteboard: boolean;
  unreadChat: number;
  peopleCount: number;
  participantVideoEnabled: boolean;
  participantMicEnabled: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onRaiseHand: () => void;
  onStartRecording: (type: 'VIDEO' | 'AUDIO' | 'BOTH') => void;
  onStopRecording: () => void;
  onToggleWhiteboard: () => void;
  onOpenChat: () => void;
  onOpenPeople: () => void;
  onEndSession: () => void;
  onLeave: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
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
        disabled && "opacity-40 cursor-not-allowed",
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
  <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70">
    {children}
  </span>
);

const ScreenShareIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v8.5A2.25 2.25 0 0115.75 15h-3.105a3.501 3.501 0 001.1 1.677A.75.75 0 0113.26 18H6.74a.75.75 0 01-.484-1.323A3.501 3.501 0 007.355 15H4.25A2.25 2.25 0 012 12.75v-8.5z"
      clipRule="evenodd"
    />
  </svg>
);

const BoardIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 20 20"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      d="M4 4h12v9H4z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      d="M8 17l2-4 2 4"
    />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
      clipRule="evenodd"
    />
  </svg>
);

const PeopleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const RecordIcon = ({
  recording,
  loading,
}: {
  recording: boolean;
  loading: boolean;
}) =>
  loading ? (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
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
    <path
      fillRule="evenodd"
      d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.08a.75.75 0 10-1.004-1.114l-2.5 2.5a.75.75 0 000 1.108l2.5 2.5a.75.75 0 101.004-1.114l-1.048-1.08H18.25A.75.75 0 0019 10z"
      clipRule="evenodd"
    />
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

const LockIcon = ({ locked }: { locked: boolean }) =>
  locked ? (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
        clipRule="evenodd"
      />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M14.5 1A4.5 4.5 0 0010 5.5V9H3a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1.5V5.5a3 3 0 116 0v2.75a.75.75 0 001.5 0V5.5A4.5 4.5 0 0014.5 1z"
        clipRule="evenodd"
      />
    </svg>
  );

export function ControlBar(props: ControlBarProps) {
  const {
    isMuted,
    isCameraOff,
    isScreenSharing,
    canPublish,
    isHost,
    isCohost,
    isSpeaker,
    handRaised,
    isRecording,
    recordingLoading,
    recordingEnabled,
    isWhiteboard,
    unreadChat,
    peopleCount,
    participantVideoEnabled,
    participantMicEnabled,
    onToggleMic,
    onToggleCamera,
    onToggleScreenShare,
    onRaiseHand,
    onStartRecording,
    onStopRecording,
    onToggleWhiteboard,
    onOpenChat,
    onOpenPeople,
    onEndSession,
    onLeave,
    isLocked,
    onToggleLock,
  } = props;

  // Debug logging for co-host controls issue
  console.log('[ControlBar Debug]', {
    isHost,
    isCohost,
    isSpeaker,
    canPublish,
    recordingEnabled,
    canManage: isHost || isCohost,
  });

  const [moreOpen, setMoreOpen] = useState(false);
  const [recordingOptionsOpen, setRecordingOptionsOpen] = useState(false);
  const [desktopRecordingMenuOpen, setDesktopRecordingMenuOpen] = useState(false);

  const canManage = isHost || isCohost;

  // Host/Co-host/Speaker: bypass settings restrictions
  // Regular guests: must follow settings
  const canBypassSettings = isHost || isCohost || isSpeaker;

  // Mic/Camera disabled if:
  // 1. No publish permission at all (canPublish: false), OR
  // 2. User is regular guest (not host/cohost/speaker) AND setting is disabled
  const micDisabled =
    !canPublish || (!canBypassSettings && !participantMicEnabled);
  const cameraDisabled =
    !canPublish || (!canBypassSettings && !participantVideoEnabled);

  return (
    <div
      className="bg-black/40 backdrop-blur-xl px-3 md:px-5 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 md:gap-4"
      style={{ marginBottom: "max(0px, env(safe-area-inset-bottom))" }}
    >
      {/* ── Full control set — desktop/tablet ─────────── */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <ControlButton
            onClick={onToggleMic}
            active={!isMuted}
            disabled={micDisabled}
            title={
              !participantMicEnabled && canPublish && !canManage
                ? "Microphone disabled by host"
                : isMuted
                  ? "Unmute"
                  : "Mute"
            }
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            <Label>{isMuted ? "Unmute" : "Mute"}</Label>
          </ControlButton>

          <ControlButton
            onClick={onToggleCamera}
            active={!isCameraOff}
            disabled={cameraDisabled}
            title={
              !participantVideoEnabled && canPublish && !canManage
                ? "Camera disabled by host"
                : isCameraOff
                  ? "Turn on camera"
                  : "Turn off camera"
            }
          >
            {isCameraOff ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <Video className="w-5 h-5" />
            )}
            <Label>{isCameraOff ? "Start" : "Stop"}</Label>
          </ControlButton>

          {/* Recording — host and co-host */}
          {canManage ? (
            <div className="relative">
              <ControlButton
                onClick={() => {
                  if (isRecording) {
                    onStopRecording();
                  } else {
                    setDesktopRecordingMenuOpen(true);
                  }
                }}
                active={isRecording}
                disabled={recordingLoading || !recordingEnabled}
                title={
                  !recordingEnabled
                    ? "Recording disabled in settings"
                    : isRecording
                      ? "Stop recording"
                      : "Start recording"
                }
              >
                <RecordIcon recording={isRecording} loading={recordingLoading} />
                <Label>{isRecording ? "Stop Rec" : "Record"}</Label>
              </ControlButton>

              {/* Recording options dropdown — shown when not recording and menu is open */}
              {!isRecording && !recordingLoading && recordingEnabled && desktopRecordingMenuOpen && (
                <>
                  {/* Backdrop to close menu when clicking outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDesktopRecordingMenuOpen(false)}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center gap-1 z-50">
                    <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl p-1.5 flex flex-col gap-1 min-w-[140px] shadow-xl">
                      <button
                        onClick={() => {
                          onStartRecording('VIDEO');
                          setDesktopRecordingMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg transition"
                      >
                        <VideoIcon className="w-4 h-4" />
                        Video only
                      </button>
                      <button
                        onClick={() => {
                          onStartRecording('AUDIO');
                          setDesktopRecordingMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg transition"
                      >
                        <Music className="w-4 h-4" />
                        Audio only
                      </button>
                      <button
                        onClick={() => {
                          onStartRecording('BOTH');
                          setDesktopRecordingMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg transition"
                      >
                        <div className="flex -space-x-1">
                          <VideoIcon className="w-4 h-4" />
                          <Music className="w-4 h-4" />
                        </div>
                        Video + Audio
                      </button>
                    </div>
                    <div className="w-2 h-2 bg-black/90 rotate-45 border-b border-r border-white/10" />
                  </div>
                </>
              )}
            </div>
          ) : (
            <ControlButton
              onClick={onRaiseHand}
              active={handRaised}
              title={handRaised ? "Lower hand" : "Raise hand"}
            >
              <Hand className="w-5 h-5" />
              <Label>{handRaised ? "Lower" : "Raise"}</Label>
            </ControlButton>
          )}

          {canManage && (
            <ControlButton
              onClick={onToggleLock}
              active={isLocked}
              title={isLocked ? "Unlock session" : "Lock session"}
            >
              <LockIcon locked={isLocked} />
              <Label>{isLocked ? "Unlock" : "Lock"}</Label>
            </ControlButton>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ControlButton
            onClick={onToggleWhiteboard}
            active={isWhiteboard}
            title="Whiteboard"
          >
            <BoardIcon />
            <Label>Board</Label>
          </ControlButton>

          <ControlButton onClick={onOpenChat} badge={unreadChat} title="Chat">
            <ChatIcon />
            <Label>Chat</Label>
          </ControlButton>

          <ControlButton
            onClick={onOpenPeople}
            badge={peopleCount}
            title="People"
          >
            <PeopleIcon />
            <Label>People</Label>
          </ControlButton>

          <ControlButton
            onClick={onToggleScreenShare}
            active={isScreenSharing}
            disabled={!canPublish || !canBypassSettings}
            title={
              canBypassSettings
                ? "Screen Share"
                : "Screen sharing requires speaker or co-host role"
            }
          >
            <ScreenShareIcon />
            <Label>Share</Label>
          </ControlButton>
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
          <ControlButton onClick={onLeave} danger title="Leave session">
            <LeaveIcon />
            <Label>Leave</Label>
          </ControlButton>

          {/* End session — host and co-host */}
          {canManage && (
            <ControlButton
              onClick={onEndSession}
              danger
              title="End session for all"
            >
              <EndSessionIcon />
              <Label>End</Label>
            </ControlButton>
          )}
        </div>
      </div>

      {/* ── Condensed control set — mobile ─────────────── */}
      <div className="flex md:hidden items-center gap-1.5 w-full justify-center">
        <ControlButton
          compact
          onClick={onToggleMic}
          active={!isMuted}
          disabled={micDisabled}
          title={
            !participantMicEnabled && canPublish && !canManage
              ? "Microphone disabled by host"
              : isMuted
                ? "Unmute"
                : "Mute"
          }
        >
          {isMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </ControlButton>

        <ControlButton
          compact
          onClick={onToggleCamera}
          active={!isCameraOff}
          disabled={cameraDisabled}
          title={
            !participantVideoEnabled && canPublish && !canManage
              ? "Camera disabled by host"
              : isCameraOff
                ? "Turn on camera"
                : "Turn off camera"
          }
        >
          {isCameraOff ? (
            <VideoOff className="w-5 h-5" />
          ) : (
            <Video className="w-5 h-5" />
          )}
        </ControlButton>

        {canManage ? (
          <ControlButton
            compact
            onClick={() => {
              if (isRecording) {
                onStopRecording();
              } else {
                setRecordingOptionsOpen(true);
              }
            }}
            active={isRecording}
            disabled={recordingLoading || !recordingEnabled}
            title={
              !recordingEnabled
                ? "Recording disabled in settings"
                : isRecording
                  ? "Stop recording"
                  : "Start recording"
            }
          >
            <RecordIcon recording={isRecording} loading={recordingLoading} />
          </ControlButton>
        ) : (
          <ControlButton
            compact
            onClick={onRaiseHand}
            active={handRaised}
            title={handRaised ? "Lower hand" : "Raise hand"}
          >
            <Hand className="w-5 h-5" />
          </ControlButton>
        )}

        <ControlButton
          compact
          onClick={onOpenChat}
          badge={unreadChat}
          title="Chat and people"
        >
          <ChatIcon />
        </ControlButton>

        <ControlButton compact onClick={onLeave} danger title="Leave session">
          <LeaveIcon />
        </ControlButton>

        <ControlButton
          compact
          onClick={() => setMoreOpen(true)}
          title="More options"
        >
          <MoreIcon />
        </ControlButton>
      </div>

      {/* Recording Options Bottom Sheet - Mobile */}
      <BottomSheet
        open={recordingOptionsOpen}
        onClose={() => setRecordingOptionsOpen(false)}
        title="Choose Recording Type"
      >
        <div className="p-2 pb-4 flex flex-col gap-1">
          <button
            onClick={() => {
              onStartRecording('VIDEO');
              setRecordingOptionsOpen(false);
            }}
            disabled={!recordingEnabled}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5 disabled:opacity-40"
          >
            <VideoIcon className="w-5 h-5" />
            Video only
          </button>
          <button
            onClick={() => {
              onStartRecording('AUDIO');
              setRecordingOptionsOpen(false);
            }}
            disabled={!recordingEnabled}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5 disabled:opacity-40"
          >
            <Music className="w-5 h-5" />
            Audio only
          </button>
          <button
            onClick={() => {
              onStartRecording('BOTH');
              setRecordingOptionsOpen(false);
            }}
            disabled={!recordingEnabled}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5 disabled:opacity-40"
          >
            <div className="flex -space-x-1">
              <VideoIcon className="w-5 h-5" />
              <Music className="w-5 h-5" />
            </div>
            Video + Audio
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More options"
      >
        <div className="p-2 pb-4 flex flex-col gap-1">
          <button
            onClick={() => {
              onToggleWhiteboard();
              setMoreOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            <BoardIcon />
            {isWhiteboard ? "Switch to video" : "Open whiteboard"}
          </button>

          <button
            onClick={() => {
              onOpenPeople();
              setMoreOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            <PeopleIcon />
            People {peopleCount > 0 && `(${peopleCount})`}
          </button>

          <button
            onClick={() => {
              onToggleScreenShare();
              setMoreOpen(false);
            }}
            disabled={!canPublish || !canBypassSettings}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5 disabled:opacity-40"
          >
            <ScreenShareIcon />
            {isScreenSharing ? "Stop screen share" : "Share screen"}
          </button>

          {canManage && (
            <button
              onClick={() => {
                onToggleLock();
                setMoreOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
            >
              <LockIcon locked={isLocked} />
              {isLocked ? "Unlock session" : "Lock session"}
            </button>
          )}

          {canManage && (
            <button
              onClick={() => {
                onEndSession();
                setMoreOpen(false);
              }}
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
