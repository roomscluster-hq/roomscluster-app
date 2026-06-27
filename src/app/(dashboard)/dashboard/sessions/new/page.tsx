"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "@/lib/api";
import { organizationsApi } from "@/lib/api/organizations.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const folderId = searchParams.get("folder") ?? undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [passcode, setPasscode] = useState("");

  // Show which organization this session will be created into
  const { data: organizations } = useQuery({
    queryKey: ["organizations-mine"],
    queryFn: organizationsApi.listMine,
  });
  const activeOrg = organizations?.find((o) => o.isActive);

  const createMutation = useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["folder-contents", folderId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });

      toast.success("Session created");
      router.push(`/dashboard/sessions/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to create session");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      title,
      description: description || undefined,
      scheduledAt: scheduledAt || undefined,
      passcode: passcode || undefined,
      folderId,
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Session</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set up a new webinar or virtual classroom
          {folderId && (
            <span className="text-blue-600"> · will be created inside this folder</span>
          )}
        </p>
      </div>

      {/* Active workspace banner — makes it unmistakable where this session lands */}
      {activeOrg && (
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {activeOrg.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm text-gray-700">
              Creating in{" "}
              <strong>
                {activeOrg.isPersonal ? "your Personal Workspace" : activeOrg.name}
              </strong>
            </p>
            <p className="text-xs text-gray-500">
              Wrong workspace? Switch it from the menu in the top bar before creating.
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="What is this session about?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
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

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={createMutation.isPending}>
                Create Session
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}