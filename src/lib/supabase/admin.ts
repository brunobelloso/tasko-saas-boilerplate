import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function getUserById(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(id);
  if (error) return null;
  return data.user;
}

export async function getUsersByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const admin = createAdminClient();
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const { data, error } = await admin.auth.admin.getUserById(id);
        if (error || !data.user) return null;
        return data.user;
      } catch {
        return null;
      }
    })
  );
  return results.filter((u): u is NonNullable<typeof u> => u !== null);
}

export async function getUserByEmail(email: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return null;
  return data.users.find((u) => u.email === email) ?? null;
}
