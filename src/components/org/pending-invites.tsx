"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cancelInvite } from "@/lib/invite-actions";

interface Invite {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: { name: string | null; email: string | null };
}

interface PendingInvitesProps {
  invites: Invite[];
}

export function PendingInvites({ invites }: PendingInvitesProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = (inviteId: string) => {
    startTransition(async () => {
      const result = await cancelInvite(inviteId);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  if (invites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No pending invitations.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Invited By</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites.map((invite) => (
          <TableRow key={invite.id}>
            <TableCell className="font-medium">{invite.email}</TableCell>
            <TableCell>
              <Badge variant="secondary">{invite.role}</Badge>
            </TableCell>
            <TableCell>{invite.invitedBy.name || invite.invitedBy.email || "Unknown"}</TableCell>
            <TableCell className="text-muted-foreground">
              {format(new Date(invite.expiresAt), "MMM d, yyyy")}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCancel(invite.id)}
                disabled={isPending}
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
