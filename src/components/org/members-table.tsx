"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { removeMember, updateMemberRole } from "@/lib/org-actions";
import { Trash2 } from "lucide-react";

interface Member {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  joinedAt: Date;
}

interface MembersTableProps {
  members: Member[];
  orgId: string;
  currentUserId: string;
  currentUserRole: string;
}

export function MembersTable({
  members,
  orgId,
  currentUserId,
  currentUserRole,
}: MembersTableProps) {
  const [isPending, startTransition] = useTransition();
  const isOwner = currentUserRole === "OWNER";

  const handleRoleChange = (userId: string, role: string) => {
    startTransition(async () => {
      const result = await updateMemberRole(orgId, userId, role);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  const handleRemove = (userId: string) => {
    startTransition(async () => {
      const result = await removeMember(orgId, userId);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <UserAvatar name={member.name} image={member.image} />
                <div>
                  <p className="text-sm font-medium">
                    {member.name || member.email}
                    {member.userId === currentUserId && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {isOwner && member.userId !== currentUserId ? (
                <Select
                  defaultValue={member.role}
                  onValueChange={(role) => handleRoleChange(member.userId, role)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary">{member.role}</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              {["OWNER", "ADMIN"].includes(currentUserRole) &&
                member.userId !== currentUserId &&
                member.role !== "OWNER" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(member.userId)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
