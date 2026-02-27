"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { addCampaignField, updateCampaignField } from "@/lib/campaign-actions";

const fieldTypes = [
  { value: "TEXT", label: "Text" },
  { value: "TEXTAREA", label: "Textarea" },
  { value: "NUMBER", label: "Number" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "DATE", label: "Date" },
  { value: "BOOLEAN", label: "Yes/No" },
  { value: "SELECT", label: "Select" },
  { value: "URL", label: "URL" },
];

const fieldFormSchema = z.object({
  name: z.string().min(1, "Field name is required").max(100),
  type: z.string(),
  required: z.boolean(),
  options: z.string().optional(),
});

type FieldFormValues = z.infer<typeof fieldFormSchema>;

interface CampaignFieldFormProps {
  campaignId: string;
  field?: {
    id: string;
    name: string;
    type: string;
    required: boolean;
    options: string | null;
  };
  onDone?: () => void;
}

export function CampaignFieldForm({ campaignId, field, onDone }: CampaignFieldFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: field?.name || "",
      type: field?.type || "TEXT",
      required: field?.required || false,
      options: field?.options || "",
    },
  });

  const watchType = form.watch("type");

  function onSubmit(values: FieldFormValues) {
    startTransition(async () => {
      const result = field
        ? await updateCampaignField(field.id, values)
        : await addCampaignField(campaignId, values);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        if (!field) {
          form.reset({ name: "", type: "TEXT", required: false, options: "" });
        }
        onDone?.();
        router.refresh();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field: f }) => (
            <FormItem className="flex-1 min-w-[150px]">
              <FormLabel>Field Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Full Name" {...f} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field: f }) => (
            <FormItem className="w-[140px]">
              <FormLabel>Type</FormLabel>
              <Select onValueChange={f.onChange} defaultValue={f.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fieldTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchType === "SELECT" && (
          <FormField
            control={form.control}
            name="options"
            render={({ field: f }) => (
              <FormItem className="flex-1 min-w-[200px]">
                <FormLabel>Options (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="Option 1, Option 2, Option 3" {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="required"
          render={({ field: f }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormLabel>Required</FormLabel>
              <FormControl>
                <Switch checked={f.value} onCheckedChange={f.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Saving..." : field ? "Update" : "Add Field"}
          </Button>
          {onDone && (
            <Button type="button" size="sm" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
