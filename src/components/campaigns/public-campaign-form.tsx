"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { submitCampaignResponse } from "@/lib/campaign-actions";
import { CheckCircle } from "lucide-react";

interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options: string | null;
  order: number;
}

interface PublicCampaignFormProps {
  campaign: {
    name: string;
    description: string | null;
    slug: string;
    fields: Field[];
  };
}

export function PublicCampaignForm({ campaign }: PublicCampaignFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  function setValue(fieldId: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const payload = campaign.fields.map((field) => ({
        fieldId: field.id,
        value: values[field.id] || "",
      }));

      const result = await submitCampaignResponse(campaign.slug, payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold">Thank you!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your response has been submitted successfully.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{campaign.name}</CardTitle>
        {campaign.description && (
          <CardDescription>{campaign.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {campaign.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label>
                {field.name}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderField(field, values[field.id] || "", (v) => setValue(field.id, v))}
            </div>
          ))}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function renderField(
  field: Field,
  value: string,
  onChange: (value: string) => void
) {
  switch (field.type) {
    case "TEXTAREA":
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          rows={4}
        />
      );
    case "NUMBER":
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );
    case "EMAIL":
      return (
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );
    case "PHONE":
      return (
        <Input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );
    case "DATE":
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );
    case "URL":
      return (
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder="https://"
        />
      );
    case "BOOLEAN":
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={value === "true"}
            onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
          />
          <span className="text-sm text-muted-foreground">
            {value === "true" ? "Yes" : "No"}
          </span>
        </div>
      );
    case "SELECT": {
      const options = field.options
        ? field.options.split(",").map((o) => o.trim()).filter(Boolean)
        : [];
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );
  }
}
