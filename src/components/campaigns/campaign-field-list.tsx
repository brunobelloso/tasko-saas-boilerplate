"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { deleteCampaignField, reorderCampaignFields } from "@/lib/campaign-actions";
import { CampaignFieldForm } from "@/components/campaigns/campaign-field-form";
import { Pencil, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options: string | null;
  order: number;
}

interface CampaignFieldListProps {
  fields: Field[];
  campaignId: string;
  canModify: boolean;
}

const typeLabels: Record<string, string> = {
  TEXT: "Text",
  TEXTAREA: "Textarea",
  NUMBER: "Number",
  EMAIL: "Email",
  PHONE: "Phone",
  DATE: "Date",
  BOOLEAN: "Yes/No",
  SELECT: "Select",
  URL: "URL",
};

export function CampaignFieldList({ fields, campaignId, canModify }: CampaignFieldListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(fieldId: string) {
    startTransition(async () => {
      const result = await deleteCampaignField(fieldId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.refresh();
      }
    });
  }

  function handleMove(index: number, direction: "up" | "down") {
    const newFields = [...fields];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newFields.length) return;

    [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
    const newOrder = newFields.map((f) => f.id);

    startTransition(async () => {
      const result = await reorderCampaignFields(campaignId, newOrder);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  }

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No fields yet. Add your first field above.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id}>
          {editingId === field.id ? (
            <div className="border rounded-md p-3 bg-muted/30">
              <CampaignFieldForm
                campaignId={campaignId}
                field={field}
                onDone={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 border rounded-md p-3">
              {canModify && (
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || isPending}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === fields.length - 1 || isPending}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{field.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[field.type] || field.type}
                  </Badge>
                  {field.required && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                {field.type === "SELECT" && field.options && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Options: {field.options}
                  </p>
                )}
              </div>
              {canModify && (
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingId(field.id)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Field</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the field &quot;{field.name}&quot;. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(field.id)}
                          disabled={isPending}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
