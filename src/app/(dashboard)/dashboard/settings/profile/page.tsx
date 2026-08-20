"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { client, unwrap } from "@/lib/api/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Lock, Trash2, Camera, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const { user, setAuth, clearAuth } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update name
  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await client.patch<{ data: any }>("/users/me", { name });
      return unwrap(res);
    },
    onSuccess: (data) => {
      const token = localStorage.getItem("access_token") ?? "";
      setAuth(data, token);
      toast.success("Name updated successfully");
    },
    onError: () => toast.error("Failed to update name"),
  });

  // Upload avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await client.post<{ data: any }>("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return unwrap(res);
    },
    onSuccess: (data) => {
      const token = localStorage.getItem("access_token") ?? "";
      setAuth(data, token);
      setAvatarPreview(null);
      toast.success("Profile picture updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to upload image");
      setAvatarPreview(null);
    },
  });

  // Update password
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await client.patch<{ data: any }>("/users/me/password", data);
      return unwrap(res);
    },
    onSuccess: () => {
      toast.success("Password updated — please sign in again");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Force logout since refresh tokens were invalidated
      setTimeout(() => {
        clearAuth();
        window.location.href = "/login";
      }, 2000);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to update password");
    },
  });

  // Delete account
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await client.delete<{ data: any }>("/users/me");
      return unwrap(res);
    },
    onSuccess: (data) => {
      clearAuth();
      toast.success(`${data}`);
      window.location.href = "/";
    },
    onError: (error) => toast.error(`${error}`),
  });

  function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    updateNameMutation.mutate(name.trim());
  }

  function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    updatePasswordMutation.mutate({ currentPassword, newPassword });
  }

  function handleDeleteAccount() {
    toast("Delete your account permanently? This cannot be undone.", {
      action: {
        label: "Delete Account",
        onClick: () => deleteAccountMutation.mutate(),
      },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 10000,
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload immediately
    uploadAvatarMutation.mutate(file);
  }

  const displayImage = avatarPreview ?? user?.image ?? null;
  const isUploadingAvatar = uploadAvatarMutation.isPending;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">Profile Settings</h1>
        <p className="text-sm text-ink-700/60 mt-1">
          Manage your personal information and account security.
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={16} className="text-ink-700/60" />
            <h2 className="font-semibold text-ink-900">Personal Information</h2>
          </div>
        </CardHeader>
        <CardContent>
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
              <div className={cn(
                "w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden",
                isUploadingAvatar && "opacity-60"
              )}>
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={user?.name ?? ""}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{getInitials(user?.name ?? user?.email ?? "?")}</span>
                )}
              </div>

              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-not-allowed"
                title="Change profile picture"
              >
                {isUploadingAvatar ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
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
              <p className="text-sm font-medium text-ink-900">{user?.name ?? "No name set"}</p>
              <p className="text-xs text-ink-700/50">{user?.email}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="text-xs text-primary-600 hover:underline mt-1 disabled:opacity-50"
              >
                {isUploadingAvatar ? "Uploading..." : "Change photo"}
              </button>
              {user?.googleId && (
                <span className="block text-xs bg-surface-100 text-ink-700/60 px-2 py-0.5 rounded mt-1 w-fit">
                  Google account
                </span>
              )}
            </div>
          </div>

          {/* Name form */}
          <form onSubmit={handleUpdateName} className="space-y-4">
            <Input
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
            <Button
              type="submit"
              disabled={name.trim() === (user?.name ?? "") || updateNameMutation.isPending}
            >
              Save Name
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password — hide for Google users */}
      {!user?.googleId && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-ink-700/60" />
              <h2 className="font-semibold text-ink-900">Change Password</h2>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
              <Button
                type="submit"
                disabled={!currentPassword || !newPassword || !confirmPassword || updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-danger-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-danger-600" />
            <h2 className="font-semibold text-danger-600">Danger Zone</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-900">Delete Account</p>
              <p className="text-xs text-ink-700/60 mt-0.5">
                Permanently delete your account and all data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
              className="shrink-0"
            >
              {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
