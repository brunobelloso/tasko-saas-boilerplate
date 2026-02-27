import type { Metadata } from "next";
import { requireAuth } from "@/lib/rbac";
import { getOrgInvites } from "@/lib/invite-actions";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { InviteForm } from "@/components/org/invite-form";
import { PendingInvites } from "@/components/org/pending-invites";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Invite Members",
};

export default async function InvitePage() {
  const user = await requireAuth();
  const orgId = user.activeOrgId;

  if (!orgId) {
    return (
      <EmptyState
        icon={UserPlus}
        title="No Organization"
        description="Create or join an organization to invite members."
        action={
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        }
      />
    );
  }

  const invites = await getOrgInvites(orgId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invite Members"
        description="Invite new members to your organization."
      />

      <Card>
        <CardHeader>
          <CardTitle>Send Invitation</CardTitle>
          <CardDescription>
            Invite a team member by email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm orgId={orgId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Invitations that haven&apos;t been accepted yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingInvites invites={invites as any} />
        </CardContent>
      </Card>
    </div>
  );
}
