import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsersByIds } from "@/lib/supabase/admin";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = await params;

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const members = await db.organizationMember.findMany({
    where: { orgId },
    orderBy: { joinedAt: "asc" },
  });

  // Resolve user info from Supabase
  const userIds = members.map((m) => m.userId);
  const supabaseUsers = await getUsersByIds(userIds);
  const userMap = new Map(supabaseUsers.map((u) => [u.id, u]));

  const enrichedMembers = members.map((m) => {
    const supabaseUser = userMap.get(m.userId);
    return {
      ...m,
      user: {
        id: m.userId,
        name: supabaseUser?.user_metadata?.name ?? null,
        email: supabaseUser?.email ?? "",
        image: null,
      },
    };
  });

  return NextResponse.json(enrichedMembers);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = await params;
  const { userId, role } = await request.json();

  const callerMembership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!callerMembership || callerMembership.role !== "OWNER") {
    return NextResponse.json({ error: "Only the owner can change roles" }, { status: 403 });
  }

  const updated = await db.organizationMember.update({
    where: { userId_orgId: { userId, orgId } },
    data: { role },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = await params;
  const { userId } = await request.json();

  const callerMembership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!callerMembership || !["OWNER", "ADMIN"].includes(callerMembership.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (org?.ownerId === userId) {
    return NextResponse.json({ error: "Cannot remove the owner" }, { status: 400 });
  }

  await db.organizationMember.delete({
    where: { userId_orgId: { userId, orgId } },
  });

  return NextResponse.json({ success: true });
}
