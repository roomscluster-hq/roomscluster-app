"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sessionsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { VideoGrid } from "@/components/session/VideoGrid";
import { ChatPanel } from "@/components/session/ChatPanel";
import { ControlBar } from "@/components/session/ControlBar";
import { Whiteboard } from "@/components/session/Whiteboard";
import { ParticipantsPanel } from "@/components/session/ParticipantsPanel";
import { Spinner } from "@/components/ui/spinner";
import { getCookie, clearGuestCookies } from "@/lib/cookies";
import { RoomProvider, useRoom } from "@/contexts/RoomContext";
import { toast } from "sonner";

type MainView = "video" | "whiteboard";
type SidebarTab = "chat" | "participants";

// ── Inner component uses context ───────────────────
function RoomContent({ joinCode }: { joinCode: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [mainView, setMainView] = useState<MainView>("video");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("chat");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const warnedRef = useRef(false);

  const isGuest = !isAuthenticated;
  const guestName = getCookie("guest_name");
  const currentUserId = user?.id ?? getCookie("guest_identity") ?? "";

  const remoteDrawRef = useRef<((event: any) => void) | null>(null);
  const remoteClearRef = useRef<(() => void) | null>(null);

  const {
    localParticipant, remoteParticipants, isLiveKitConnected,
    isMuted, isCameraOff, isScreenSharing, canPublish, liveKitError,
    toggleMic, toggleCamera, toggleScreenShare, disconnect,
    messages, participants, raisedHands,
    sendMessage, raiseHand, lowerHand, lowerHandForUser,
    promoteParticipant, demoteParticipant, endSession, socketRef,
    setOnWhiteboardDraw, setOnWhiteboardClear,
    isRecording, recordingLoading, startRecording, stopRecording,
  } = useRoom();

  const { data: session, isLoading } = useQuery({
    queryKey: ["session-room", joinCode],
    queryFn: () => sessionsApi.getByJoinCode(joinCode),
  });

  const isHost = !isGuest && session?.hostId === user?.id;

  // Register whiteboard callbacks
  useEffect(() => {
    setOnWhiteboardDraw((event) => remoteDrawRef.current?.(event));
    setOnWhiteboardClear(() => remoteClearRef.current?.());
    return () => {
      setOnWhiteboardDraw(null);
      setOnWhiteboardClear(null);
    };
  }, [setOnWhiteboardDraw, setOnWhiteboardClear]);

  // Join session (authenticated users only)
  useEffect(() => {
    if (session && !isGuest) {
      sessionsApi.join(joinCode).catch(() => { });
    }
  }, [session, joinCode, isGuest]);

  useEffect(() => {
    if (!session?.startedAt) return;

    const startTime = new Date(session.startedAt).getTime();

    function updateElapsed() {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(seconds);

      // Warn once when crossing 3h50m (10 min before the 4-hour auto-end)
      const tenMinutesBeforeLimit = 4 * 60 * 60 - 10 * 60;
      if (seconds >= tenMinutesBeforeLimit && !warnedRef.current) {
        warnedRef.current = true;
        toast("This session will end automatically in 10 minutes (4-hour limit)", {
          duration: 10000,
        });
      }
    }

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session?.startedAt]);

  function formatElapsed(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function handleRaiseHand() {
    if (handRaised) {
      lowerHand();
      setHandRaised(false);
    } else {
      raiseHand();
      setHandRaised(true);
    }
  }

  async function handleLeave() {
    await disconnect();
    if (isGuest) {
      clearGuestCookies();
      window.location.href = `/room/${joinCode}/join`;
    } else {
      await sessionsApi.leave(joinCode).catch(() => { });
      router.push("/dashboard");
    }
  }

  function handleEndSession() {
    toast("End session for all participants?", {
      action: {
        label: "End Session",
        onClick: async () => {
          endSession();
          if (!isGuest) await sessionsApi.end(session!.id).catch(() => { });
          await disconnect();
          clearGuestCookies();
          router.push(isGuest ? "/" : "/dashboard");
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => { },
      },
      duration: 8000,
    });
  }

  function handleToggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <Spinner className="text-white w-8 h-8" />
      </div>
    );
  }

  if (liveKitError) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{liveKitError}</p>
          <button
            onClick={() => router.push(isGuest ? "/" : "/dashboard")}
            className="text-white underline"
          >
            {isGuest ? "Go Home" : "Back to Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">

      {/* ── Top bar ──────────────────────────────────── */}
      <div className="shrink-0 bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold">{session?.title ?? "Session"}</span>
          {isLiveKitConnected ? (
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">LIVE</span>
          ) : (
            <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">Connecting...</span>
          )}
          {isLiveKitConnected && session?.startedAt && (
            <span className="text-xs text-gray-300 font-mono">
              {formatElapsed(elapsedSeconds)}
            </span>
          )}
          {isRecording && (
            <span className="flex items-center gap-1 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              REC
            </span>
          )}
          {isGuest && (
            <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">
              Guest: {guestName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1 gap-1">
            <button
              onClick={() => setMainView("video")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${mainView === "video"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
                }`}
            >
              📹 Video
            </button>
            <button
              onClick={() => setMainView("whiteboard")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${mainView === "whiteboard"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
                }`}
            >
              🖊️ Whiteboard
            </button>
          </div>

          {/* Sidebar toggle */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="text-gray-400 hover:text-white text-xs transition ml-2"
          >
            {chatOpen ? "Hide Panel" : "Show Panel"}
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* Main area */}
        <div className="flex-1 relative min-w-0 min-h-0">
          {/* Video */}
          <div
            className="absolute inset-0 p-4"
            style={{ display: mainView === "video" ? "flex" : "none" }}
          >
            <VideoGrid
              localParticipant={localParticipant}
              remoteParticipants={remoteParticipants}
              raisedHands={raisedHands}
            />
          </div>

          {/* Whiteboard */}
          <div
            className="absolute inset-0 flex flex-col"
            style={{ display: mainView === "whiteboard" ? "flex" : "none" }}
          >
            <Whiteboard
              socketRef={socketRef}
              canDraw={canPublish || isHost}
              isHost={isHost}
              onRemoteDraw={(fn) => { remoteDrawRef.current = fn; }}
              onRemoteClear={(fn) => { remoteClearRef.current = fn; }}
            />
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────── */}
        {chatOpen && (
          <div className="w-80 shrink-0 flex flex-col border-l border-gray-700 overflow-hidden">

            {/* Tab bar */}
            <div className="shrink-0 flex border-b border-gray-700">
              <button
                onClick={() => setSidebarTab("chat")}
                className={`flex-1 py-2 text-xs font-medium transition ${sidebarTab === "chat"
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                Chat
                {messages.length > 0 && (
                  <span className="ml-1 bg-blue-600 text-white text-xs px-1.5 rounded-full">
                    {messages.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSidebarTab("participants")}
                className={`flex-1 py-2 text-xs font-medium transition ${sidebarTab === "participants"
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                People
                <span className="ml-1 bg-gray-600 text-white text-xs px-1.5 rounded-full">
                  {participants.length}
                </span>
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {sidebarTab === "chat" ? (
                <ChatPanel messages={messages} onSend={sendMessage} />
              ) : (
                <ParticipantsPanel
                  participants={participants}
                  raisedHands={raisedHands}
                  isHost={isHost}
                  currentUserId={currentUserId}
                  onPromote={(userId) => { promoteParticipant(userId); lowerHandForUser(userId); }}
                  onDemote={(userId) => demoteParticipant(userId)}
                  onLowerHand={lowerHandForUser}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Control bar ──────────────────────────────── */}
      <div className="shrink-0">
        <ControlBar
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          canPublish={canPublish}
          isHost={isHost}
          handRaised={handRaised}
          isRecording={isRecording}
          recordingLoading={recordingLoading}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
          onRaiseHand={handleRaiseHand}
          onToggleRecording={handleToggleRecording}
          onEndSession={handleEndSession}
          onLeave={handleLeave}
        />
      </div>
    </div>
  );
}

// ── Wrapper — fetches session first so we have sessionId for RoomProvider ──
function RoomProviderWrapper({ joinCode }: { joinCode: string }) {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session-room", joinCode],
    queryFn: () => sessionsApi.getByJoinCode(joinCode),
  });

  if (isLoading || !session) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <Spinner className="text-white w-8 h-8" />
      </div>
    );
  }

  return (
    <RoomProvider joinCode={joinCode} sessionId={session.id}>
      <RoomContent joinCode={joinCode} />
    </RoomProvider>
  );
}

// ── Outer component ───────────────────────────────
export default function RoomPage() {
  const { joinCode } = useParams<{ joinCode: string }>();
  return <RoomProviderWrapper joinCode={joinCode} />;
}