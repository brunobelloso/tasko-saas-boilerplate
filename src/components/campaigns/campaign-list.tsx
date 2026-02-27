import { CampaignCard } from "@/components/campaigns/campaign-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FileSpreadsheet } from "lucide-react";

interface CampaignListProps {
  campaigns: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date;
    fieldCount: number;
    submissionCount: number;
    newSubmissionCount: number;
  }[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={FileSpreadsheet}
        title="No Campaigns Yet"
        description="Create your first campaign to start collecting responses."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
