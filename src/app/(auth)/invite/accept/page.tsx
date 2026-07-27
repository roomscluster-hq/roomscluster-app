"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { invitationsApi } from "@/lib/api/invitations.api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getInitials } from "@/lib/utils";
import { Building2, Lock } from "lucide-react";
import { toast } from "sonner";

function BrandMark() {
  return (
    <div className="flex flex-col items-center mb-8">
      <Image
        src="/favicon.png"
        alt="RoomsCluster"
        width={80}
        height={80}
        className="mb-4"
        priority
      />
      <h1 className="text-xl font-bold text-ink-900">RoomsCluster</h1>
    </div>
  );
}

function AcceptInvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { isAuthenticated, user } = useAuthStore();

  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => invitationsApi.getByToken(token!),
    enabled: !!token,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => invitationsApi.accept(token!),
    onSuccess: () => {
      toast.success("You've joined the organization!");
      router.push("/dashboard/sessions");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to accept invitation");
    },
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-ink-900">Invalid invitation link</h1>
          <p className="text-ink-700/60 text-sm mt-2">
            This invitation link is missing or malformed.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !invitation) {
    const message = (error as any)?.response?.data?.message ?? "This invitation could not be found.";
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-ink-900">Invitation unavailable</h1>
          <p className="text-ink-700/60 text-sm mt-2">{message}</p>
        </div>
      </div>
    );
  }

  const inviterName = invitation.invitedBy.name ?? invitation.invitedBy.email;

  // Logged in but with a different email than the invite was sent to
  if (isAuthenticated && user?.email !== invitation.email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-ink-900">Wrong account</h1>
          <p className="text-ink-700/60 text-sm mt-2">
            This invitation was sent to <strong>{invitation.email}</strong>, but
            you're signed in as <strong>{user?.email}</strong>. Sign out and sign
            in with the correct email to accept.
          </p>
        </div>
      </div>
    );
  }

  // Not logged in at all — send to login/register, then back here
  if (!isAuthenticated) {
    const returnUrl = `/invite/accept?token=${token}`;
    return (
      <div className="min-h-screen bg-surface-0 sm:bg-surface-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute -bottom-24 -left-24 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative w-full max-w-md">
          <BrandMark />
          <div className="bg-surface-0 sm:rounded-2xl sm:shadow-raised sm:border sm:border-surface-200 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✉️</span>
            </div>
            <h1 className="text-xl font-bold text-ink-900">
              {inviterName} invited you
            </h1>
            <p className="text-ink-700/60 text-sm mt-2">
              Join <strong>{invitation.organization.name}</strong> on RoomsCluster.
              Sign in or create an account with <strong>{invitation.email}</strong>{" "}
              to continue.
            </p>

            <div className="flex flex-col gap-2 mt-6">
              <Button onClick={() => router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)}>
                Sign in
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push(`/register?returnUrl=${encodeURIComponent(returnUrl)}&email=${encodeURIComponent(invitation.email)}`)}
              >
                Create an account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in with matching email — show accept screen
  return (
    <div className="min-h-screen bg-surface-0 sm:bg-surface-50 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-24 -left-24 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <BrandMark />

        <div className="bg-surface-0 sm:rounded-2xl sm:shadow-raised sm:border sm:border-surface-200 p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Inviter + workspace avatars */}
          <div className="relative w-full h-28 mb-6 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center">
            <div className="flex -space-x-4">
              <div className="w-14 h-14 rounded-full border-4 border-surface-0 bg-primary-600 flex items-center justify-center text-white font-bold shadow-raised">
                {getInitials(inviterName)}
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-surface-0 bg-ink-900 flex items-center justify-center text-white shadow-raised">
                <Building2 size={22} />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-ink-900 mb-3 leading-tight">
            You've been invited to join{" "}
            <span className="text-primary-600">{invitation.organization.name}</span>.
          </h2>
          <p className="text-ink-700/60 text-sm mb-8">
            <strong className="text-ink-900">{inviterName}</strong> is inviting you
            to collaborate on sessions in this workspace.
          </p>

          <Button
            className="w-full"
            onClick={() => acceptMutation.mutate()}
            loading={acceptMutation.isPending}
          >
            Accept Invitation
          </Button>

          <div className="mt-8 pt-6 border-t border-surface-200 w-full flex items-center justify-center gap-2 text-ink-700/40">
            <Lock size={14} />
            <span className="text-xs">Secure workspace invite</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <AcceptInvitePageContent />
    </Suspense>
  );
}
