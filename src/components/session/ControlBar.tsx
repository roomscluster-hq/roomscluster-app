"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Music,
  MonitorUp,
  MoreHorizontal,
  Lock,
  Unlock,
  X,
  Presentation,
  Square,
  Circle,
  Loader2,
  MessageSquare,
  Users,
  LogOut as LeaveIconLucide,
  VideoIcon,
} from "lucide-react";

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
  onStartRecording: (type: "VIDEO" | "AUDIO" | "BOTH") => void;
  onStopRecording: () => void;
  onToggleWhiteboard: () => void;
  onOpenChat: () => void;
  onOpenPeople: () => void;
  onEndSession: () => void;
  onLeave: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
  onSendReaction: (emoji: string) => void;
  lockEnabled: boolean;
  onUpgradeClick: () => void;
  videoRecordingEnabled: boolean;
  bothRecordingEnabled: boolean;
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

const QUICK_REACTIONS = ["👏", "❤️", "😂", "🎉", "👍", "🔥", "😮", "🙌"];

const ScreenShareIcon = () => <MonitorUp className="w-5 h-5" />;
const BoardIcon = () => <Presentation className="w-5 h-5" />;
const ChatIcon = () => <MessageSquare className="w-5 h-5" />;
const PeopleIcon = () => <Users className="w-5 h-5" />;
const LeaveIcon = () => <LeaveIconLucide className="w-5 h-5" />;
const MoreIcon = () => <MoreHorizontal className="w-5 h-5" />;
const EndSessionIcon = () => <X className="w-5 h-5" />;
const LockIcon = ({ locked }: { locked: boolean }) =>
  locked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />;

const RecordIcon = ({
  recording,
  loading,
}: {
  recording: boolean;
  loading: boolean;
}) => {
  if (loading) return <Loader2 className="w-5 h-5 animate-spin" />;
  if (recording) return <Square className="w-5 h-5" />;
  return <Circle className="w-5 h-5" />;
};

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
    onSendReaction,
    lockEnabled,
    onUpgradeClick,
    videoRecordingEnabled,
    bothRecordingEnabled,
  } = props;

  const [moreOpen, setMoreOpen] = useState(false);
  const [recordingOptionsOpen, setRecordingOptionsOpen] = useState(false);
  const [desktopRecordingMenuOpen, setDesktopRecordingMenuOpen] =
    useState(false);

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
                <RecordIcon
                  recording={isRecording}
                  loading={recordingLoading}
                />
                <Label>{isRecording ? "Stop Rec" : "Record"}</Label>
              </ControlButton>

              {/* Recording options dropdown — shown when not recording and menu is open */}
              {!isRecording &&
                !recordingLoading &&
                recordingEnabled &&
                desktopRecordingMenuOpen && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDesktopRecordingMenuOpen(false)}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center gap-1 z-50">
                      <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl p-1.5 flex flex-col gap-1 min-w-35 shadow-xl">
                        <button
                          onClick={() => {
                            if (!videoRecordingEnabled) {
                              onUpgradeClick();
                              return;
                            }
                            onStartRecording("VIDEO");
                            setDesktopRecordingMenuOpen(false);
                          }}
                          className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg transition"
                        >
                          <span className="flex items-center gap-2">
                            <VideoIcon className="w-4 h-4" />
                            Video only
                          </span>
                          {!videoRecordingEnabled && (
                            <span className="text-[9px] font-semibold uppercase bg-primary-600 px-1.5 py-0.5 rounded">
                              Upgrade
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            onStartRecording("AUDIO");
                            setDesktopRecordingMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg transition"
                        >
                          <Music className="w-4 h-4" />
                          Audio only
                        </button>
                        <button
                          onClick={() => {
                            if (!bothRecordingEnabled) {
                              onUpgradeClick();
                              return;
                            }
                            onStartRecording("BOTH");
                            setDesktopRecordingMenuOpen(false);
                          }}
                          className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg transition"
                        >
                          <span className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              <VideoIcon className="w-4 h-4" />
                              <Music className="w-4 h-4" />
                            </div>
                            Video + Audio
                          </span>
                          {!bothRecordingEnabled && (
                            <span className="text-[9px] font-semibold uppercase bg-primary-600 px-1.5 py-0.5 rounded">
                              Upgrade
                            </span>
                          )}
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
              onClick={lockEnabled ? onToggleLock : onUpgradeClick}
              active={isLocked}
              disabled={false}
              title={
                lockEnabled
                  ? isLocked
                    ? "Unlock session"
                    : "Lock session"
                  : "Requires Pro plan — click to upgrade"
              }
            >
              <LockIcon locked={isLocked} />
              <Label>
                {lockEnabled ? (isLocked ? "Unlock" : "Lock") : "Upgrade"}
              </Label>
            </ControlButton>
          )}
        </div>

        {/* Reaction bar */}
        <div className="hidden md:flex items-center gap-1 px-2 border-r border-white/10">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(emoji)}
              className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-white/10"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
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
              if (!videoRecordingEnabled) {
                onUpgradeClick();
                setRecordingOptionsOpen(false);
                return;
              }
              onStartRecording("VIDEO");
              setRecordingOptionsOpen(false);
            }}
            className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            <span className="flex items-center gap-3">
              <VideoIcon className="w-5 h-5" />
              Video only
            </span>
            {!videoRecordingEnabled && (
              <span className="text-[10px] font-semibold uppercase bg-primary-600 px-2 py-0.5 rounded">
                Upgrade
              </span>
            )}
          </button>
          <button
            onClick={() => {
              onStartRecording("AUDIO");
              setRecordingOptionsOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            <Music className="w-5 h-5" />
            Audio only
          </button>
          <button
            onClick={() => {
              if (!bothRecordingEnabled) {
                onUpgradeClick();
                setRecordingOptionsOpen(false);
                return;
              }
              onStartRecording("BOTH");
              setRecordingOptionsOpen(false);
            }}
            className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            <span className="flex items-center gap-3">
              <div className="flex -space-x-1">
                <VideoIcon className="w-5 h-5" />
                <Music className="w-5 h-5" />
              </div>
              Video + Audio
            </span>
            {!bothRecordingEnabled && (
              <span className="text-[10px] font-semibold uppercase bg-primary-600 px-2 py-0.5 rounded">
                Upgrade
              </span>
            )}
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
                if (lockEnabled) {
                  onToggleLock();
                } else {
                  onUpgradeClick();
                }
                setMoreOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
            >
              <LockIcon locked={isLocked} />
              {lockEnabled
                ? isLocked
                  ? "Unlock session"
                  : "Lock session"
                : "Lock session (Upgrade to Pro)"}
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
