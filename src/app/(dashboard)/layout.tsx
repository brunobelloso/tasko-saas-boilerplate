import { requireAuth } from "@/lib/rbac";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { getNewSubmissionCountForOrg } from "@/lib/campaign-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  const newSubmissionsCount = user.activeOrgId
    ? await getNewSubmissionCountForOrg(user.activeOrgId)
    : 0;

  return (
    <div className="flex h-screen">
      <aside className="hidden lg:block w-64 shrink-0">
        <DashboardSidebar newSubmissionsCount={newSubmissionsCount} />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
