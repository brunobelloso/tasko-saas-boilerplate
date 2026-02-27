"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CommentForm } from "@/components/notes/comment-form";
import { deleteComment } from "@/lib/note-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MessageSquare, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  parentId: string | null;
  replies: Comment[];
}

interface CommentListProps {
  comments: Comment[];
  noteId: string;
  currentUserId: string;
  currentUserRole: string;
}

function CommentItem({
  comment,
  noteId,
  currentUserId,
  currentUserRole,
  depth,
}: {
  comment: Comment;
  noteId: string;
  currentUserId: string;
  currentUserRole: string;
  depth: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canDelete =
    comment.authorId === currentUserId ||
    ["OWNER", "ADMIN"].includes(currentUserRole);

  const canReply = ["OWNER", "ADMIN", "MEMBER"].includes(currentUserRole);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteComment(comment.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.refresh();
      }
    });
  }

  return (
    <div className={depth > 0 ? "ml-6 border-l pl-4" : ""}>
      <div className="space-y-2 py-3">
        <div className="flex items-center gap-2">
          <UserAvatar name={comment.authorName} className="h-6 w-6" />
          <span className="text-sm font-medium">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        <div className="flex items-center gap-2">
          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageSquare className="mr-1 h-3 w-3" />
              Reply
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this comment and all its
                    replies. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                    {isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        {showReplyForm && (
          <div className="mt-2">
            <CommentForm
              noteId={noteId}
              parentId={comment.id}
              onSuccess={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>
      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              noteId={noteId}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentList({
  comments,
  noteId,
  currentUserId,
  currentUserRole,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No comments yet. Be the first to comment.
      </p>
    );
  }

  return (
    <div className="divide-y">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          noteId={noteId}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          depth={0}
        />
      ))}
    </div>
  );
}
