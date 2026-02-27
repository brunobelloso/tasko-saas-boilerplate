"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateCampaign, deleteCampaign } from "@/lib/campaign-actions";
import { CampaignStatusToggle } from "@/components/campaigns/campaign-status-toggle";
import { Pencil, Trash2, Link as LinkIcon, Copy } from "lucide-react";
import { format } from "date-fns";

const editCampaignSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
});

type EditCampaignValues = z.infer<typeof editCampaignSchema>;

interface CampaignDetailProps {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    submissionCount: number;
    newSubmissionCount: number;
  };
  currentUserId: string;
  currentUserRole: string;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  CLOSED: "outline",
};

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  CLOSED: "Closed",
};

export function CampaignDetail({
  campaign,
  currentUserId,
  currentUserRole,
}: CampaignDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canModify =
    campaign.authorId === currentUserId ||
    ["OWNER", "ADMIN"].includes(currentUserRole);

  const form = useForm<EditCampaignValues>({
    resolver: zodResolver(editCampaignSchema),
    defaultValues: { name: campaign.name, description: campaign.description || "" },
  });

  function onSubmit(values: EditCampaignValues) {
    startTransition(async () => {
      const result = await updateCampaign(campaign.id, values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setIsEditing(false);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCampaign(campaign.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.push("/dashboard/campaigns");
        router.refresh();
      }
    });
  }

  function copyPublicLink() {
    const url = `${window.location.origin}/campaigns/${campaign.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied to clipboard");
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset({ name: campaign.name, description: campaign.description || "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{campaign.name}</CardTitle>
              <Badge variant={statusVariant[campaign.status] || "secondary"}>
                {statusLabel[campaign.status] || campaign.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(campaign.createdAt), "MMM d, yyyy 'at' h:mm a")}
              {" · "}{campaign.submissionCount} submissions
              {campaign.newSubmissionCount > 0 && (
                <Badge className="ml-1 h-5 min-w-5 px-1.5 text-[10px] font-bold animate-pulse">
                  {campaign.newSubmissionCount} new
                </Badge>
              )}
            </p>
          </div>
          {canModify && (
            <div className="flex gap-2">
              <CampaignStatusToggle campaignId={campaign.id} status={campaign.status} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 h-3 w-3" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this campaign, all its fields,
                      and all submissions. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isPending}
                    >
                      {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaign.description && (
          <p className="text-sm">{campaign.description}</p>
        )}
        {campaign.status === "ACTIVE" && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
            <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <code className="text-sm flex-1 truncate">
              /campaigns/{campaign.slug}
            </code>
            <Button variant="outline" size="sm" onClick={copyPublicLink}>
              <Copy className="mr-2 h-3 w-3" />
              Copy Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
