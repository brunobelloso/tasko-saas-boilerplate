"use server";

import { createClient } from "@/lib/supabase/server";
import { getUsersByIds } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
});

const updateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
});

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment is required"),
  parentId: z.string().optional(),
});

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function createNote(
  orgId: string,
  values: { title: string; content: string }
) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership || !["OWNER", "ADMIN", "MEMBER"].includes(membership.role)) {
    return { error: "Unauthorized" };
  }

  const validated = createNoteSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const note = await db.note.create({
    data: {
      title: validated.data.title,
      content: validated.data.content,
      authorId: user.id,
      orgId,
    },
  });

  revalidatePath("/dashboard/notes");
  return { success: "Note created", noteId: note.id };
}

export async function updateNote(
  noteId: string,
  values: { title: string; content: string }
) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const note = await db.note.findUnique({ where: { id: noteId } });
  if (!note) return { error: "Note not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: note.orgId } },
  });

  if (!membership) return { error: "Unauthorized" };

  const isAuthor = note.authorId === user.id;
  const isAdminOrOwner = ["OWNER", "ADMIN"].includes(membership.role);
  if (!isAuthor && !isAdminOrOwner) {
    return { error: "Unauthorized" };
  }

  const validated = updateNoteSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  await db.note.update({
    where: { id: noteId },
    data: {
      title: validated.data.title,
      content: validated.data.content,
    },
  });

  revalidatePath(`/dashboard/notes/${noteId}`);
  revalidatePath("/dashboard/notes");
  return { success: "Note updated" };
}

export async function deleteNote(noteId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const note = await db.note.findUnique({ where: { id: noteId } });
  if (!note) return { error: "Note not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: note.orgId } },
  });

  if (!membership) return { error: "Unauthorized" };

  const isAuthor = note.authorId === user.id;
  const isAdminOrOwner = ["OWNER", "ADMIN"].includes(membership.role);
  if (!isAuthor && !isAdminOrOwner) {
    return { error: "Unauthorized" };
  }

  await db.note.delete({ where: { id: noteId } });

  revalidatePath("/dashboard/notes");
  return { success: "Note deleted" };
}

export async function getNotes(
  orgId: string,
  filters?: { status?: string }
) {
  const user = await getUser();
  if (!user) return [];

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership) return [];

  const where: Record<string, unknown> = { orgId };
  if (filters?.status === "OPEN" || filters?.status === "CLOSED")
    where.status = filters.status;

  const notes = await db.note.findMany({
    where,
    include: {
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const authorIds = [...new Set(notes.map((n) => n.authorId))];
  const supabaseUsers = await getUsersByIds(authorIds);
  const userMap = new Map(supabaseUsers.map((u) => [u.id, u]));
  if (!userMap.has(user.id)) userMap.set(user.id, user);

  return notes.map((note) => {
    const author = userMap.get(note.authorId);
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      status: note.status,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      authorId: note.authorId,
      authorName: author?.user_metadata?.name ?? author?.email ?? "Unknown",
      commentCount: note._count.comments,
    };
  });
}

export async function getNote(noteId: string) {
  const user = await getUser();
  if (!user) return null;

  const note = await db.note.findUnique({
    where: { id: noteId },
    include: {
      comments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!note) return null;

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: note.orgId } },
  });

  if (!membership) return null;

  // Collect all unique author IDs from note + comments
  const authorIds = [
    ...new Set([note.authorId, ...note.comments.map((c) => c.authorId)]),
  ];
  const supabaseUsers = await getUsersByIds(authorIds);
  const userMap = new Map(supabaseUsers.map((u) => [u.id, u]));
  if (!userMap.has(user.id)) userMap.set(user.id, user);

  // Build nested comment tree
  const commentMap = new Map<string, any>();
  const rootComments: any[] = [];

  for (const comment of note.comments) {
    const author = userMap.get(comment.authorId);
    const enriched = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      authorId: comment.authorId,
      authorName: author?.user_metadata?.name ?? author?.email ?? "Unknown",
      parentId: comment.parentId,
      replies: [] as any[],
    };
    commentMap.set(comment.id, enriched);
  }

  for (const comment of commentMap.values()) {
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId).replies.push(comment);
    } else {
      rootComments.push(comment);
    }
  }

  const noteAuthor = userMap.get(note.authorId);

  return {
    id: note.id,
    title: note.title,
    content: note.content,
    status: note.status,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    authorId: note.authorId,
    authorName:
      noteAuthor?.user_metadata?.name ?? noteAuthor?.email ?? "Unknown",
    orgId: note.orgId,
    comments: rootComments,
  };
}

export async function toggleNoteStatus(noteId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const note = await db.note.findUnique({ where: { id: noteId } });
  if (!note) return { error: "Note not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: note.orgId } },
  });

  if (!membership) return { error: "Unauthorized" };

  const isAuthor = note.authorId === user.id;
  const isAdminOrOwner = ["OWNER", "ADMIN"].includes(membership.role);
  if (!isAuthor && !isAdminOrOwner) {
    return { error: "Unauthorized" };
  }

  const newStatus = note.status === "OPEN" ? "CLOSED" : "OPEN";

  await db.note.update({
    where: { id: noteId },
    data: { status: newStatus },
  });

  revalidatePath(`/dashboard/notes/${noteId}`);
  revalidatePath("/dashboard/notes");
  return { success: `Note ${newStatus.toLowerCase()}` };
}

export async function createComment(
  noteId: string,
  values: { content: string; parentId?: string }
) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const note = await db.note.findUnique({ where: { id: noteId } });
  if (!note) return { error: "Note not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: note.orgId } },
  });

  if (!membership || !["OWNER", "ADMIN", "MEMBER"].includes(membership.role)) {
    return { error: "Unauthorized" };
  }

  const validated = createCommentSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  await db.noteComment.create({
    data: {
      content: validated.data.content,
      authorId: user.id,
      noteId,
      parentId: validated.data.parentId,
    },
  });

  revalidatePath(`/dashboard/notes/${noteId}`);
  return { success: "Comment added" };
}

export async function deleteComment(commentId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const comment = await db.noteComment.findUnique({
    where: { id: commentId },
    include: { note: true },
  });

  if (!comment) return { error: "Comment not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: comment.note.orgId } },
  });

  if (!membership) return { error: "Unauthorized" };

  const isAuthor = comment.authorId === user.id;
  const isAdminOrOwner = ["OWNER", "ADMIN"].includes(membership.role);
  if (!isAuthor && !isAdminOrOwner) {
    return { error: "Unauthorized" };
  }

  await db.noteComment.delete({ where: { id: commentId } });

  revalidatePath(`/dashboard/notes/${comment.noteId}`);
  return { success: "Comment deleted" };
}
