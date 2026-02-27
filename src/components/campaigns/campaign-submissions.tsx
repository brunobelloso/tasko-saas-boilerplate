"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Field {
  id: string;
  name: string;
  type: string;
}

interface Submission {
  id: string;
  createdAt: Date;
  values: {
    id: string;
    fieldId: string;
    value: string;
  }[];
}

interface CampaignSubmissionsProps {
  fields: Field[];
  submissions: Submission[];
  lastViewedAt: Date | null;
}

export function CampaignSubmissions({ fields, submissions, lastViewedAt }: CampaignSubmissionsProps) {
  if (submissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No submissions yet.
      </p>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Submitted</TableHead>
            {fields.map((field) => (
              <TableHead key={field.id}>{field.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission, index) => {
            const isNew = lastViewedAt
              ? new Date(submission.createdAt) > new Date(lastViewedAt)
              : true;
            return (
            <TableRow key={submission.id}>
              <TableCell className="font-medium">
                <span className="flex items-center gap-1.5">
                  {submissions.length - index}
                  {isNew && (
                    <Badge className="h-4 px-1 text-[9px] font-bold">New</Badge>
                  )}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {format(new Date(submission.createdAt), "MMM d, yyyy HH:mm")}
              </TableCell>
              {fields.map((field) => {
                const val = submission.values.find((v) => v.fieldId === field.id);
                return (
                  <TableCell key={field.id}>
                    {val?.value || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                );
              })}
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
