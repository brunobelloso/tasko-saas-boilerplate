"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateCampaign } from "@/lib/campaign-actions";
import { Play, Pause, RotateCcw } from "lucide-react";

interface CampaignStatusToggleProps {
  campaignId: string;
  status: string;
}

export function CampaignStatusToggle({ campaignId, status }: CampaignStatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      const result = await updateCampaign(campaignId, { status: newStatus });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.refresh();
      }
    });
  }

  if (status === "DRAFT") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStatusChange("ACTIVE")}
        disabled={isPending}
      >
        <Play className="mr-2 h-3 w-3" />
        Activate
      </Button>
    );
  }

  if (status === "ACTIVE") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStatusChange("CLOSED")}
        disabled={isPending}
      >
        <Pause className="mr-2 h-3 w-3" />
        Close
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleStatusChange("ACTIVE")}
      disabled={isPending}
    >
      <RotateCcw className="mr-2 h-3 w-3" />
      Reactivate
    </Button>
  );
}
