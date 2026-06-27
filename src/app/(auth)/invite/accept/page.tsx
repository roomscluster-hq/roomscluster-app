"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { invitationsApi } from "@/lib/api/invitations.api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function AcceptInvitePage() {
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
          <h1 className="text-xl font-semibold text-gray-900">Invalid invitation link</h1>
          <p className="text-gray-500 text-sm mt-2">
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
          <h1 className="text-xl font-semibold text-gray-900">Invitation unavailable</h1>
          <p className="text-gray-500 text-sm mt-2">{message}</p>
        </div>
      </div>
    );
  }

  // Logged in but with a different email than the invite was sent to
  if (isAuthenticated && user?.email !== invitation.email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-gray-900">Wrong account</h1>
          <p className="text-gray-500 text-sm mt-2">
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {invitation.invitedBy.name ?? invitation.invitedBy.email} invited you
          </h1>
          <p className="text-gray-500 text-sm mt-2">
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
    );
  }

  // Logged in with matching email — show accept screen
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md w-full p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✉️</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {invitation.invitedBy.name ?? invitation.invitedBy.email} invited you
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Join <strong>{invitation.organization.name}</strong> as a host.
        </p>

        <Button
          className="w-full mt-6"
          onClick={() => acceptMutation.mutate()}
          loading={acceptMutation.isPending}
        >
          Accept Invitation
        </Button>
      </div>
    </div>
  );
}