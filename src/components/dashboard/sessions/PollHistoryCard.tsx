"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useActiveOrganization } from "@/hooks/useOrganizationsMine";
import { useUpgradePromptStore } from "@/store/upgrade-prompt.store";
import { pollApi } from "@/lib/api/poll.api";
import { Lock } from "lucide-react";

export function PollHistoryCard({ sessionId }: { sessionId: string }) {
  const { activeOrg } = useActiveOrganization();
  const entitled = activeOrg?.qaPollsHistoryEnabled ?? false;

  const { data: polls, isLoading } = useQuery({
    queryKey: ["poll-history", sessionId],
    queryFn: () => pollApi.getHistory(sessionId),
    enabled: entitled,
  });

  if (!entitled) {
    return (
      <Card className="mb-4 opacity-70">
        <CardHeader>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-ink-900">Polls</h2>
            <button
              onClick={() =>
                useUpgradePromptStore
                  .getState()
                  .show("Viewing past polls requires the Pro plan.", "PRO")
              }
              className="text-[10px] font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary-100 flex items-center gap-1"
            >
              <Lock size={9} />
              Upgrade
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-700/50">
            Upgrade to Pro or higher to view polls run in this session.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-semibold text-ink-900">
          Polls {polls ? `(${polls.length})` : ""}
        </h2>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : !polls || polls.length === 0 ? (
          <p className="text-sm text-ink-700/50">No polls were run in this session.</p>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => (
              <div key={poll.id} className="border border-surface-200 rounded-lg p-3">
                <p className="text-sm font-medium text-ink-900 mb-2">{poll.question}</p>
                <div className="space-y-1.5">
                  {poll.options.map((opt) => (
                    <div key={opt.id}>
                      <div className="flex items-center justify-between text-xs text-ink-700 mb-0.5">
                        <span>{opt.text}</span>
                        <span>{opt.voteCount} ({opt.percentage}%)</span>
                      </div>
                      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink-700/40 mt-2">{poll.totalVoters} voter{poll.totalVoters === 1 ? "" : "s"}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}