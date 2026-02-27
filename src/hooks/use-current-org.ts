"use client";

import { useEffect, useState } from "react";
import { getUserOrganizations, getActiveOrg } from "@/lib/org-actions";

interface OrgInfo {
  orgId: string;
  orgRole: string;
  orgName: string;
}

export function useCurrentOrg() {
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getActiveOrg().then((data) => {
      if (data) {
        setOrg({
          orgId: data.id,
          orgRole: data.role,
          orgName: data.name,
        });
      }
      setIsLoading(false);
    });
  }, []);

  return {
    orgId: org?.orgId,
    orgRole: org?.orgRole,
    orgName: org?.orgName,
    isLoading,
  };
}
