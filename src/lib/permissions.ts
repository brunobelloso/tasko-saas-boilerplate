import { OrgRole } from "@prisma/client";

export type Permission =
  | "manage:org"
  | "invite:members"
  | "create:content"
  | "view:content";

const orgRolePermissions: Record<OrgRole, Permission[]> = {
  OWNER: [
    "manage:org",
    "invite:members",
    "create:content",
    "view:content",
  ],
  ADMIN: [
    "manage:org",
    "invite:members",
    "create:content",
    "view:content",
  ],
  MEMBER: ["create:content", "view:content"],
  VIEWER: ["view:content"],
};

export function hasOrgPermission(
  orgRole: OrgRole | undefined,
  permission: Permission
): boolean {
  if (!orgRole) return false;
  return orgRolePermissions[orgRole]?.includes(permission) ?? false;
}
