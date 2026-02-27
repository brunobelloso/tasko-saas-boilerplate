"use server";

import { createClient } from "@/lib/supabase/server";
import { getUsersByIds } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function createOrganization(values: { name: string }) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const validated = createOrgSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const { name } = validated.data;
  const slug = slugify(name);

  const existing = await db.organization.findUnique({ where: { slug } });
  if (existing) return { error: "An organization with this name already exists" };

  const org = await db.organization.create({
    data: {
      name,
      slug,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("activeOrgId", org.id, { path: "/" });

  revalidatePath("/dashboard");
  return { success: "Organization created", orgId: org.id };
}

export async function updateOrganization(orgId: string, values: { name: string }) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return { error: "Unauthorized" };
  }

  const validated = createOrgSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  await db.organization.update({
    where: { id: orgId },
    data: { name: validated.data.name, slug: slugify(validated.data.name) },
  });

  revalidatePath("/dashboard");
  return { success: "Organization updated" };
}

export async function deleteOrganization(orgId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org || org.ownerId !== user.id) {
    return { error: "Only the owner can delete this organization" };
  }

  await db.organization.delete({ where: { id: orgId } });

  const cookieStore = await cookies();
  cookieStore.delete("activeOrgId");

  revalidatePath("/dashboard");
  return { success: "Organization deleted" };
}

export async function getUserOrganizations() {
  const user = await getUser();
  if (!user) return [];

  const memberships = await db.organizationMember.findMany({
    where: { userId: user.id },
    include: { organization: true },
    orderBy: { joinedAt: "desc" },
  });

  return memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    role: m.role,
  }));
}

export async function getActiveOrg() {
  const user = await getUser();
  if (!user) return null;

  let activeOrgId: string | undefined;
  try {
    const cookieStore = await cookies();
    activeOrgId = cookieStore.get("activeOrgId")?.value;
  } catch {
    return null;
  }

  let membership;
  if (activeOrgId) {
    membership = await db.organizationMember.findUnique({
      where: { userId_orgId: { userId: user.id, orgId: activeOrgId } },
      include: { organization: true },
    });
  }

  if (!membership) {
    membership = await db.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
      orderBy: { joinedAt: "desc" },
    });
  }

  if (!membership) return null;

  return {
    id: membership.orgId,
    name: membership.organization.name,
    slug: membership.organization.slug,
    role: membership.role,
  };
}

export async function switchOrganization(orgId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership) return { error: "Not a member of this organization" };

  const cookieStore = await cookies();
  cookieStore.set("activeOrgId", orgId, { path: "/" });

  return { success: "Organization switched" };
}

export async function removeMember(orgId: string, userId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const callerMembership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!callerMembership || !["OWNER", "ADMIN"].includes(callerMembership.role)) {
    return { error: "Unauthorized" };
  }

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (org?.ownerId === userId) {
    return { error: "Cannot remove the organization owner" };
  }

  await db.organizationMember.delete({
    where: { userId_orgId: { userId, orgId } },
  });

  revalidatePath("/dashboard/organization/members");
  return { success: "Member removed" };
}

export async function updateMemberRole(orgId: string, userId: string, role: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const callerMembership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!callerMembership || callerMembership.role !== "OWNER") {
    return { error: "Only the owner can change roles" };
  }

  if (userId === user.id) {
    return { error: "Cannot change your own role" };
  }

  await db.organizationMember.update({
    where: { userId_orgId: { userId, orgId } },
    data: { role: role as any },
  });

  revalidatePath("/dashboard/organization/members");
  return { success: "Role updated" };
}

export async function getOrgMembers(orgId: string) {
  const user = await getUser();
  if (!user) return [];

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership) return [];

  const members = await db.organizationMember.findMany({
    where: { orgId },
    orderBy: { joinedAt: "asc" },
  });

  // Batch-resolve user info via Supabase admin
  const userIds = members.map((m) => m.userId);
  const supabaseUsers = await getUsersByIds(userIds);
  const userMap = new Map(supabaseUsers.map((u) => [u.id, u]));
  if (!userMap.has(user.id)) userMap.set(user.id, user);

  return members.map((m) => {
    const supabaseUser = userMap.get(m.userId);
    return {
      id: m.id,
      userId: m.userId,
      name: supabaseUser?.user_metadata?.name ?? null,
      email: supabaseUser?.email ?? "",
      image: null,
      role: m.role,
      joinedAt: m.joinedAt,
    };
  });
}

export async function getOrganization(orgId: string) {
  const user = await getUser();
  if (!user) return null;

  return db.organization.findUnique({
    where: { id: orgId },
    include: { _count: { select: { members: true } } },
  });
}
