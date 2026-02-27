"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateNote, deleteNote, toggleNoteStatus } from "@/lib/note-actions";
import { Pencil, Trash2, CheckCircle, CircleDot } from "lucide-react";
import { format } from "date-fns";

const editNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
});

type EditNoteValues = z.infer<typeof editNoteSchema>;

interface NoteDetailProps {
  note: {
    id: string;
    title: string;
    content: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    authorName: string;
  };
  currentUserId: string;
  currentUserRole: string;
}

export function NoteDetail({
  note,
  currentUserId,
  currentUserRole,
}: NoteDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canModify =
    note.authorId === currentUserId ||
    ["OWNER", "ADMIN"].includes(currentUserRole);

  const form = useForm<EditNoteValues>({
    resolver: zodResolver(editNoteSchema),
    defaultValues: { title: note.title, content: note.content },
  });

  function onSubmit(values: EditNoteValues) {
    startTransition(async () => {
      const result = await updateNote(note.id, values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setIsEditing(false);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteNote(note.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.push("/dashboard/notes");
        router.refresh();
      }
    });
  }

  function handleToggleStatus() {
    startTransition(async () => {
      const result = await toggleNoteStatus(note.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.refresh();
      }
    });
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Note</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea rows={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset({ title: note.title, content: note.content });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{note.title}</CardTitle>
              <Badge
                variant={note.status === "OPEN" ? "default" : "secondary"}
              >
                {note.status === "OPEN" ? "Open" : "Closed"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {note.authorName} &middot;{" "}
              {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          {canModify && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                disabled={isPending}
              >
                {note.status === "OPEN" ? (
                  <>
                    <CheckCircle className="mr-2 h-3 w-3" />
                    Close
                  </>
                ) : (
                  <>
                    <CircleDot className="mr-2 h-3 w-3" />
                    Reopen
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 h-3 w-3" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Note</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this note and all its
                      comments. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isPending}
                    >
                      {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap">{note.content}</div>
      </CardContent>
    </Card>
  );
}
