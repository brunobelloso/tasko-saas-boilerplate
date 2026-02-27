import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Send } from "lucide-react";
import { format } from "date-fns";

interface CampaignCardProps {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date;
    fieldCount: number;
    submissionCount: number;
    newSubmissionCount: number;
  };
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  CLOSED: "outline",
};

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  CLOSED: "Closed",
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link href={`/dashboard/campaigns/${campaign.id}`}>
      <Card className="hover:bg-muted/50 transition-colors h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base line-clamp-1">
              {campaign.name}
            </CardTitle>
            <Badge
              variant={statusVariant[campaign.status] || "secondary"}
              className="shrink-0"
            >
              {statusLabel[campaign.status] || campaign.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaign.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              {campaign.fieldCount} fields
            </span>
            <span className="flex items-center gap-1">
              <Send className="h-3 w-3" />
              {campaign.submissionCount} responses
              {campaign.newSubmissionCount > 0 && (
                <Badge className="ml-1 h-5 min-w-5 px-1.5 text-[10px] font-bold animate-pulse">
                  {campaign.newSubmissionCount}
                </Badge>
              )}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(campaign.createdAt), "MMM d, yyyy")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
