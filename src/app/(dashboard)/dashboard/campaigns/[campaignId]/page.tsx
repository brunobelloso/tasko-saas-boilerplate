import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/rbac";
import { getCampaign, getCampaignSubmissions, markCampaignViewed } from "@/lib/campaign-actions";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";
import { CampaignFieldForm } from "@/components/campaigns/campaign-field-form";
import { CampaignFieldList } from "@/components/campaigns/campaign-field-list";
import { CampaignSubmissions } from "@/components/campaigns/campaign-submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Campaign",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const user = await requireAuth();
  const { campaignId } = await params;

  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    notFound();
  }

  const canModify =
    campaign.authorId === user.id ||
    ["OWNER", "ADMIN"].includes(user.activeOrgRole || "");

  const canAddFields = ["OWNER", "ADMIN", "MEMBER"].includes(
    user.activeOrgRole || ""
  );

  const submissions = await getCampaignSubmissions(campaignId);

  // Mark campaign as viewed (saves the current timestamp for "new" badge logic)
  await markCampaignViewed(campaignId);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Link>
      </Button>

      <CampaignDetail
        campaign={campaign}
        currentUserId={user.id}
        currentUserRole={user.activeOrgRole || "VIEWER"}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Fields ({campaign.fields.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canAddFields && (
            <CampaignFieldForm campaignId={campaignId} />
          )}
          <CampaignFieldList
            fields={campaign.fields}
            campaignId={campaignId}
            canModify={canModify}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Submissions ({campaign.submissionCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignSubmissions
            fields={campaign.fields}
            submissions={submissions}
            lastViewedAt={campaign.lastViewedAt}
          />
        </CardContent>
      </Card>
    </div>
  );
}
