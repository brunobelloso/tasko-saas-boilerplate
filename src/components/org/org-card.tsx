"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateOrgDialog } from "@/components/org/create-org-dialog";
import { switchOrganization } from "@/lib/org-actions";
import { Building2, Users, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrgCardProps {
  org: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    _count: { members: number; notes: number };
  };
  role: string;
  isActive: boolean;
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  OWNER: "default",
  ADMIN: "secondary",
  MEMBER: "outline",
  VIEWER: "outline",
};

export function OrgCard({ org, role, isActive }: OrgCardProps) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  async function handleClick() {
    if (isActive || switching) return;
    setSwitching(true);
    await switchOrganization(org.id);
    router.refresh();
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "cursor-pointer transition-colors hover:border-primary/50",
        role === "OWNER" && "border-primary",
        isActive && "bg-accent/50",
        switching && "opacity-60 pointer-events-none"
      )}
    >
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
        <CardTitle className="text-base truncate">{org.name}</CardTitle>
        <Badge variant={roleBadgeVariant[role] ?? "outline"} className="ml-auto shrink-0">
          {role}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {org._count.members}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {org._count.notes}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{org.slug}</p>
      </CardContent>
    </Card>
  );
}

export function CreateOrgCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="cursor-pointer border-dashed hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-[140px]"
      >
        <Plus className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground">
          Create Organization
        </p>
      </Card>
      <CreateOrgDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
