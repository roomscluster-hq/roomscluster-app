"use client";

import { useEffect, useRef } from "react";
import {
  LocalParticipant,
  RemoteParticipant,
  Track,
  TrackPublication,
} from "livekit-client";
import { getInitials, cn } from "@/lib/utils";

interface RaisedHand {
  userId: string;
  name: string;
  email: string;
}

interface VideoTileProps {
  participant: LocalParticipant | RemoteParticipant;
  isLocal?: boolean;
  hasRaisedHand?: boolean;
  isSpeaking?: boolean;
}

function VideoTile({ participant, isLocal, hasRaisedHand, isSpeaking }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const name = participant.name ?? participant.identity;
  const isCameraEnabled = participant.isCameraEnabled;

  useEffect(() => {
    if (!videoRef.current) return;

    const publications = [...participant.videoTrackPublications.values()] as TrackPublication[];
    const videoTrack = publications
      .find((pub) => pub.track?.source === Track.Source.Camera)?.track;

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
        "relative bg-ink-800 rounded-card overflow-hidden aspect-video border-2 transition-colors",
        isLocal ? "border-primary-600/50" : "border-transparent",
        isSpeaking && "border-success-500"
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
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
            {getInitials(name ?? "?")}
          </div>
        </div>
      )}

      {/* Hand raise indicator — top left */}
      {hasRaisedHand && (
        <div className="absolute top-2 left-2 bg-warning-500 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-md">
          <span className="text-sm leading-none">✋</span>
          <span className="text-white text-xs font-medium">Hand raised</span>
        </div>
      )}

      {/* Self-view badge — top right */}
      {isLocal && (
        <div className="absolute top-2 right-2 bg-primary-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
          You
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
        {name}
      </div>

      {/* Mic muted indicator — bottom right */}
      {!participant.isMicrophoneEnabled && (
        <div className="absolute bottom-2 right-2 bg-danger-600 rounded-full p-1">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1 1 0 000-.501A10.008 10.008 0 0010 3a9.958 9.958 0 00-4.512 1.074L3.28 2.22zM10 5a3 3 0 013 3v1.28l-4.513-4.513A3 3 0 0110 5z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

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
  // Build a set of identities that have raised hands
  // raisedHands.userId for guests is their LiveKit identity (e.g. guest_email_timestamp)
  // for authenticated users it's their DB userId, which matches participant.identity
  const raisedHandIds = new Set(raisedHands.map(h => h.userId));

  const allParticipants = [
    ...(localParticipant ? [{ participant: localParticipant, isLocal: true }] : []),
    ...remoteParticipants.map((p) => ({ participant: p, isLocal: false })),
  ];

  return (
    <div
      className="grid gap-3 h-full auto-rows-fr"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
    >
      {allParticipants.map(({ participant, isLocal }) => (
        <VideoTile
          key={participant.identity}
          participant={participant}
          isLocal={isLocal}
          hasRaisedHand={raisedHandIds.has(participant.identity)}
          isSpeaking={activeSpeakerIds?.has(participant.identity)}
        />
      ))}
    </div>
  );
}
