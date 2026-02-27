import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/rbac";
import { getNote } from "@/lib/note-actions";
import { NoteDetail } from "@/components/notes/note-detail";
import { CommentForm } from "@/components/notes/comment-form";
import { CommentList } from "@/components/notes/comment-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Note",
};

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const user = await requireAuth();
  const { noteId } = await params;

  const note = await getNote(noteId);
  if (!note) {
    notFound();
  }

  const canComment = ["OWNER", "ADMIN", "MEMBER"].includes(
    user.activeOrgRole || ""
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/notes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notes
        </Link>
      </Button>

      <NoteDetail
        note={note}
        currentUserId={user.id}
        currentUserRole={user.activeOrgRole || "VIEWER"}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Comments ({note.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canComment && <CommentForm noteId={noteId} />}
          <CommentList
            comments={note.comments}
            noteId={noteId}
            currentUserId={user.id}
            currentUserRole={user.activeOrgRole || "VIEWER"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
