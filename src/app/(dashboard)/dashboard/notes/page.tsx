import type { Metadata } from "next";
import { requireAuth } from "@/lib/rbac";
import { getNotes } from "@/lib/note-actions";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoteList } from "@/components/notes/note-list";
import { CreateNoteDialog } from "@/components/notes/create-note-dialog";
import { NoteFilters } from "@/components/notes/note-filters";
import { Button } from "@/components/ui/button";
import { StickyNote } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notes",
};

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAuth();
  const orgId = user.activeOrgId;

  if (!orgId) {
    return (
      <EmptyState
        icon={StickyNote}
        title="No Organization"
        description="Create or join an organization to start using notes."
        action={
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        }
      />
    );
  }

  const params = await searchParams;
  const notes = await getNotes(orgId, {
    status: params.status,
  });

  const canCreate = ["OWNER", "ADMIN", "MEMBER"].includes(
    user.activeOrgRole || ""
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="Create and share notes with your team."
        action={canCreate ? <CreateNoteDialog orgId={orgId} /> : undefined}
      />
      <NoteFilters
        currentStatus={params.status}
      />
      <NoteList notes={notes} />
    </div>
  );
}
