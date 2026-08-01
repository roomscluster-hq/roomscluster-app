"use client";

import { AxiosError } from "axios";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "@/lib/api";
import { organizationsApi } from "@/lib/api/organizations.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  RecurrenceForm,
  RecurrenceOptions,
} from "@/components/dashboard/sessions/RecurrenceForm";
import { useAuthStore } from "@/store/auth.store";
import {
  CoHostSelector,
  SelectedCoHost,
} from "@/components/session/CoHostSelector";

export default function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const folderId = searchParams.get("folder") ?? undefined;

  const [cohosts, setCohosts] = useState<SelectedCoHost[]>([]);
  const [notifyCohosts, setNotifyCohosts] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [passcode, setPasscode] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceOptions>({
    enabled: false,
    frequency: "WEEKLY",
    interval: 1,
    endType: "COUNT",
    endCount: 4,
  });

  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });
  const activeOrg = organizations?.find((o) => o.isActive);

  // Single session mutation
  const createMutation = useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["folder-contents", folderId],
      });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session created");
      router.push(`/dashboard/sessions/${data.id}`);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? "Failed to create session");
    },
  });

  // Recurring sessions mutation
  const createRecurringMutation = useMutation({
    mutationFn: sessionsApi.createRecurring,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(`${data.count} sessions created successfully`);
      router.push("/dashboard/sessions");
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(
        err.response?.data?.message ?? "Failed to create recurring sessions",
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (recurrence.enabled) {
      // Recurring session — scheduledAt is required
      if (!scheduledAt) {
        toast.error("Please set a start date for recurring sessions");
        return;
      }
      if (recurrence.endType === "DATE" && !recurrence.endDate) {
        toast.error("Please set an end date for the recurring sessions");
        return;
      }

      createRecurringMutation.mutate({
        title,
        description: description || undefined,
        scheduledAt,
        organizationId: activeOrg?.id ?? "",
        recurrence: {
          frequency: recurrence.frequency,
          interval: recurrence.interval,
          endType: recurrence.endType,
          endDate: recurrence.endDate,
          endCount: recurrence.endCount,
        },
        coHostUserIds: cohosts.map((c) => c.userId),
      });
    } else {
      // Single session
      createMutation.mutate({
        title,
        description: description || undefined,
        scheduledAt: scheduledAt || undefined,
        passcode: passcode || undefined,
        folderId,
        coHostUserIds: cohosts.map((c) => c.userId),
      });
    }
  }

  const isPending =
    createMutation.isPending || createRecurringMutation.isPending;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">
          Create New Session
        </h1>
        <p className="text-ink-700/60 text-sm mt-1">
          Set up a new webinar or virtual classroom
          {folderId && (
            <span className="text-primary-600">
              {" "}
              · will be created inside this folder
            </span>
          )}
        </p>
      </div>

      {activeOrg && (
        <div className="flex items-center gap-2.5 bg-primary-50 border border-primary-100 rounded-lg px-4 py-3 mb-6">
          <span className="w-7 h-7 rounded-lg bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {activeOrg.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm text-ink-700">
              Creating in{" "}
              <strong>
                {activeOrg.isPersonal
                  ? "your Personal Workspace"
                  : activeOrg.name}
              </strong>
            </p>
            <p className="text-xs text-ink-700/50">
              Wrong workspace? Switch it from the menu in the top bar before
              creating.
            </p>
          </div>
        </div>
      )}

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
                {recurrence.enabled
                  ? "Start Date & Time *"
                  : "Schedule Date & Time"}
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required={recurrence.enabled}
                className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              {!recurrence.enabled && (
                <p className="text-xs text-ink-700/40 mt-1">
                  Leave empty to start an instant session
                </p>
              )}
            </div>

            {/* Passcode — hidden for recurring sessions */}
            {!recurrence.enabled && (
              <Input
                label="Passcode (optional)"
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Leave empty for no passcode"
              />
            )}

            {/* Co-hosts */}
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
            {cohosts.length > 0 && (
              <label className="flex items-center gap-2.5 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={notifyCohosts}
                  onChange={(e) => setNotifyCohosts(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-200 text-primary-600 focus:ring-primary-600"
                />
                <span className="text-sm text-ink-700">
                  Notify co-hosts by email
                </span>
              </label>
            )}
            {/* Divider */}
            <div className="border-t border-surface-200 pt-5">
              <RecurrenceForm value={recurrence} onChange={setRecurrence} />
            </div>

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
                loading={isPending}
                className="w-full sm:w-auto"
              >
                {recurrence.enabled
                  ? `Create ${recurrence.endType === "COUNT" ? (recurrence.endCount ?? "") : ""} Sessions`
                  : "Create Session"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
