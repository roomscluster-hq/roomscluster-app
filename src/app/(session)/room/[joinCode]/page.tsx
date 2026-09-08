import type { Metadata } from "next";
import RoomPageClient from "./RoomPageClient";

async function getSessionForMetadata(joinCode: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
    const res = await fetch(`${API_URL}/sessions/join/${joinCode}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ joinCode: string }>;
}): Promise<Metadata> {
  const { joinCode } = await params;
  const session = await getSessionForMetadata(joinCode);

  const title = session?.title ? `${session.title} — RoomsCluster` : "Join a session — RoomsCluster";
  const description = session?.description?.trim()
    ? session.description
    : "You've been invited to a live session on RoomsCluster.";

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "https://roomscluster.com/logo2.jpg",
          width: 1200,
          height: 630,
          alt: "RoomsCluster",
        },
      ],
    },
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ joinCode: string }>;
}) {
  const { joinCode } = await params;
  return <RoomPageClient joinCode={joinCode} />;
}