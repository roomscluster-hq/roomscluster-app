"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LocalParticipant,
  RemoteParticipant,
  Track,
  TrackPublication,
} from "livekit-client";
import { getInitials, cn } from "@/lib/utils";
import { MicOff, Hand } from "lucide-react";

interface RaisedHand {
  userId: string;
  name: string;
  email: string;
}

// ── Audio renderer ──────────────────────────────────
function AudioRenderer({ participant }: { participant: RemoteParticipant }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const attachExisting = () => {
      const pubs = [...participant.audioTrackPublications.values()];
      for (const pub of pubs) {
        if (pub.track && pub.track.source === Track.Source.Microphone)
          pub.track.attach(el);
      }
    };
    attachExisting();
    const handleSubscribed = (_: any, pub: TrackPublication) => {
      if (pub.track?.source === Track.Source.Microphone) pub.track.attach(el);
    };
    const handleUnsubscribed = (_: any, pub: TrackPublication) => {
      if (pub.track?.source === Track.Source.Microphone) pub.track.detach(el);
    };
    participant.on("trackSubscribed", handleSubscribed);
    participant.on("trackUnsubscribed", handleUnsubscribed);
    return () => {
      participant.off("trackSubscribed", handleSubscribed);
      participant.off("trackUnsubscribed", handleUnsubscribed);
      const pubs = [...participant.audioTrackPublications.values()];
      for (const pub of pubs) pub.track?.detach(el);
    };
  }, [participant]);

  return (
    <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />
  );
}

// ── Screen share tile ───────────────────────────────
function ScreenShareTile({
  participant,
}: {
  participant: LocalParticipant | RemoteParticipant;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const name = participant.name ?? participant.identity;

  useEffect(() => {
    if (!videoRef.current) return;
    const pubs = [...participant.videoTrackPublications.values()];
    const screenTrack = pubs.find(
      (pub) => pub.track?.source === Track.Source.ScreenShare,
    )?.track;
    if (screenTrack && videoRef.current) screenTrack.attach(videoRef.current);
    return () => { screenTrack?.detach(); };
  }, [participant]);

  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement) setIsFullscreen(false);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        const video = videoRef.current as any;
        if (video?.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
          setIsFullscreen(true);
        }
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-ink-900 rounded-xl overflow-hidden border-2 border-primary-500 w-full shrink-0",
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-0" : "",
      )}
      style={isFullscreen ? {} : { aspectRatio: "16/9" }}
    >
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/60 to-transparent">
        <div className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded font-medium">
          {name} — Screen
        </div>
        <button onClick={toggleFullscreen} className="bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 transition">
          {isFullscreen ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Video tile — restored to working original approach ──
interface VideoTileProps {
  participant: LocalParticipant | RemoteParticipant;
  isLocal?: boolean;
  hasRaisedHand?: boolean;
  isSpeaking?: boolean;
}

function VideoTile({ participant, isLocal, hasRaisedHand, isSpeaking }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const name = participant.name ?? participant.identity;

  // ── Use participant.isCameraEnabled directly ──
  // This is the original working approach — re-run effect when camera toggles
  const isCameraEnabled = participant.isCameraEnabled;

  useEffect(() => {
    if (!videoRef.current) return;
    const publications = [...participant.videoTrackPublications.values()] as TrackPublication[];
    const videoTrack = publications.find(
      (pub) => pub.track?.source === Track.Source.Camera
    )?.track;

    if (videoTrack && videoRef.current) {
      videoTrack.attach(videoRef.current);
    }

    return () => {
      videoTrack?.detach();
    };
  }, [participant, isCameraEnabled]);

  return (
    <div
      className={cn(
        "relative bg-ink-800 rounded-xl overflow-hidden border-2 transition-colors duration-150",
        "w-full aspect-video md:aspect-auto md:w-full md:h-full",
        isLocal ? "border-primary-600/60" : "border-transparent",
        isSpeaking && "border-success-500",
      )}
    >
      {isCameraEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-ink-800">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg md:text-2xl font-bold shadow-lg">
            {getInitials(name ?? "?")}
          </div>
          <span className="text-white/60 text-xs">{name}</span>
        </div>
      )}

      {hasRaisedHand && (
        <div className="absolute top-1.5 left-1.5 bg-warning-500 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow">
          <Hand className="w-3 h-3 text-white" />
          <span className="text-white text-[10px] font-medium hidden sm:inline">Hand raised</span>
        </div>
      )}

      {isLocal && (
        <div className="absolute top-1.5 right-1.5 bg-primary-600/80 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
          You
        </div>
      )}

      {isCameraEnabled && (
        <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-md truncate max-w-[80%]">
          {name}
        </div>
      )}

      {!participant.isMicrophoneEnabled && (
        <div className="absolute bottom-1.5 right-1.5 bg-danger-600/80 rounded-full p-1">
          <MicOff className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}

// ── Grid layout calculator ──────────────────────────
function getDesktopGridDimensions(count: number): [number, number] {
  if (count === 1) return [1, 1];
  if (count === 2) return [2, 1];
  if (count === 3) return [3, 1];
  if (count === 4) return [2, 2];
  if (count <= 6) return [3, 2];
  if (count <= 9) return [3, 3];
  return [4, 3];
}

function getMobileColumns(count: number): number {
  if (count === 1) return 1;
  return 2;
}

const PAGE_SIZE = 12;

interface VideoGridProps {
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  raisedHands?: RaisedHand[];
  activeSpeakerIds?: Set<string>;
}

export function VideoGrid({
  localParticipant,
  remoteParticipants,
  raisedHands = [],
  activeSpeakerIds,
}: VideoGridProps) {
  const [page, setPage] = useState(0);
  const raisedHandIds = new Set(raisedHands.map((h) => h.userId));

  // Build screen sharing sources with deduplication
  const screenSharingSources = useMemo(() => {
    const seen = new Set<string>();
    const candidates = [
      ...(localParticipant ? [localParticipant] : []),
      ...remoteParticipants,
    ];
    
    return candidates.filter((p) => {
      // Skip duplicates
      if (seen.has(p.identity)) return false;
      seen.add(p.identity);
      
      // Check if sharing screen
      return [...p.videoTrackPublications.values()].some(
        (pub) => pub.track?.source === Track.Source.ScreenShare,
      );
    });
  }, [localParticipant, remoteParticipants]);

  // Build participants list with deduplication - local participant takes priority
  const allParticipants = useMemo(() => {
    const seen = new Set<string>();
    const result: { participant: LocalParticipant | RemoteParticipant; isLocal: boolean }[] = [];
    
    // Add local participant first
    if (localParticipant) {
      result.push({ participant: localParticipant, isLocal: true });
      seen.add(localParticipant.identity);
    }
    
    // Add remote participants, skipping any duplicates
    for (const p of remoteParticipants) {
      if (!seen.has(p.identity)) {
        result.push({ participant: p, isLocal: false });
        seen.add(p.identity);
      }
    }
    
    return result;
  }, [localParticipant, remoteParticipants]);

  const totalPages = Math.ceil(allParticipants.length / PAGE_SIZE);
  const paginated = allParticipants.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const [desktopCols, desktopRows] = getDesktopGridDimensions(paginated.length);
  const mobileCols = getMobileColumns(paginated.length);

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      const id = setTimeout(() => setPage(totalPages - 1), 0);
      return () => clearTimeout(id);
    }
    return;
  }, [totalPages, page]);

  return (
    <div className="flex flex-col h-full w-full gap-2 p-2">
      {/* Hidden audio renderers */}
      {remoteParticipants.map((p) => (
        <AudioRenderer key={p.identity} participant={p} />
      ))}

      {/* Screen share */}
      {screenSharingSources.length > 0 && (
        <div className="shrink-0 flex flex-col gap-2">
          {screenSharingSources.map((p) => (
            <ScreenShareTile key={`screen-${p.identity}`} participant={p} />
          ))}
        </div>
      )}

      {/* Desktop grid */}
      <div
        className="hidden md:grid gap-2"
        style={{
          flex: 1,
          minHeight: 0,
          gridTemplateColumns: `repeat(${desktopCols}, 1fr)`,
          gridTemplateRows: `repeat(${desktopRows}, 1fr)`,
        }}
      >
        {paginated.map(({ participant, isLocal }) => (
          <VideoTile
            key={participant.identity}
            participant={participant}
            isLocal={isLocal}
            hasRaisedHand={raisedHandIds.has(participant.identity)}
            isSpeaking={activeSpeakerIds?.has(participant.identity)}
          />
        ))}
      </div>

      {/* Mobile grid */}
      <div className="md:hidden flex-1 overflow-y-auto">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${mobileCols}, 1fr)`,
            gap: "8px",
            alignContent: "start",
          }}
        >
          {paginated.map(({ participant, isLocal }) => (
            <VideoTile
              key={participant.identity}
              participant={participant}
              isLocal={isLocal}
              hasRaisedHand={raisedHandIds.has(participant.identity)}
              isSpeaking={activeSpeakerIds?.has(participant.identity)}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-center gap-4 py-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
            Prev
          </button>
          <span className="text-white/60 text-xs">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm transition"
          >
            Next
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}