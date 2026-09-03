"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useActiveOrganization } from "@/hooks/useOrganizationsMine";
import { useUpgradePromptStore } from "@/store/upgrade-prompt.store";
import { qaApi } from "@/lib/api/qa.api";
import { ThumbsUp, ThumbsDown, Lock } from "lucide-react";

export function QAHistoryCard({ sessionId }: { sessionId: string }) {
  const { activeOrg } = useActiveOrganization();
  const entitled = activeOrg?.qaPollsHistoryEnabled ?? false;

  const { data: questions, isLoading } = useQuery({
    queryKey: ["qa-history", sessionId],
    queryFn: () => qaApi.getHistory(sessionId),
    enabled: entitled,
  });

  if (!entitled) {
    return (
      <Card className="mb-4 opacity-70">
        <CardHeader>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-ink-900">Q&amp;A</h2>
            <button
              onClick={() =>
                useUpgradePromptStore
                  .getState()
                  .show("Viewing past Q&A requires the Pro plan.", "PRO")
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
            Upgrade to Pro or higher to view questions asked in this session.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-semibold text-ink-900">
          Q&amp;A {questions ? `(${questions.length})` : ""}
        </h2>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : !questions || questions.length === 0 ? (
          <p className="text-sm text-ink-700/50">No questions were asked in this session.</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="border border-surface-200 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-ink-900">{q.content}</p>
                  {q.isAnswered && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded">
                      Answered
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-ink-700/50">
                  <span>{q.askerName}</span>
                  <span className="flex items-center gap-1"><ThumbsUp size={12} />{q.upvotes}</span>
                  <span className="flex items-center gap-1"><ThumbsDown size={12} />{q.downvotes}</span>
                </div>
                {q.answer && (
                  <p className="text-sm text-ink-700 mt-2 pl-3 border-l-2 border-primary-200">
                    {q.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}