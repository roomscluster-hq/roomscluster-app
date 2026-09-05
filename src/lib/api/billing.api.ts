import { client, unwrap } from "./client";

export interface BillingStatus {
  plan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
  subscriptionStatus: string;
  maxTeammates: number | null;
  teammatesUsed: number;
  maxCoHostsPerSession: number;
  maxSessionMinutes: number | null;
  maxRecordingMinutes: number | null;
  canRecordVideo: boolean;
  canRecordBothSimultaneously: boolean;
  groupsEnabled: boolean;
  customBrandingEntitled: boolean;
  trialEndsAt: string | null;
  subscriptionRenewsAt: string | null;
}

export const billingApi = {
  initiateUpgrade: async (organizationId: string, targetPlan: "PRO" | "BUSINESS") => {
    const res = await client.post<{ data: { authorizationUrl: string } }>(
      `/billing/${organizationId}/upgrade`,
      { targetPlan },
    );
    return unwrap(res);
  },

  verifyTransaction: async (reference: string) => {
    const res = await client.get<{ data: { status: string; message: string } }>(
      `/billing/verify/${reference}`,
    );
    return unwrap(res);
  },

  getStatus: async (organizationId: string) => {
    const res = await client.get<{ data: BillingStatus }>(`/billing/${organizationId}/status`);
    return unwrap(res);
  },
};