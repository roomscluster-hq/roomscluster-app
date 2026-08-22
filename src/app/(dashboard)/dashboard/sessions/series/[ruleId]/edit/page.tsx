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
import {
  RecurrenceForm,
  RecurrenceOptions,
} from "@/components/dashboard/sessions/RecurrenceForm";
import { AlertTriangle } from "lucide-react";

export default function EditSeriesPage() {
  const { ruleId } = useParams<{ ruleId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passcode, setPasscode] = useState("");
  const [cohosts, setCohosts] = useState<SelectedCoHost[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceOptions>({
    enabled: true,
    frequency: "WEEKLY",
    interval: 1,
    endType: "COUNT",
    endCount: 4,
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch series data
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["series", ruleId],
    queryFn: () => sessionsApi.getSeries(ruleId),
  });

  const session = sessions?.[0];

  // Get organization info for co-host selector
  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
    enabled: !!session?.organizationId,
  });
  const activeOrg = organizations?.find((o) => o.id === session?.organizationId);

  // Populate form when series data loads
  useEffect(() => {
    if (session) {
      setTitle(session.title);
      setDescription(session.description ?? "");
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

  // Handle update error
  const handleUpdateError = (err: AxiosError<{ message?: string }>) => {
    const message = err.response?.data?.message;
    toast.error(message ?? "Failed to update series");
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      passcode?: string;
      coHostUserIds?: string[];
      recurrence?: {
        frequency?: "DAILY" | "WEEKLY" | "MONTHLY";
        interval?: number;
        endType?: "DATE" | "COUNT";
        endDate?: string;
        endCount?: number;
      };
    }) => sessionsApi.updateSeries(ruleId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["series", ruleId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      toast.success(`Series updated successfully. ${result.updated} sessions affected.`);
      router.push("/dashboard/sessions");
    },
    onError: handleUpdateError,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    const payload: any = {
      title,
      description: description || undefined,
      passcode: passcode || undefined,
      coHostUserIds: cohosts.map((c) => c.userId),
    };

    // Only include recurrence if user wants to modify it
    if (recurrence.enabled) {
      payload.recurrence = {
        frequency: recurrence.frequency,
        interval: recurrence.interval,
        endType: recurrence.endType,
        endDate: recurrence.endDate,
        endCount: recurrence.endCount,
      };
    }

    updateMutation.mutate(payload);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="max-w-2xl">
        <p className="text-ink-700">Series not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">
          Edit Series
        </h1>
        <p className="text-ink-700/60 text-sm mt-1">
          Update all sessions in this recurring series
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning-800">
              Changes apply to all sessions
            </p>
            <p className="text-xs text-warning-700/80 mt-1">
              This will update {sessions.length} sessions in the series. 
              Any session-specific changes will be overwritten.
            </p>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-danger-800">
            Are you sure you want to update all {sessions.length} sessions?
          </p>
          <p className="text-xs text-danger-700/80 mt-1">
            This action cannot be undone.
          </p>
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
              placeholder="e.g. Weekly Team Meeting"
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
                placeholder="What is this series about?"
              />
            </div>

            <Input
              label="Passcode (optional)"
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Leave empty for no passcode"
            />

            {/* Recurrence Settings */}
            <div className="border-t border-surface-200 pt-5">
              <RecurrenceForm value={recurrence} onChange={setRecurrence} />
            </div>

            {/* Co-hosts - only for non-personal organizations */}
            {activeOrg && !activeOrg.isPersonal && (
              <div className="border-t border-surface-200 pt-5">
                <CoHostSelector
                  organizationId={activeOrg.id}
                  currentUserId={user?.id ?? ""}
                  value={cohosts}
                  onChange={setCohosts}
                />
                {cohosts.length > 2 && (
                  <p className="text-xs text-danger-600 mt-2">
                    Maximum 2 co-hosts allowed. Please remove {cohosts.length - 2} co-host(s).
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (showConfirmation) {
                    setShowConfirmation(false);
                  } else {
                    router.back();
                  }
                }}
              >
                {showConfirmation ? "Back" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={cohosts.length > 2 || updateMutation.isPending}
                variant="default"
                className="w-full sm:w-auto"
              >
                {updateMutation.isPending ? (showConfirmation ? "Confirming..." : "Updating...") : (showConfirmation ? "Confirm Update" : "Update Series")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
