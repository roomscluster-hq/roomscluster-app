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

  slugValue: string;
  onSlugChange: (value: string) => void;
  onSlugSubmit: (e: React.FormEvent) => void;
  isUpdatingSlug: boolean;

  logoUrl: string;
  onLogoUrlChange: (value: string) => void;
  primaryColor: string;
  onPrimaryColorChange: (value: string) => void;
  fontFamily: string;
  onFontFamilyChange: (value: string) => void;
  onBrandingSubmit: (e: React.FormEvent) => void;
  isUpdatingBranding: boolean;
  onLogoSubmit: (e: React.FormEvent) => void;
  isUpdatingLogo: boolean;
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
  slugValue,
  onSlugChange,
  onSlugSubmit,
  isUpdatingSlug,
  logoUrl,
  onLogoUrlChange,
  primaryColor,
  onPrimaryColorChange,
  fontFamily,
  onFontFamilyChange,
  onBrandingSubmit,
  isUpdatingBranding,
  onLogoSubmit,
  isUpdatingLogo,
}: GeneralSettingsProps) {
  return (
    <div className="space-y-6">
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
                className="flex-1 bg-surface-0 text-ink-900 placeholder:text-ink-700/40 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              <Button type="submit" size="sm" disabled={isLoading}>
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

      <Card>
        <CardContent className="py-6">
          <h2 className="font-semibold text-ink-900 mb-1">Subdomain</h2>
          <p className="text-xs text-ink-700/50 mb-4">
            Members and hosts can reach your organization directly at this
            address.
          </p>
          <form onSubmit={onSlugSubmit} className="flex items-center gap-2">
            <div className="flex-1 flex items-center border border-surface-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-600">
              <input
                value={slugValue}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="your-org"
                className="flex-1 bg-surface-0 text-ink-900 placeholder:text-ink-700/40 px-3 py-2 text-sm focus:outline-none"
              />
              <span className="px-3 py-2 text-sm text-ink-700/50 bg-surface-50 border-l border-surface-200">
                .roomscluster.com
              </span>
            </div>
            <Button type="submit" size="sm" disabled={isUpdatingSlug}>
              {isUpdatingSlug ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          <h2 className="font-semibold text-ink-900 mb-1">Logo</h2>
          <p className="text-xs text-ink-700/50 mb-4">
            Paste a link to your logo image — from any platform. We'll fetch and
            host a copy automatically.
          </p>
          <form onSubmit={onLogoSubmit} className="flex items-center gap-2">
            <input
              value={logoUrl}
              onChange={(e) => onLogoUrlChange(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="flex-1 bg-surface-0 text-ink-900 placeholder:text-ink-700/40 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <Button type="submit" size="sm" disabled={isUpdatingLogo}>
              {isUpdatingLogo ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          <h2 className="font-semibold text-ink-900 mb-1">Branding</h2>
          <p className="text-xs text-ink-700/50 mb-4">
            Applied on your subdomain and in invitation emails.
          </p>
          <form onSubmit={onBrandingSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Primary color
                </label>
                <input
                  type="color"
                  value={primaryColor || "#2563eb"}
                  onChange={(e) => onPrimaryColorChange(e.target.value)}
                  className="w-16 h-10 border border-surface-200 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Font family
                </label>
                <input
                  value={fontFamily}
                  onChange={(e) => onFontFamilyChange(e.target.value)}
                  placeholder="Inter, sans-serif"
                  className="w-full bg-surface-0 text-ink-900 placeholder:text-ink-700/40 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>
            <Button type="submit" size="sm" disabled={isUpdatingBranding}>
              {isUpdatingBranding ? "Saving..." : "Save branding"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
