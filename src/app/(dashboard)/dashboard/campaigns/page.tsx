import type { Metadata } from "next";
import { requireAuth } from "@/lib/rbac";
import { getCampaigns } from "@/lib/campaign-actions";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CampaignList } from "@/components/campaigns/campaign-list";
import { CreateCampaignDialog } from "@/components/campaigns/create-campaign-dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Campaigns",
};

export default async function CampaignsPage() {
  const user = await requireAuth();
  const orgId = user.activeOrgId;

  if (!orgId) {
    return (
      <EmptyState
        icon={FileSpreadsheet}
        title="No Organization"
        description="Create or join an organization to start using campaigns."
        action={
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        }
      />
    );
  }

  const campaigns = await getCampaigns(orgId);

  const canCreate = ["OWNER", "ADMIN", "MEMBER"].includes(
    user.activeOrgRole || ""
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create dynamic forms and collect responses."
        action={canCreate ? <CreateCampaignDialog orgId={orgId} /> : undefined}
      />
      <CampaignList campaigns={campaigns} />
    </div>
  );
}
