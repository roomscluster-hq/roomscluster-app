"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GeneralSettingsProps {
  orgName: string;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onStartEdit: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function GeneralSettings({
  orgName,
  isEditing,
  editValue,
  onEditChange,
  onStartEdit,
  onSubmit,
  onCancel,
  isLoading,
}: GeneralSettingsProps) {
  return (
    <Card>
      <CardContent className="py-6">
        <h2 className="font-semibold text-ink-900 mb-4">Organization name</h2>
        {isEditing ? (
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
              autoFocus
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              placeholder="Organization name"
              className="flex-1 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <Button type="submit" size="sm" loading={isLoading}>
              Save
            </Button>
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-ink-700/60 hover:text-ink-700 cursor-pointer px-2"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-900">{orgName}</span>
            <button
              onClick={onStartEdit}
              className="text-sm text-primary-600 hover:underline cursor-pointer"
            >
              Rename
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
