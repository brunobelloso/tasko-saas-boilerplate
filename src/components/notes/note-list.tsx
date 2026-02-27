import { NoteCard } from "@/components/notes/note-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StickyNote } from "lucide-react";

interface NoteListProps {
  notes: {
    id: string;
    title: string;
    content: string;
    status?: string;
    createdAt: Date;
    authorName: string;
    commentCount: number;
  }[];
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        icon={StickyNote}
        title="No Notes Yet"
        description="Create your first note to get started."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
