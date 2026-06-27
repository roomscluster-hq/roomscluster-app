"use client";

import { cn } from "@/lib/utils";

interface ControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  canPublish: boolean;
  isHost: boolean;
  handRaised: boolean;
  isRecording: boolean;
  recordingLoading: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onRaiseHand: () => void;
  onToggleRecording: () => void;
  onEndSession: () => void;
  onLeave: () => void;
}

function ControlButton({
  onClick,
  active,
  danger,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl transition text-xs font-medium",
        danger
          ? "bg-red-600 text-white hover:bg-red-700"
          : active
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-gray-700 text-gray-200 hover:bg-gray-600",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

export function ControlBar({
  isMuted,
  isCameraOff,
  isScreenSharing,
  canPublish,
  isHost,
  handRaised,
  isRecording,
  recordingLoading,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onRaiseHand,
  onToggleRecording,
  onEndSession,
  onLeave,
}: ControlBarProps) {
  return (
    <div className="bg-gray-800 px-6 py-3 flex items-center justify-center gap-3">

      {/* Mic */}
      <ControlButton
        onClick={onToggleMic}
        active={!isMuted}
        disabled={!canPublish}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1 1 0 000-.501A10.008 10.008 0 0010 3a9.958 9.958 0 00-4.512 1.074L3.28 2.22zM10 5a3 3 0 013 3v1.28l-4.513-4.513A3 3 0 0110 5z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
            <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
          </svg>
        )}
        {isMuted ? "Unmute" : "Mute"}
      </ControlButton>

      {/* Camera */}
      <ControlButton
        onClick={onToggleCamera}
        active={!isCameraOff}
        disabled={!canPublish}
        title={isCameraOff ? "Turn on camera" : "Turn off camera"}
      >
        {isCameraOff ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M1 12.5A4.5 4.5 0 005.5 17H15a4.5 4.5 0 004.243-6.023L17.5 9.5v-2a.75.75 0 00-1.5 0v.573l-1.762-1.762A4.5 4.5 0 008.965 3H5.5A4.5 4.5 0 001 7.5v5zM5.5 4.5h3.465a3 3 0 012.121.879l5.536 5.535A3 3 0 0115 13.5H5.5a3 3 0 010-6z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-1.19l2.22 2.22a.75.75 0 001.28-.53V5.75a.75.75 0 00-1.28-.53L13 7.44V6.25A2.25 2.25 0 0010.75 4h-7.5z" />
          </svg>
        )}
        {isCameraOff ? "Camera On" : "Camera Off"}
      </ControlButton>

      {/* Screen Share */}
      <ControlButton
        onClick={onToggleScreenShare}
        active={isScreenSharing}
        disabled={!canPublish}
        title="Screen Share"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v8.5A2.25 2.25 0 0115.75 15h-3.105a3.501 3.501 0 001.1 1.677A.75.75 0 0113.26 18H6.74a.75.75 0 01-.484-1.323A3.501 3.501 0 007.355 15H4.25A2.25 2.25 0 012 12.75v-8.5z" clipRule="evenodd" />
        </svg>
        {isScreenSharing ? "Stop Share" : "Share"}
      </ControlButton>

      {/* Recording — host only */}
      {isHost && (
        <ControlButton
          onClick={onToggleRecording}
          active={isRecording}
          disabled={recordingLoading}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          {recordingLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : isRecording ? (
            // Stop icon — filled square
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="5" width="10" height="10" rx="1.5" />
            </svg>
          ) : (
            // Record icon — filled circle, red dot styling handled by `active` state
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="6" />
            </svg>
          )}
          {recordingLoading ? "..." : isRecording ? "Stop Rec" : "Record"}
        </ControlButton>
      )}

      {/* Hand Raise — guests only */}
      {!isHost && (
        <ControlButton
          onClick={onRaiseHand}
          active={handRaised}
          title={handRaised ? "Lower hand" : "Raise hand"}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.75 3A2.25 2.25 0 004.5 5.25v3.787a2.25 2.25 0 10-1.5 2.122V5.25C3 3.179 4.679 1.5 6.75 1.5h6.5C15.321 1.5 17 3.179 17 5.25v5.787a2.25 2.25 0 10-1.5-2.122V5.25A2.25 2.25 0 0013.25 3h-6.5z" />
          </svg>
          {handRaised ? "Lower Hand" : "Raise Hand"}
        </ControlButton>
      )}

      <div className="flex-1" />

      {/* Leave */}
      <ControlButton onClick={onLeave} danger title="Leave session">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.08a.75.75 0 10-1.004-1.114l-2.5 2.5a.75.75 0 000 1.108l2.5 2.5a.75.75 0 101.004-1.114l-1.048-1.08H18.25A.75.75 0 0019 10z" clipRule="evenodd" />
        </svg>
        Leave
      </ControlButton>

      {/* End session — host only */}
      {isHost && (
        <ControlButton onClick={onEndSession} danger title="End session for all">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
          End Session
        </ControlButton>
      )}
    </div>
  );
}