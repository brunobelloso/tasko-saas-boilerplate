import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/lib/supabase/admin";
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

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

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

  const enrichedInvites = invites.map((invite) => {
    const inviter = inviterMap.get(invite.invitedById);
    return {
      ...invite,
      invitedBy: { name: inviter?.user_metadata?.name ?? null },
    };
  });

  return NextResponse.json(enrichedInvites);
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
  const { inviteId } = await request.json();

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await db.organizationInvite.delete({ where: { id: inviteId } });

  return NextResponse.json({ success: true });
}
