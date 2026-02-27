import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    status?: string;
    createdAt: Date;
    authorName: string;
    commentCount: number;
  };
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link href={`/dashboard/notes/${note.id}`}>
      <Card className="hover:bg-muted/50 transition-colors h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base line-clamp-1">
              {note.title}
            </CardTitle>
            {note.status && (
              <Badge
                variant={note.status === "OPEN" ? "default" : "secondary"}
                className="shrink-0"
              >
                {note.status === "OPEN" ? "Open" : "Closed"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {note.content}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {note.authorName} &middot;{" "}
              {format(new Date(note.createdAt), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {note.commentCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
