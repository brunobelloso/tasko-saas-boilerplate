import type { Metadata } from "next";
import { requireAuth } from "@/lib/rbac";
import { getOrgMembers } from "@/lib/org-actions";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MembersTable } from "@/components/org/members-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const user = await requireAuth();
  const orgId = user.activeOrgId;

  if (!orgId) {
    return (
      <EmptyState
        icon={Users}
        title="No Organization"
        description="Create or join an organization to manage members."
        action={
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        }
      />
    );
  }

  const members = await getOrgMembers(orgId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        description="Manage your organization's team members."
        action={
          <Button asChild>
            <Link href="/dashboard/organization/invite">Invite Members</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <MembersTable
            members={members}
            orgId={orgId}
            currentUserId={user.id}
            currentUserRole={user.activeOrgRole || "VIEWER"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
