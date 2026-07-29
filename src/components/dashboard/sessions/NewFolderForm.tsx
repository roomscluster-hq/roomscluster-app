"use client";

import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewFolderFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function NewFolderForm({ value, onChange, onSubmit, onCancel, isLoading }: NewFolderFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 mb-4 bg-primary-50 border border-primary-100 rounded-lg px-4 py-3"
    >
      <Folder size={20} className="text-primary-600 shrink-0" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Folder name"
        className="flex-1 bg-surface-0 border border-surface-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
      />
      <Button type="submit" size="sm" loading={isLoading} className="cursor-pointer">
        Create
      </Button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-ink-700/60 hover:text-ink-700 px-2 cursor-pointer"
      >
        Cancel
      </button>
    </form>
  );
}
