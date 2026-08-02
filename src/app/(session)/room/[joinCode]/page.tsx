"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sessionsApi } from "@/lib/api";
import { VideoGrid } from "@/components/session/VideoGrid";
import { ChatPanel } from "@/components/session/ChatPanel";
import { ControlBar } from "@/components/session/ControlBar";
import { Whiteboard } from "@/components/session/Whiteboard";
import { ParticipantsPanel } from "@/components/session/ParticipantsPanel";
import { Spinner } from "@/components/ui/spinner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { clearGuestCookies } from "@/lib/cookies";
import { RoomProvider } from "@/contexts/RoomContext";
import { useRoomSession } from "@/hooks/session/useRoomSession";
import type { DrawEvent } from "@/hooks/useWhiteboard";
import { WaitingRoomPanel } from "@/components/session/WaitingRoomPanel";
import { SessionSettingsPanel } from "@/components/session/SessionSettingsPanel";
import {
  RoomStatusPills,
  RecordingPill,
  RoomTabBar,
  RoomError,
  type SidebarTab,
} from "@/components/session/room";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QAPanel } from "@/components/session/QAPanel";
import { PollPanel } from "@/components/session/PollPanel";

type MainView = "video" | "whiteboard";

type WhiteboardDrawCallback = (event: DrawEvent) => void;
type WhiteboardClearCallback = () => void;

interface RoomContentProps {
  joinCode: string;
}

function RoomContent({ joinCode }: RoomContentProps) {
  const router = useRouter();
  const [mainView, setMainView] = useState<MainView>("video");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("chat");
  const [chatOpen, setChatOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const remoteDrawRef = useRef<WhiteboardDrawCallback | null>(null);
  const remoteClearRef = useRef<WhiteboardClearCallback | null>(null);

  const [pollCount, setPollCount] = useState(0);
  const [qaCount, setQaCount] = useState(0);
  const handleQuestionCountChange = useCallback(
    (openCount: number, answeredCount: number) => {
      setQaCount(openCount + answeredCount);
    },
    [],
  );

  const {
    session,
    isLoading,
    isGuest,
    guestName,
    currentUserId,
    isHost,
    isCohost,
    isSpeaker,
    canManage,
    handRaised,
    elapsedSeconds,
    liveKitError,
    localParticipant,
    remoteParticipants,
    isLiveKitConnected,
    isMuted,
    isCameraOff,
    isScreenSharing,
    canPublish,
    messages,
    participants,
    raisedHands,
    activeSpeakerIds,
    isRecording,
    recordingLoading,
    waitingParticipants,
    roomChatEnabled,
    roomVideoEnabled,
    roomMicEnabled,
    roomRecordingEnabled,
    socketRef,
    isLocked,
    toggleLock,
    formatElapsed,
    handleRaiseHand,
    handleToggleRecording,
    handleStartAudioRecording,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    disconnect,
    sendMessage,
    promoteParticipant,
    demoteParticipant,
    lowerHandForUser,
    endSession,
    makeCohost,
    removeCohost,
    setOnWhiteboardDraw,
    setOnWhiteboardClear,
  } = useRoomSession();

  // Debug logging for co-host controls issue
  useEffect(() => {
    console.log("[RoomSession Debug]", {
      isHost,
      isCohost,
      isSpeaker,
      canPublish,
      canManage,
      isGuest,
      currentUserId: currentUserId?.slice(0, 8) + "...",
    });
  }, [
    isHost,
    isCohost,
    isSpeaker,
    canPublish,
    canManage,
    isGuest,
    currentUserId,
  ]);

  console.log(
    "[ControlBar props] isCohost:",
    isCohost,
    "isHost:",
    isHost,
    "canPublish:",
    canPublish,
  );
  // Register whiteboard callbacks
  useEffect(() => {
    setOnWhiteboardDraw((event) => remoteDrawRef.current?.(event));
    setOnWhiteboardClear(() => remoteClearRef.current?.());
    return () => {
      setOnWhiteboardDraw(null);
      setOnWhiteboardClear(null);
    };
  }, [setOnWhiteboardDraw, setOnWhiteboardClear]);

  // Auto-switch to waiting tab when first guest arrives
  const prevWaitingCountRef = useRef(0);
  useEffect(() => {
    const prevCount = prevWaitingCountRef.current;
    prevWaitingCountRef.current = waitingParticipants.length;
    if (canManage && prevCount === 0 && waitingParticipants.length > 0) {
      setSidebarTab("waiting");
      setChatOpen(true);
      setMobileSheetOpen(true);
    }
  }, [waitingParticipants.length, canManage]);

  async function handleLeave() {
    await disconnect();
    if (isGuest) {
      clearGuestCookies();
      window.location.href = `/room/${joinCode}/join`;
    } else {
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
    return <RoomError error={liveKitError} isGuest={isGuest} />;
  }

  // Sidebar content
  const sidebarContent = (
    <>
      {sidebarTab === "chat" && (
        <ChatPanel
          messages={messages}
          onSend={sendMessage}
          chatEnabled={roomChatEnabled}
        />
      )}
      {sidebarTab === "qa" && session && (
        <QAPanel
          joinCode={joinCode}
          socketRef={socketRef}
          canManage={canManage}
          onQuestionCountChange={handleQuestionCountChange}
        />
      )}
      {sidebarTab === "polls" && session && (
        <PollPanel
          joinCode={joinCode}
          socketRef={socketRef}
          canManage={canManage}
          onPollCountChange={setPollCount}
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
          onDemote={demoteParticipant}
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

  return (
    <div className="h-screen bg-ink-900 relative overflow-hidden flex flex-col">
      {/* Status pills */}
      <RoomStatusPills
        isLiveKitConnected={isLiveKitConnected}
        sessionTitle={session?.title}
        startedAt={session?.startedAt ?? undefined}
        elapsedSeconds={elapsedSeconds}
        isGuest={isGuest}
        guestName={guestName ?? undefined}
        formatElapsed={formatElapsed}
      />

      {/* Recording pill */}
      {isRecording && <RecordingPill />}

      {/* Body */}
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
              onRemoteDraw={(fn) => (remoteDrawRef.current = fn)}
              onRemoteClear={(fn) => (remoteClearRef.current = fn)}
            />
          </div>
        </div>

        {/* Sidebar — desktop/tablet */}
        {chatOpen && (
          <div className="hidden md:flex w-80 shrink-0 flex-col border-l border-white/10 bg-white/3 backdrop-blur-xl overflow-hidden">
            <RoomTabBar
              activeTab={sidebarTab}
              onChange={setSidebarTab}
              onClose={() => setChatOpen(false)}
              messageCount={messages.length}
              participantCount={participants.length}
              waitingCount={waitingParticipants.length}
              canManage={canManage}
              qaCount={qaCount}
              pollCount={pollCount}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      <BottomSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        height="tall"
      >
        <div className="flex flex-col h-full">
          <RoomTabBar
            activeTab={sidebarTab}
            onChange={setSidebarTab}
            mobile
            messageCount={messages.length}
            participantCount={participants.length}
            waitingCount={waitingParticipants.length}
            canManage={canManage}
            qaCount={qaCount}
            pollCount={pollCount}
          />
          <div className="flex-1 min-h-0 overflow-hidden">{sidebarContent}</div>
        </div>
      </BottomSheet>

      {/* Control bar */}
      <footer className="shrink-0 flex justify-center p-3 md:p-6 z-30">
        <ControlBar
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          canPublish={canPublish}
          isHost={isHost}
          isCohost={isCohost}
          isSpeaker={isSpeaker}
          handRaised={handRaised}
          isRecording={isRecording}
          recordingLoading={recordingLoading}
          recordingEnabled={roomRecordingEnabled}
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
          onStartAudioRecording={handleStartAudioRecording}
          onToggleWhiteboard={() =>
            setMainView((v) => (v === "whiteboard" ? "video" : "whiteboard"))
          }
          onOpenChat={() => openPanel("chat")}
          onOpenPeople={() => openPanel("participants")}
          onEndSession={handleEndSession}
          onLeave={handleLeave}
          onToggleLock={toggleLock}
          isLocked={isLocked}
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
