import { client, unwrap } from "./client";
import { getCookie } from "@/lib/cookies";
import type { LiveKitTokenResponse } from "@/types";

export const livekitApi = {
  getToken: async (joinCode: string) => {
    const res = await client.post<{ data: LiveKitTokenResponse }>(
      `/livekit/token/${joinCode}`
    );
    return unwrap(res);
  },

  getGuestToken: async (joinCode: string, name: string, email: string) => {
    const res = await client.post<{ data: LiveKitTokenResponse }>(
      `/livekit/guest-token/${joinCode}`,
      { name, email }
    );
    return unwrap(res);
  },

  refreshGuestToken: async (joinCode: string) => {
    const guestToken = getCookie("guest_token");
    const res = await client.post<{ data: LiveKitTokenResponse }>(
      `/livekit/guest-token/${joinCode}/promote`,
      { guestToken }
    );
    return unwrap(res);
  },
};