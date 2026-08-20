"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Enrollment, enrollmentApi } from "@/lib/api/enrollment.api";
import { parseCsvEmails } from "@/lib/utils/parseCsv";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useEnrollmentManagement(groupId: string) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [singleEmail, setSingleEmail] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [removeTarget, setRemoveTarget] = useState<string | null>(null); // email
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false);
  const [singleExpiresAt, setSingleExpiresAt] = useState("");
  const [bulkExpiresAt, setBulkExpiresAt] = useState("");
  const [editTarget, setEditTarget] = useState<Enrollment | null>(null);
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [hardDeleteTarget, setHardDeleteTarget] = useState<string | null>(null);
  const [bulkReactivateOpen, setBulkReactivateOpen] = useState(false);
  const [bulkExpiryOpen, setBulkExpiryOpen] = useState(false);
  const [bulkExpiryValue, setBulkExpiryValue] = useState("");
  const [bulkHardDeleteOpen, setBulkHardDeleteOpen] = useState(false);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [bulkSendWelcomeEmail, setBulkSendWelcomeEmail] = useState(true);
  const [statusFilter, setStatusFilterRaw] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  function setStatusFilter(next: "ALL" | "ACTIVE" | "INACTIVE") {
    setStatusFilterRaw(next);
    setPage(1);
  }

  const { data, isLoading } = useQuery({
    queryKey: ["group-members", groupId, page, statusFilter],
    queryFn: () =>
      enrollmentApi.list(
        groupId,
        page,
        pageSize,
        statusFilter === "ALL" ? undefined : statusFilter,
      ),
    enabled: !!groupId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });

  const addMutation = useMutation({
    mutationFn: (email: string) =>
      enrollmentApi.addMember(
        groupId,
        email,
        singleExpiresAt || undefined,
        sendWelcomeEmail,
      ),
    onSuccess: () => {
      invalidate();
      toast.success("Member added");
      setSingleEmail("");
      setSingleExpiresAt("");
    },
    onError: () => toast.error("Failed to add member"),
  });

  const bulkAddMutation = useMutation({
    mutationFn: (emails: string[]) =>
      enrollmentApi.bulkAddMembers(
        groupId,
        emails,
        bulkExpiresAt || undefined,
        bulkSendWelcomeEmail,
      ),
    onSuccess: (result) => {
      invalidate();
      toast.success(`Added ${result.enrolled} member(s)`);
      setBulkText("");
      setBulkExpiresAt("");
      setBulkOpen(false);
      setInvalidEmails([]);
    },
    onError: () => toast.error("Failed to add members"),
  });

  function selectedEmails() {
    return (data?.members ?? [])
      .filter((m) => selectedIds.has(m.id))
      .map((m) => m.memberEmail);
  }

  const bulkReactivateMutation = useMutation({
    mutationFn: (emails: string[]) =>
      enrollmentApi.bulkReactivate(groupId, emails),
    onSuccess: (result) => {
      invalidate();
      toast.success(`Reactivated ${result.reactivated} member(s)`);
      setSelectedIds(new Set());
      setBulkReactivateOpen(false);
    },
    onError: () => toast.error("Failed to reactivate members"),
  });

  const bulkSetExpiryMutation = useMutation({
    mutationFn: (expiresAt: string | null) =>
      enrollmentApi.bulkSetExpiry(groupId, selectedEmails(), expiresAt),
    onSuccess: (result) => {
      invalidate();
      toast.success(`Updated ${result.updated} member(s)`);
      setSelectedIds(new Set());
      setBulkExpiryOpen(false);
      setBulkExpiryValue("");
    },
    onError: () => toast.error("Failed to update members"),
  });

  const bulkHardDeleteMutation = useMutation({
    mutationFn: (emails: string[]) =>
      enrollmentApi.bulkHardDelete(groupId, emails),
    onSuccess: (result) => {
      invalidate();
      toast.success(`Permanently deleted ${result.deleted} member(s)`);
      setSelectedIds(new Set());
      setBulkHardDeleteOpen(false);
    },
    onError: () => toast.error("Failed to delete members"),
  });

  const updateMutation = useMutation({
    mutationFn: (params: { email: string; expiresAt: string | null }) =>
      enrollmentApi.updateExpiry(groupId, params.email, params.expiresAt),
    onSuccess: () => {
      invalidate();
      toast.success("Member updated");
      setEditTarget(null);
    },
    onError: () => toast.error("Failed to update member"),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (email: string) => enrollmentApi.hardDelete(groupId, email),
    onSuccess: () => {
      invalidate();
      toast.success("Member permanently deleted");
      setHardDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete member"),
  });

  const removeMutation = useMutation({
    mutationFn: (email: string) => enrollmentApi.removeMember(groupId, email),
    onSuccess: () => {
      invalidate();
      toast.success("Member removed");
      setRemoveTarget(null);
    },
    onError: () => toast.error("Failed to remove member"),
  });

  const bulkRemoveMutation = useMutation({
    mutationFn: (emails: string[]) =>
      enrollmentApi.bulkRemoveMembers(groupId, emails),
    onSuccess: (result) => {
      invalidate();
      toast.success(`Removed ${result.removed} member(s)`);
      setSelectedIds(new Set());
      setBulkRemoveOpen(false);
    },
    onError: () => toast.error("Failed to remove members"),
  });

  function handleAddSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!singleEmail.trim()) return;
    addMutation.mutate(singleEmail.trim().toLowerCase());
  }

  function parseBulkText() {
    const raw = bulkText
      .split(/[\n,]/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const valid = [...new Set(raw.filter((e) => EMAIL_REGEX.test(e)))];
    const invalid = raw.filter((e) => !EMAIL_REGEX.test(e));
    return { valid, invalid };
  }

  function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { valid, invalid } = parseBulkText();
    if (invalid.length > 0) {
      setInvalidEmails(invalid);
      return;
    }
    if (valid.length === 0) return;
    bulkAddMutation.mutate(valid);
  }

  function confirmRemove(email: string) {
    setRemoveTarget(email);
  }

  function executeRemove() {
    if (removeTarget) removeMutation.mutate(removeTarget);
  }

  function executeBulkReactivate() {
    bulkReactivateMutation.mutate(selectedEmails());
  }

  function executeBulkSetExpiry() {
    bulkSetExpiryMutation.mutate(bulkExpiryValue || null);
  }

  function executeBulkHardDelete() {
    bulkHardDeleteMutation.mutate(selectedEmails());
  }

  // selectedIds holds member IDs (enrollment.id) — bulk remove needs emails,
  // so map back from the current page's data before firing
  function executeBulkRemove() {
    const emails = (data?.members ?? [])
      .filter((m) => selectedIds.has(m.id))
      .map((m) => m.memberEmail);
    bulkRemoveMutation.mutate(emails);
  }

  async function handleCsvUpload(file: File) {
    setIsParsingCsv(true);
    try {
      const emails = await parseCsvEmails(file);
      if (emails.length === 0) {
        toast.error("No valid emails found in that file");
        return;
      }
      setBulkText(emails.join("\n"));
    } catch {
      toast.error("Couldn't read that file");
    } finally {
      setIsParsingCsv(false);
    }
  }

  function startEdit(member: Enrollment) {
    setEditTarget(member);
    setEditExpiresAt(member.expiresAt ? member.expiresAt.slice(0, 10) : "");
  }

  function saveEdit() {
    if (!editTarget) return;
    updateMutation.mutate({
      email: editTarget.memberEmail,
      expiresAt: editExpiresAt || null,
    });
  }

  function confirmHardDelete(email: string) {
    setHardDeleteTarget(email);
  }

  function executeHardDelete() {
    if (hardDeleteTarget) hardDeleteMutation.mutate(hardDeleteTarget);
  }

  return {
    members: data?.members ?? [],
    page,
    setPage,
    totalPages: data?.totalPages ?? 1,
    isLoading,

    singleEmail,
    setSingleEmail,
    handleAddSingle,
    isAdding: addMutation.isPending,

    bulkText,
    setBulkText,
    bulkOpen,
    setBulkOpen,
    invalidEmails,
    handleBulkSubmit,
    isBulkAdding: bulkAddMutation.isPending,

    selectedIds,
    setSelectedIds,

    removeTarget,
    confirmRemove,
    cancelRemove: () => setRemoveTarget(null),
    executeRemove,
    isRemoving: removeMutation.isPending,

    bulkRemoveOpen,
    setBulkRemoveOpen,
    executeBulkRemove,
    isBulkRemoving: bulkRemoveMutation.isPending,
    handleCsvUpload,
    singleExpiresAt,
    setSingleExpiresAt,
    bulkExpiresAt,
    setBulkExpiresAt,
    editTarget,
    editExpiresAt,
    setEditExpiresAt,
    startEdit,
    saveEdit,
    cancelEdit: () => setEditTarget(null),
    isUpdating: updateMutation.isPending,
    hardDeleteTarget,
    confirmHardDelete,
    cancelHardDelete: () => setHardDeleteTarget(null),
    executeHardDelete,
    isHardDeleting: hardDeleteMutation.isPending,
    statusFilter,
    setStatusFilter,
    bulkReactivateOpen,
    setBulkReactivateOpen,
    executeBulkReactivate,
    isBulkReactivating: bulkReactivateMutation.isPending,
    bulkExpiryOpen,
    setBulkExpiryOpen,
    bulkExpiryValue,
    setBulkExpiryValue,
    executeBulkSetExpiry,
    isBulkSettingExpiry: bulkSetExpiryMutation.isPending,
    bulkHardDeleteOpen,
    setBulkHardDeleteOpen,
    executeBulkHardDelete,
    isBulkHardDeleting: bulkHardDeleteMutation.isPending,
    isParsingCsv,

    sendWelcomeEmail,
    setSendWelcomeEmail,
    bulkSendWelcomeEmail,
    setBulkSendWelcomeEmail,
  };
}
