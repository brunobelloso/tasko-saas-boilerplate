"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserByEmail, getUserById } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import { generateToken, absoluteUrl } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function sendInvite(
  orgId: string,
  values: { email: string; role: string }
) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return { error: "Unauthorized" };
  }

  const validated = inviteSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const { email, role } = validated.data;

  // Check if already a member via Supabase
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    const existingMember = await db.organizationMember.findUnique({
      where: { userId_orgId: { userId: existingUser.id, orgId } },
    });
    if (existingMember) return { error: "User is already a member" };
  }

  // Check for existing invite
  const existingInvite = await db.organizationInvite.findUnique({
    where: { email_orgId: { email, orgId } },
  });
  if (existingInvite) return { error: "Invite already sent to this email" };

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) return { error: "Organization not found" };

  const token = generateToken();

  await db.organizationInvite.create({
    data: {
      email,
      role: role as any,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      orgId,
      invitedById: user.id,
    },
  });

  const inviteUrl = absoluteUrl(`/invite/${token}`);

  // TODO: integrate email provider
  console.log("Invite link:", inviteUrl);

  revalidatePath("/dashboard/organization/invite");
  return { success: "Invitation sent" };
}

export async function acceptInvite(token: string) {
  const user = await getUser();
  if (!user) return { error: "Please sign in to accept this invite" };

  const invite = await db.organizationInvite.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite) return { error: "Invalid or expired invitation" };
  if (invite.expiresAt < new Date()) return { error: "Invitation has expired" };

  // Check if user email matches invite email
  if (invite.email !== user.email) {
    return { error: "This invitation was sent to a different email address" };
  }

  // Check if already a member
  const existing = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: invite.orgId } },
  });

  if (existing) {
    await db.organizationInvite.delete({ where: { id: invite.id } });
    return { error: "You are already a member of this organization" };
  }

  await db.organizationMember.create({
    data: {
      userId: user.id,
      orgId: invite.orgId,
      role: invite.role,
    },
  });

  await db.organizationInvite.delete({ where: { id: invite.id } });

  return { success: "You have joined the organization", orgId: invite.orgId };
}

export async function cancelInvite(inviteId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const invite = await db.organizationInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) return { error: "Invite not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: invite.orgId } },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return { error: "Unauthorized" };
  }

  await db.organizationInvite.delete({ where: { id: inviteId } });

  revalidatePath("/dashboard/organization/invite");
  return { success: "Invite cancelled" };
}

export async function getOrgInvites(orgId: string) {
  const user = await getUser();
  if (!user) return [];

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) return [];

  const invites = await db.organizationInvite.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
  });

  // Resolve inviter names from Supabase
  const inviterIds = [...new Set(invites.map((i) => i.invitedById))];
  const inviters = await Promise.all(inviterIds.map((id) => getUserById(id)));
  const inviterMap = new Map(
    inviters.filter(Boolean).map((u) => [u!.id, u!])
  );
  if (!inviterMap.has(user.id)) inviterMap.set(user.id, user);

  return invites.map((invite) => {
    const inviter = inviterMap.get(invite.invitedById);
    return {
      ...invite,
      invitedBy: {
        name: inviter?.user_metadata?.name ?? null,
        email: inviter?.email ?? null,
      },
    };
  });
}
