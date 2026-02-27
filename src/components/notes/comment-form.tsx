"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { createComment } from "@/lib/note-actions";

const commentSchema = z.object({
  content: z.string().min(1, "Comment is required"),
});

type CommentValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  noteId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export function CommentForm({ noteId, parentId, onSuccess }: CommentFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  function onSubmit(values: CommentValues) {
    startTransition(async () => {
      const result = await createComment(noteId, {
        content: values.content,
        parentId,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        form.reset();
        router.refresh();
        onSuccess?.();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={parentId ? "Write a reply..." : "Write a comment..."}
                  rows={parentId ? 2 : 3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Posting..." : parentId ? "Reply" : "Comment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
