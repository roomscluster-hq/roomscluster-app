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
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { getCookie, clearGuestCookies } from "@/lib/cookies";
import { RoomProvider, useRoom } from "@/contexts/RoomContext";
import { toast } from "sonner";
import { WaitingRoomPanel } from "@/components/session/WaitingRoomPanel";
import { SessionSettingsPanel } from "@/components/session/SessionSettingsPanel";

type MainView = "video" | "whiteboard";
type SidebarTab = "chat" | "participants" | "waiting" | "settings";

function RoomContent({ joinCode }: { joinCode: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
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
    localParticipant,
    remoteParticipants,
    isLiveKitConnected,
    isMuted,
    isCameraOff,
    isScreenSharing,
    canPublish,
    liveKitError,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    disconnect,
    messages,
    participants,
    raisedHands,
    activeSpeakerIds,
    sendMessage,
    raiseHand,
    lowerHand,
    lowerHandForUser,
    promoteParticipant,
    demoteParticipant,
    endSession,
    socketRef,
    setOnWhiteboardDraw,
    setOnWhiteboardClear,
    isRecording,
    recordingLoading,
    startRecording,
    stopRecording,
    waitingParticipants,
    admitParticipant,
    admitAll,
    rejectParticipant,
    makeCohost,
    removeCohost,
    isCohost,
    roomChatEnabled,
    roomVideoEnabled,
    roomMicEnabled,
  } = useRoom();

  const { data: session, isLoading } = useQuery({
    queryKey: ["session-room", joinCode],
    queryFn: () => sessionsApi.getByJoinCode(joinCode),
  });

  const isHost = !isGuest && session?.hostId === user?.id;
  const canManage = isHost || isCohost;

  console.log("[Debug] canPublish:", canPublish, "isHost:", isHost);

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
      sessionsApi.join(joinCode).catch(() => {});
    }
  }, [session, joinCode, isGuest]);

  // Elapsed timer + 4-hour warning
  useEffect(() => {
    if (!session?.startedAt) return;
    const startTime = new Date(session.startedAt).getTime();

    function updateElapsed() {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(seconds);
      const tenMinutesBeforeLimit = 4 * 60 * 60 - 10 * 60;
      if (seconds >= tenMinutesBeforeLimit && !warnedRef.current) {
        warnedRef.current = true;
        toast(
          "This session will end automatically in 10 minutes (4-hour limit)",
          {
            duration: 10000,
          },
        );
      }
    }

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session?.startedAt]);

  // Auto-switch to waiting tab when first guest arrives
  const prevWaitingCountRef = useRef(0);
  useEffect(() => {
    const prevCount = prevWaitingCountRef.current;
    prevWaitingCountRef.current = waitingParticipants.length;
    if (canManage && prevCount === 0 && waitingParticipants.length > 0) {
      setSidebarTab("waiting");
      setChatOpen(true);
      setMobileSheetOpen(true);
      toast("Someone is waiting to join", { duration: 4000 });
    }
  }, [waitingParticipants.length, canManage]);

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
      await sessionsApi.leave(joinCode).catch(() => {});
      router.push("/dashboard");
    }
  }

  function handleEndSession() {
    toast("End session for all participants?", {
      action: {
        label: "End Session",
        onClick: async () => {
          endSession();
          if (!isGuest) await sessionsApi.end(session!.id).catch(() => {});
          await disconnect();
          clearGuestCookies();
          router.push(isGuest ? "/" : "/dashboard");
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
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

  function openPanel(tab: SidebarTab) {
    setSidebarTab(tab);
    setChatOpen(true);
    setMobileSheetOpen(true);
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-ink-900 flex items-center justify-center">
        <Spinner className="text-white w-8 h-8" />
      </div>
    );
  }

  if (liveKitError) {
    return (
      <div className="h-screen bg-ink-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger-600 text-lg mb-4">{liveKitError}</p>
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

  // ── Shared panel content ───────────────────────────────
  const sidebarContent = (
    <>
      {sidebarTab === "chat" && (
        <ChatPanel
          messages={messages}
          onSend={sendMessage}
          chatEnabled={roomChatEnabled}
        />
      )}
      {sidebarTab === "participants" && (
        <ParticipantsPanel
          participants={participants}
          raisedHands={raisedHands}
          isHost={isHost}
          isCohost={isCohost}
          currentUserId={currentUserId}
          onPromote={(userId) => {
            promoteParticipant(userId);
            lowerHandForUser(userId);
          }}
          onDemote={(userId) => demoteParticipant(userId)}
          onLowerHand={lowerHandForUser}
          onMakeCohost={makeCohost}
          onRemoveCohost={removeCohost}
        />
      )}
      {sidebarTab === "waiting" && canManage && session && (
        <WaitingRoomPanel joinCode={joinCode} />
      )}
      {sidebarTab === "settings" && canManage && session && (
        <div className="overflow-y-auto h-full px-4 py-2">
          <SessionSettingsPanel
            sessionId={session.id}
            joinCode={joinCode}
            compact
          />
        </div>
      )}
    </>
  );

  // ── Shared tab bar ─────────────────────────────────────
  const tabBar = (mobile = false) => (
    <div className="shrink-0 flex border-b border-white/10 items-center">
      <button
        onClick={() => setSidebarTab("chat")}
        className={`flex-1 ${mobile ? "py-2.5 text-sm" : "py-2 text-xs"} font-medium transition ${
          sidebarTab === "chat"
            ? "text-white border-b-2 border-primary-500"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Chat
        {messages.length > 0 && (
          <span className="ml-1 bg-primary-600 text-white text-xs px-1.5 rounded-full">
            {messages.length}
          </span>
        )}
      </button>
      <button
        onClick={() => setSidebarTab("participants")}
        className={`flex-1 ${mobile ? "py-2.5 text-sm" : "py-2 text-xs"} font-medium transition ${
          sidebarTab === "participants"
            ? "text-white border-b-2 border-primary-500"
            : "text-gray-400 hover:text-white"
        }`}
      >
        People
        <span className="ml-1 bg-ink-700 text-white text-xs px-1.5 rounded-full">
          {participants.length}
        </span>
      </button>
      {canManage && session && (
        <button
          onClick={() => setSidebarTab("waiting")}
          className={`flex-1 ${mobile ? "py-2.5 text-sm" : "py-2 text-xs"} font-medium transition relative ${
            sidebarTab === "waiting"
              ? "text-white border-b-2 border-primary-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Waiting
          {waitingParticipants.length > 0 && (
            <span className="ml-1 bg-warning-500 text-white text-xs px-1.5 rounded-full animate-pulse">
              {waitingParticipants.length}
            </span>
          )}
        </button>
      )}
      {canManage && session && (
        <button
          onClick={() => setSidebarTab("settings")}
          className={`flex-1 ${mobile ? "py-2.5 text-sm" : "py-2 text-xs"} font-medium transition ${
            sidebarTab === "settings"
              ? "text-white border-b-2 border-primary-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Settings
        </button>
      )}

      {/* ← Close button — desktop only */}
      {!mobile && (
        <button
          onClick={() => setChatOpen(false)}
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

  return (
    <div className="h-screen bg-ink-900 relative overflow-hidden flex flex-col">
      {/* ── Floating status pills — top left ──────────── */}
      <div className="fixed top-3 md:top-5 left-3 md:left-5 z-40 flex items-center gap-2 flex-wrap max-w-[75vw]">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span
            className={`w-2 h-2 rounded-full ${isLiveKitConnected ? "bg-success-500" : "bg-warning-500"} animate-pulse`}
          />
          <span className="font-mono text-xs text-white tracking-wider uppercase">
            {isLiveKitConnected ? "Live" : "Connecting"}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 min-w-0">
          <span className="text-white/90 text-xs truncate max-w-[30vw]">
            {session?.title ?? "Session"}
          </span>
        </div>
        {isLiveKitConnected && session?.startedAt && (
          <div className="hidden sm:flex items-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="font-mono text-xs text-white/70">
              {formatElapsed(elapsedSeconds)}
            </span>
          </div>
        )}
        {isGuest && (
          <div className="hidden md:flex items-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-xs text-white/70">Guest: {guestName}</span>
          </div>
        )}
      </div>

      {/* ── Floating recording pill — top right ───────── */}
      {isRecording && (
        <div className="fixed top-3 md:top-5 right-3 md:right-5 z-40 flex items-center gap-2 bg-danger-600/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-danger-600/30">
          <span className="w-2 h-2 rounded-full bg-danger-600 animate-pulse" />
          <span className="font-mono text-xs text-white uppercase tracking-tight">
            Recording
          </span>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Main area */}
        <div className="flex-1 relative min-w-0 min-h-0">
          <div
            className="absolute inset-0 p-4 pt-16 md:pt-6"
            style={{ display: mainView === "video" ? "flex" : "none" }}
          >
            <VideoGrid
              localParticipant={localParticipant}
              remoteParticipants={remoteParticipants}
              raisedHands={raisedHands}
              activeSpeakerIds={activeSpeakerIds}
            />
          </div>
          <div
            className="absolute inset-0 flex flex-col p-4 pt-16 md:pt-6"
            style={{ display: mainView === "whiteboard" ? "flex" : "none" }}
          >
            <Whiteboard
              socketRef={socketRef}
              canDraw={canPublish || isHost}
              isHost={isHost}
              onRemoteDraw={(fn) => {
                remoteDrawRef.current = fn;
              }}
              onRemoteClear={(fn) => {
                remoteClearRef.current = fn;
              }}
            />
          </div>
        </div>

        {/* ── Sidebar — desktop/tablet only ─────────────── */}
        {chatOpen && (
          <div className="hidden md:flex w-80 shrink-0 flex-col border-l border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            {tabBar(false)}
            <div className="flex-1 min-h-0 overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        )}
      </div>

      {/* ── Chat/People — mobile bottom sheet ─────────── */}
      <BottomSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        height="tall"
      >
        <div className="flex flex-col h-full">
          {tabBar(true)}
          <div className="flex-1 min-h-0 overflow-hidden">{sidebarContent}</div>
        </div>
      </BottomSheet>

      {/* ── Floating control bar ───────────────────────── */}
      <footer className="shrink-0 flex justify-center p-3 md:p-6 z-30">
        <ControlBar
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          canPublish={canPublish}
          isHost={isHost}
          isCohost={isCohost}
          handRaised={handRaised}
          isRecording={isRecording}
          recordingLoading={recordingLoading}
          isWhiteboard={mainView === "whiteboard"}
          unreadChat={messages.length}
          peopleCount={participants.length}
          participantVideoEnabled={roomVideoEnabled}
          participantMicEnabled={roomMicEnabled}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
          onRaiseHand={handleRaiseHand}
          onToggleRecording={handleToggleRecording}
          onToggleWhiteboard={() =>
            setMainView((v) => (v === "whiteboard" ? "video" : "whiteboard"))
          }
          onOpenChat={() => openPanel("chat")}
          onOpenPeople={() => openPanel("participants")}
          onEndSession={handleEndSession}
          onLeave={handleLeave}
        />
      </footer>
    </div>
  );
}

function RoomProviderWrapper({ joinCode }: { joinCode: string }) {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session-room", joinCode],
    queryFn: () => sessionsApi.getByJoinCode(joinCode),
  });

  if (isLoading || !session) {
    return (
      <div className="h-screen bg-ink-900 flex items-center justify-center">
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

export default function RoomPage() {
  const { joinCode } = useParams<{ joinCode: string }>();
  return <RoomProviderWrapper joinCode={joinCode} />;
}
