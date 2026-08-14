"use client";

import { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "@/lib/api";
import { organizationsApi } from "@/lib/api/organizations.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import {
  CoHostSelector,
  SelectedCoHost,
} from "@/components/session/CoHostSelector";

export default function EditSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [passcode, setPasscode] = useState("");
  const [cohosts, setCohosts] = useState<SelectedCoHost[]>([]);

  // Fetch session data
  const { data: session, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionsApi.getOne(id),
  });

  // Get organization info for co-host selector
  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
    enabled: !!session?.organizationId,
  });
  const activeOrg = organizations?.find((o) => o.id === session?.organizationId);

  // Populate form when session data loads
  useEffect(() => {
    if (session) {
      setTitle(session.title);
      setDescription(session.description ?? "");
      // Format scheduledAt for datetime-local input (YYYY-MM-DDTHH:mm)
      if (session.scheduledAt) {
        const date = new Date(session.scheduledAt);
        const formatted = date.toISOString().slice(0, 16);
        setScheduledAt(formatted);
      }
      setPasscode(session.passcode ?? "");

      // Populate co-hosts from session participants
      if (session.participants) {
        const existingCohosts = session.participants
          .filter((p) => p.role === "COHOST")
          .map((p) => ({
            userId: p.userId,
            name: p.user.name ?? p.user.email,
            email: p.user.email,
            image: p.user.image,
          }));
        setCohosts(existingCohosts);
      }
    }
  }, [session]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      scheduledAt?: string;
      passcode?: string;
      coHostUserIds?: string[];
    }) => sessionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      toast.success("Session updated successfully");
      router.push(`/dashboard/sessions/${id}`);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? "Failed to update session");
    },
  });

  // Redirect if session is not editable (LIVE or ENDED)
  useEffect(() => {
    if (session && (session.status === "LIVE" || session.status === "ENDED")) {
      toast.error("Cannot edit a live or ended session");
      router.push(`/dashboard/sessions/${id}`);
    }
  }, [session, id, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    updateMutation.mutate({
      title,
      description: description || undefined,
      scheduledAt: scheduledAt || undefined,
      passcode: passcode || undefined,
      coHostUserIds: cohosts.map((c) => c.userId),
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl">
        <p className="text-ink-700">Session not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">
          Edit Session
        </h1>
        <p className="text-ink-700/60 text-sm mt-1">
          Update session details
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Session Title *"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Product Launch Webinar"
            />

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
                placeholder="What is this session about?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              <p className="text-xs text-ink-700/40 mt-1">
                Leave empty to start an instant session
              </p>
            </div>

            <Input
              label="Passcode (optional)"
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Leave empty for no passcode"
            />

            {/* Co-hosts - only for non-personal organizations */}
            {activeOrg && !activeOrg.isPersonal && (
              <div className="border-t border-surface-200 pt-5">
                <CoHostSelector
                  organizationId={activeOrg.id}
                  currentUserId={user?.id ?? ""}
                  value={cohosts}
                  onChange={setCohosts}
                />
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updateMutation.isPending}
                className="w-full sm:w-auto"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
