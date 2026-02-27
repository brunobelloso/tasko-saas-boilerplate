"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { getUserOrganizations, switchOrganization } from "@/lib/org-actions";
import { CreateOrgDialog } from "@/components/org/create-org-dialog";

interface Org {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export function OrgSwitcher() {
  const { orgId, orgName } = useCurrentOrg();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    getUserOrganizations().then(setOrgs);
  }, []);

  const handleSwitch = async (id: string) => {
    await switchOrganization(id);
    window.location.reload();
  };

  if (orgs.length === 0 && !orgName) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        asChild
      >
        <a href="/dashboard">
          <Building2 className="h-4 w-4" />
          Select Organization
        </a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{orgName || "Select Org"}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitch(org.id)}
            className={org.id === orgId ? "bg-accent" : ""}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span className="truncate">{org.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
      <CreateOrgDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </DropdownMenu>
  );
}
