"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, Loader2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FONT_OPTIONS } from "@/lib/fontFamily";

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

  currentLogoUrl: string | null;
  onLogoUpload: (file: File) => void;
  isUpdatingLogo: boolean;

  primaryColor: string;
  onPrimaryColorChange: (value: string) => void;
  fontFamily: string;
  onFontFamilyChange: (value: string) => void;
  onBrandingSubmit: (e: React.FormEvent) => void;
  isUpdatingBranding: boolean;

  customBrandingEntitled: boolean;
  onUpgradeClick: () => void;
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
  currentLogoUrl,
  onLogoUpload,
  isUpdatingLogo,
  primaryColor,
  onPrimaryColorChange,
  fontFamily,
  onFontFamilyChange,
  onBrandingSubmit,
  isUpdatingBranding,
  customBrandingEntitled,
  onUpgradeClick,
}: GeneralSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onLogoUpload(file);
  }

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

      <Card className={!customBrandingEntitled ? "opacity-60" : ""}>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-ink-900">Subdomain</h2>
            {!customBrandingEntitled && (
              <button
                onClick={onUpgradeClick}
                className="text-[10px] font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary-100 flex items-center gap-1"
              >
                <Lock size={9} />
                Upgrade
              </button>
            )}
          </div>
          <p className="text-xs text-ink-700/50 mb-4">
            Members and hosts can reach your organization directly at this
            address.
          </p>
          <form onSubmit={customBrandingEntitled ? onSlugSubmit : (e) => { e.preventDefault(); onUpgradeClick(); }} className="flex items-center gap-2">
            <div className="flex-1 flex items-center border border-surface-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-600">
              <input
                value={slugValue}
                onChange={(e) => onSlugChange(e.target.value)}
                disabled={!customBrandingEntitled}
                placeholder="your-org"
                className="flex-1 bg-surface-0 text-ink-900 placeholder:text-ink-700/40 px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed"
              />
              <span className="px-3 py-2 text-sm text-ink-700/50 bg-surface-50 border-l border-surface-200">
                .roomscluster.com
              </span>
            </div>
            <Button type="submit" size="sm" disabled={isUpdatingSlug || !customBrandingEntitled}>
              {isUpdatingSlug ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className={!customBrandingEntitled ? "opacity-60" : ""}>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-ink-900">Logo</h2>
            {!customBrandingEntitled && (
              <button
                onClick={onUpgradeClick}
                className="text-[10px] font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary-100 flex items-center gap-1"
              >
                <Lock size={9} />
                Upgrade
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center overflow-hidden">
                {currentLogoUrl ? (
                  <Image
                    src={currentLogoUrl}
                    alt="Organization logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs text-ink-700/40">No logo</span>
                )}
              </div>
              <button
                onClick={customBrandingEntitled ? () => fileInputRef.current?.click() : onUpgradeClick}
                disabled={isUpdatingLogo}
                className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-not-allowed"
                title="Change logo"
              >
                {isUpdatingLogo ? (
                  <Loader2 size={18} className="text-white animate-spin" />
                ) : (
                  <Camera size={18} className="text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div>
              <button
                onClick={customBrandingEntitled ? () => fileInputRef.current?.click() : onUpgradeClick}
                disabled={isUpdatingLogo}
                className="text-sm text-primary-600 hover:underline disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingLogo ? "Uploading..." : "Upload logo"}
              </button>
              <p className="text-xs text-ink-700/50 mt-0.5">
                JPEG, PNG, WebP or GIF — up to 5MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={!customBrandingEntitled ? "opacity-60" : ""}>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-ink-900">Branding</h2>
            {!customBrandingEntitled && (
              <button
                onClick={onUpgradeClick}
                className="text-[10px] font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary-100 flex items-center gap-1"
              >
                <Lock size={9} />
                Upgrade
              </button>
            )}
          </div>
          <p className="text-xs text-ink-700/50 mb-4">
            Applied on your subdomain and in invitation emails.
          </p>
          <form onSubmit={customBrandingEntitled ? onBrandingSubmit : (e) => { e.preventDefault(); onUpgradeClick(); }} className="space-y-4">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Primary color
                </label>
                <input
                  type="color"
                  value={primaryColor || "#2563eb"}
                  onChange={(e) => onPrimaryColorChange(e.target.value)}
                  disabled={!customBrandingEntitled}
                  className="w-16 h-10 border border-surface-200 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Font family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => onFontFamilyChange(e.target.value)}
                  disabled={!customBrandingEntitled}
                  className="w-full bg-surface-0 text-ink-900 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:cursor-not-allowed"
                >
                  <option value="">Default (Inter)</option>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" size="sm" disabled={isUpdatingBranding || !customBrandingEntitled}>
              {isUpdatingBranding ? "Saving..." : "Save branding"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}