import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCampaignBySlug } from "@/lib/campaign-actions";
import { PublicCampaignForm } from "@/components/campaigns/public-campaign-form";

export const metadata: Metadata = {
  title: "Campaign Form",
};

export default async function PublicCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <PublicCampaignForm campaign={campaign} />
    </div>
  );
}
