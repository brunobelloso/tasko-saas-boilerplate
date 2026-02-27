import type { Metadata } from "next";
import { requireAuth } from "@/lib/rbac";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { OrgCard, CreateOrgCard } from "@/components/org/org-card";

export const metadata: Metadata = {
  title: "Dashboard",
};

const ROLE_ORDER: Record<string, number> = {
  OWNER: 0,
  ADMIN: 1,
  MEMBER: 2,
  VIEWER: 3,
};

export default async function DashboardPage() {
  const user = await requireAuth();

  const memberships = await db.organizationMember.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        include: { _count: { select: { members: true, notes: true } } },
      },
    },
  });

  memberships.sort(
    (a, b) => (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.name || "there"}!`}
        description="Here's an overview of your account."
      />

      {/* Organizations section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Your Organizations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((m) => (
            <OrgCard
              key={m.organization.id}
              org={m.organization}
              role={m.role}
              isActive={m.orgId === user.activeOrgId}
            />
          ))}
          <CreateOrgCard />
        </div>
      </div>
    </div>
  );
}
