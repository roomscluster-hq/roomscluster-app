"use client";

import { UserPlus, Upload, Loader2 } from "lucide-react";
import {
  Pencil,
  Trash2,
  UserX,
  CheckCircle2,
  XCircle,
  Check,
  X as XIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Enrollment } from "@/lib/api/enrollment.api";
import type { useEnrollmentManagement } from "@/hooks/dashboard/useEnrollmentManagement";
import { cn } from "@/lib/utils";

type EnrollmentManagement = ReturnType<typeof useEnrollmentManagement>;

interface GroupMembersTableProps extends EnrollmentManagement {
  hideSummary?: boolean;
}

export function GroupMembersTable(props: GroupMembersTableProps) {
  const {
    members,
    page,
    setPage,
    totalPages,
    isLoading,
    singleEmail,
    setSingleEmail,
    handleAddSingle,
    isAdding,
    bulkOpen,
    setBulkOpen,
    bulkText,
    setBulkText,
    invalidEmails,
    handleBulkSubmit,
    isBulkAdding,
    selectedIds,
    setSelectedIds,
    removeTarget,
    confirmRemove,
    cancelRemove,
    executeRemove,
    isRemoving,
    bulkRemoveOpen,
    setBulkRemoveOpen,
    executeBulkRemove,
    isBulkRemoving,
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
    cancelEdit,
    isUpdating,
    hardDeleteTarget,
    confirmHardDelete,
    cancelHardDelete,
    executeHardDelete,
    isHardDeleting,
    statusFilter,
    setStatusFilter,
    bulkReactivateOpen,
    setBulkReactivateOpen,
    executeBulkReactivate,
    isBulkReactivating,
    bulkExpiryOpen,
    setBulkExpiryOpen,
    bulkExpiryValue,
    setBulkExpiryValue,
    executeBulkSetExpiry,
    isBulkSettingExpiry,
    bulkHardDeleteOpen,
    setBulkHardDeleteOpen,
    executeBulkHardDelete,
    isBulkHardDeleting,
    isParsingCsv,
    hideSummary,
    sendWelcomeEmail,
    setSendWelcomeEmail,
    bulkSendWelcomeEmail,
    setBulkSendWelcomeEmail,
  } = props;

  const columns: DataTableColumn<Enrollment>[] = [
    {
      key: "email",
      header: "Email",
      render: (m) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {m.memberEmail.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-ink-900 truncate">
            {m.memberEmail}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (m) =>
        m.status === "ACTIVE" ? (
          <span title="Active" className="text-success-600">
            <CheckCircle2 size={18} />
          </span>
        ) : (
          <span title="Inactive" className="text-danger-600">
            <XCircle size={18} />
          </span>
        ),
    },
    {
      key: "expires",
      header: "Expires",
      render: (m) =>
        editTarget?.id === m.id ? (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={editExpiresAt}
              onChange={(e) => setEditExpiresAt(e.target.value)}
              className="bg-surface-0 text-ink-700 border border-surface-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <button
              onClick={saveEdit}
              disabled={isUpdating}
              title="Save"
              className="text-success-600 hover:text-success-700 cursor-pointer"
            >
              <Check size={18} />
            </button>
            <button
              onClick={cancelEdit}
              title="Cancel"
              className="text-ink-700/50 hover:text-ink-700 cursor-pointer"
            >
              <XIcon size={18} />
            </button>
          </div>
        ) : (
          <span className="text-ink-700/60">
            {m.expiresAt ? new Date(m.expiresAt).toLocaleDateString() : "Never"}
          </span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (m) => (
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => startEdit(m)}
            title="Edit expiry"
            className="text-primary-600 hover:text-primary-700 cursor-pointer"
          >
            <Pencil size={16} />
          </button>
          {m.status === "ACTIVE" && (
            <button
              onClick={() => confirmRemove(m.memberEmail)}
              title="Mark inactive"
              className="text-warning-600 hover:text-warning-700 cursor-pointer"
            >
              <UserX size={16} />
            </button>
          )}
          <button
            onClick={() => confirmHardDelete(m.memberEmail)}
            title="Delete permanently"
            className="text-danger-600 hover:text-danger-700 cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      {/* Header */}
      <div className="p-6 border-b border-surface-200 flex flex-col gap-4">
        <div>
          <h2 className="font-semibold text-ink-900">Members</h2>
          {!hideSummary && (
            <p className="text-sm text-ink-700/50 mt-0.5">
              {members.length} shown — only active, enrolled emails can join
              sessions in this group
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <form
            onSubmit={handleAddSingle}
            className="flex flex-wrap gap-2 items-center flex-1"
          >
            <input
              type="email"
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
              placeholder="member@example.com"
              required
              className="flex-1 min-w-45 bg-surface-0 text-ink-900 placeholder:text-ink-700/40 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <input
              type="date"
              value={singleExpiresAt}
              onChange={(e) => setSingleExpiresAt(e.target.value)}
              title="Optional expiry date"
              className="bg-surface-0 text-ink-700 border border-surface-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 shrink-0"
            />
            <label className="flex items-center gap-1.5 text-xs text-ink-700/60 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={sendWelcomeEmail}
                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-surface-200"
              />
              Welcome email
            </label>
            <Button
              type="submit"
              size="sm"
              disabled={isAdding}
              className="shrink-0"
            >
              <UserPlus size={16} />
              {isAdding ? "Adding..." : "Add"}
            </Button>
          </form>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setBulkOpen(!bulkOpen)}
            className="shrink-0"
          >
            <Upload size={16} />
            Bulk add
          </Button>
        </div>
      </div>

      {/* Bulk add panel */}
      {bulkOpen && (
        <form
          onSubmit={handleBulkSubmit}
          className="p-6 border-b border-surface-200 bg-surface-50 space-y-3"
        >
          <label className="block text-sm font-medium text-ink-700">
            Paste emails — separated by commas or one per line
          </label>
          <div className="flex items-center gap-3">
            <label
              className={cn(
                "text-sm text-primary-600 hover:underline cursor-pointer flex items-center gap-1.5",
                isParsingCsv && "opacity-50 pointer-events-none",
              )}
            >
              {isParsingCsv && <Loader2 size={14} className="animate-spin" />}
              {isParsingCsv ? "Reading file..." : "Or upload a CSV file"}
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCsvUpload(file);
                  e.target.value = ""; // allow re-uploading the same file
                }}
              />
            </label>
          </div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            placeholder={
              "alice@example.com\nbob@example.com\ncarol@example.com"
            }
            className="w-full bg-surface-0 text-ink-900 placeholder:text-ink-700/40 border border-surface-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-600 resize-y"
          />
          {invalidEmails.length > 0 && (
            <div className="text-xs text-danger-600 bg-danger-50 border border-danger-200 rounded-lg px-3 py-2">
              These don&apos;t look like valid emails — fix or remove them:
              <div className="mt-1 font-mono">{invalidEmails.join(", ")}</div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Expiry date for all (optional)
              </label>
              <input
                type="date"
                value={bulkExpiresAt}
                onChange={(e) => setBulkExpiresAt(e.target.value)}
                className="bg-surface-0 text-ink-700 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs text-ink-700/60 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={bulkSendWelcomeEmail}
                onChange={(e) => setBulkSendWelcomeEmail(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-surface-200"
              />
              Welcome email
            </label>

            <Button type="submit" size="sm" disabled={isBulkAdding}>
              {isBulkAdding ? "Adding..." : "Add all"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setBulkOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Status filter */}
      <div className="px-6 py-3 border-b border-surface-200 flex items-center gap-1 bg-surface-100/50 w-fit rounded-lg m-4">
        {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === s
                ? "bg-surface-0 text-ink-900 shadow-sm"
                : "text-ink-700/60 hover:text-ink-900"
            }`}
          >
            {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Inactive"}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="px-6 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary-700">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer"
            >
              Clear
            </button>
          </div>
          <select
            value=""
            onChange={(e) => {
              const action = e.target.value;
              if (action === "active") setBulkReactivateOpen(true);
              if (action === "inactive") setBulkRemoveOpen(true);
              if (action === "expiry") setBulkExpiryOpen(true);
              if (action === "delete") setBulkHardDeleteOpen(true);
              e.target.value = "";
            }}
            className="bg-surface-0 border border-surface-200 rounded-lg px-3 py-1.5 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
          >
            <option value="" disabled>
              Bulk action...
            </option>
            <option value="active">Mark active</option>
            <option value="inactive">Mark inactive</option>
            <option value="expiry">Set expiration date</option>
            <option value="delete">Delete permanently</option>
          </select>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={members}
        getRowId={(m) => m.id}
        isLoading={isLoading}
        emptyMessage="No members found"
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Single mark-inactive confirmation */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && cancelRemove()}
        title={`Mark ${removeTarget} as inactive?`}
        description="They will immediately lose access to future sessions in this group. You can reactivate them later by editing their expiry date."
        confirmLabel="Mark inactive"
        onConfirm={executeRemove}
        isConfirming={isRemoving}
      />

      {/* Bulk mark-inactive confirmation */}
      <ConfirmDialog
        open={bulkRemoveOpen}
        onOpenChange={setBulkRemoveOpen}
        title={`Mark ${selectedIds.size} member(s) as inactive?`}
        description="They will immediately lose access to future sessions in this group."
        confirmLabel="Mark inactive"
        onConfirm={executeBulkRemove}
        isConfirming={isBulkRemoving}
      />

      {/* Permanent delete confirmation */}
      <ConfirmDialog
        open={!!hardDeleteTarget}
        onOpenChange={(open) => !open && cancelHardDelete()}
        title={`Permanently delete ${hardDeleteTarget}?`}
        description="This removes them from the group entirely — this can't be undone, and they won't appear in this list anymore."
        confirmLabel="Delete permanently"
        onConfirm={executeHardDelete}
        isConfirming={isHardDeleting}
      />

      <ConfirmDialog
        open={bulkReactivateOpen}
        onOpenChange={setBulkReactivateOpen}
        title={`Mark ${selectedIds.size} member(s) as active?`}
        description="Their expiry date will be cleared — they'll have indefinite access until you set a new date."
        confirmLabel="Mark active"
        destructive={false}
        onConfirm={executeBulkReactivate}
        isConfirming={isBulkReactivating}
      />

      <ConfirmDialog
        open={bulkHardDeleteOpen}
        onOpenChange={setBulkHardDeleteOpen}
        title={`Permanently delete ${selectedIds.size} member(s)?`}
        description="This can't be undone — they'll be removed from this group entirely."
        confirmLabel="Delete permanently"
        onConfirm={executeBulkHardDelete}
        isConfirming={isBulkHardDeleting}
      />

      <AlertDialog open={bulkExpiryOpen} onOpenChange={setBulkExpiryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ink-900">
              Set expiration for {selectedIds.size} member(s)
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink-700/60">
              Leave empty to clear their expiry entirely (indefinite access). A
              past date will mark them inactive immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="date"
            value={bulkExpiryValue}
            onChange={(e) => setBulkExpiryValue(e.target.value)}
            className="bg-surface-0 text-ink-700 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkSettingExpiry}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkSetExpiry}
              disabled={isBulkSettingExpiry}
              className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-600"
            >
              {isBulkSettingExpiry && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {isBulkSettingExpiry ? "Please wait..." : "Set expiration"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
