import { createClient } from "@/lib/supabase/server";
import { hasOrgPermission, type Permission } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export interface AppUser {
  id: string;
  email: string;
  name?: string;
}

export async function requireAuth(): Promise<AppUser & { activeOrgId?: string; activeOrgRole?: string; activeOrgName?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const appUser: AppUser = {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name,
  };

  // Fetch active org info (cookie-based switching)
  let activeOrgId: string | undefined;
  try {
    const cookieStore = await cookies();
    activeOrgId = cookieStore.get("activeOrgId")?.value;
  } catch {
    // cookies() may fail in certain contexts
  }

  let membership;
  if (activeOrgId) {
    membership = await db.organizationMember.findUnique({
      where: { userId_orgId: { userId: user.id, orgId: activeOrgId } },
      include: { organization: true },
    });
  }

  // Fallback to most recent membership
  if (!membership) {
    membership = await db.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
      orderBy: { joinedAt: "desc" },
    });
  }

  return {
    ...appUser,
    activeOrgId: membership?.orgId,
    activeOrgRole: membership?.role,
    activeOrgName: membership?.organization.name,
  };
}

export async function requireOrgPermission(permission: Permission) {
  const user = await requireAuth();
  if (!hasOrgPermission(user.activeOrgRole as any, permission)) {
    redirect("/dashboard");
  }
  return user;
}
