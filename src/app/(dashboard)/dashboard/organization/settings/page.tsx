import type { Metadata } from "next";
import { requireAuth } from "@/lib/rbac";
import { getOrganization } from "@/lib/org-actions";
import { PageHeader } from "@/components/shared/page-header";
import { OrgSettingsForm } from "@/components/org/org-settings-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Organization Settings",
};

export default async function OrgSettingsPage() {
  const user = await requireAuth();
  const orgId = user.activeOrgId;

  if (!orgId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Organization Settings"
          description="Create or manage your organization."
        />
        <EmptyState
          icon={Building2}
          title="No Organization"
          description="You don't have an active organization. Create one to get started."
          action={<Button asChild><Link href="/dashboard">Go to Dashboard</Link></Button>}
        />
      </div>
    );
  }

  const org = await getOrganization(orgId);
  if (!org) {
    return (
      <EmptyState
        icon={Building2}
        title="Organization Not Found"
        description="The organization could not be found."
        action={<Button asChild><Link href="/dashboard">Go to Dashboard</Link></Button>}
      />
    );
  }

  const isOwner = org.ownerId === user.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Settings"
        description="Manage your organization settings."
      />
      <OrgSettingsForm
        org={{ id: org.id, name: org.name, slug: org.slug, ownerId: org.ownerId }}
        isOwner={isOwner}
      />
    </div>
  );
}
