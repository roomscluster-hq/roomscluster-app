"use client";

import Link from "next/link";
import { Layers, Plus, Trash2, Upload, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Group } from "@/lib/api/groups.api";
import { useGroupManagement } from "@/hooks/useGroupManagement";

type GroupManagement = ReturnType<typeof useGroupManagement>;

export function GroupsPanel(props: GroupManagement) {
  const {
    groups,
    page,
    setPage,
    totalPages,
    isLoading,
    creatingGroup,
    setCreatingGroup,
    newGroupName,
    setNewGroupName,
    handleCreateGroup,
    isCreating,
    bulkCreateOpen,
    setBulkCreateOpen,
    bulkCreateText,
    setBulkCreateText,
    handleBulkCreateSubmit,
    isBulkCreating,
    selectedIds,
    setSelectedIds,
    deleteTarget,
    confirmDeleteGroup,
    cancelDelete,
    executeDelete,
    isDeleting,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    executeBulkDelete,
    isBulkDeleting,
    handleCsvUpload,
    renamingId,
    renameValue,
    setRenameValue,
    startRename,
    submitRename,
    cancelRename,
    isRenaming,
  } = props;

  const columns: DataTableColumn<Group>[] = [
    {
      key: "name",
      header: "Name",
      render: (g) =>
        renamingId === g.id ? (
          <form onSubmit={submitRename} className="flex items-center gap-1.5">
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={submitRename}
              disabled={isRenaming}
              className="flex-1 bg-surface-0 border border-surface-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <button
              type="button"
              onClick={cancelRename}
              disabled={isRenaming}
              className="text-ink-700/50 hover:text-ink-700 cursor-pointer text-xs"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 group">
            <Link
              href={`/dashboard/settings/organization/groups/${g.id}`}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <Layers size={16} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-ink-900 truncate group-hover:underline">
                  {g.name}
                </p>
                {g.description && (
                  <p className="text-xs text-ink-700/40 truncate">
                    {g.description}
                  </p>
                )}
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                startRename(g);
              }}
              title="Rename"
              className="opacity-0 group-hover:opacity-100 text-ink-700/40 hover:text-primary-600 transition-opacity cursor-pointer"
            >
              <Pencil size={14} />
            </button>
          </div>
        ),
    },
    {
      key: "members",
      header: "Members",
      render: (g) => (
        <span className="text-ink-700">{g._count?.enrollments ?? 0}</span>
      ),
    },
    {
      key: "sessions",
      header: "Sessions",
      render: (g) => (
        <span className="text-ink-700">{g._count?.sessions ?? 0}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (g) => (
        <button
          onClick={() => confirmDeleteGroup(g.id, g.name)}
          className="text-danger-600 hover:text-danger-700 transition-colors cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <Card>
      {/* Header */}
      <div className="p-6 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-semibold text-ink-900">Groups</h2>
          <p className="text-sm text-ink-700/50 mt-0.5">
            {groups.length} group{groups.length !== 1 ? "s" : ""}  sessions
            attached to a group require enrollment to join
          </p>
        </div>
        <div className="flex gap-2">
          {!creatingGroup && (
            <Button size="sm" onClick={() => setCreatingGroup(true)}>
              <Plus size={16} />
              New Group
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setBulkCreateOpen(!bulkCreateOpen)}
          >
            <Upload size={16} />
            Bulk create
          </Button>
        </div>
      </div>

      {/* Single create form */}
      {creatingGroup && (
        <form
          onSubmit={handleCreateGroup}
          className="p-6 border-b border-surface-200 bg-surface-50 flex gap-2"
        >
          <input
            autoFocus
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="e.g. French for Beginners"
            required
            className="flex-1 bg-surface-0 text-ink-900 placeholder:text-ink-700/40 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <Button type="submit" size="sm" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setCreatingGroup(false)}
          >
            Cancel
          </Button>
        </form>
      )}

      {/* Bulk create form */}
      {bulkCreateOpen && (
        <form
          onSubmit={handleBulkCreateSubmit}
          className="p-6 border-b border-surface-200 bg-surface-50 space-y-3"
        >
          <label className="block text-sm font-medium text-ink-700">
            One group name per line
          </label>
          <div className="flex items-center gap-3">
            <label className="text-sm text-primary-600 hover:underline cursor-pointer">
              Or upload a CSV file
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
            value={bulkCreateText}
            onChange={(e) => setBulkCreateText(e.target.value)}
            rows={5}
            placeholder={
              "French for Beginners\nSpanish Intermediate\nACCA Financial Reporting"
            }
            className="w-full bg-surface-0 text-ink-900 placeholder:text-ink-700/40 border border-surface-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-600 resize-y"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isBulkCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setBulkCreateOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Bulk action bar */}
      <BulkActionBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setBulkDeleteOpen(true)}
        deleteLabel="Delete groups"
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={groups}
        getRowId={(g) => g.id}
        isLoading={isLoading}
        emptyMessage="No groups yet. Create one to start enrolling members."
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Single delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && cancelDelete()}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Sessions attached to this group will be kept but unlinked. This can't be undone."
        confirmLabel="Delete group"
        onConfirm={executeDelete}
        isConfirming={isDeleting}
      />

      {/* Bulk delete confirmation */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selectedIds.size} group(s)?`}
        description="Sessions attached to these groups will be kept but unlinked. This can't be undone."
        confirmLabel="Delete groups"
        onConfirm={executeBulkDelete}
        isConfirming={isBulkDeleting}
      />
    </Card>
  );
}
