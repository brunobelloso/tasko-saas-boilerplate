"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { user, supabase };
}

export async function updateProfile(values: { name: string; email: string }) {
  const { user, supabase } = await getUser();
  if (!user) return { error: "Unauthorized" };

  const validated = profileSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const { name, email } = validated.data;

  // Update name in user_metadata
  const { error: nameError } = await supabase.auth.updateUser({
    data: { name },
  });

  if (nameError) return { error: nameError.message };

  // Update email if changed
  if (email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email });
    if (emailError) return { error: emailError.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: "Profile updated" };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function changePassword(values: {
  currentPassword: string;
  newPassword: string;
}) {
  const { user, supabase } = await getUser();
  if (!user) return { error: "Unauthorized" };

  const validated = passwordSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  // Verify current password by attempting a sign-in
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: validated.data.currentPassword,
  });

  if (verifyError) return { error: "Current password is incorrect" };

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: validated.data.newPassword,
  });

  if (updateError) return { error: updateError.message };

  return { success: "Password changed successfully" };
}

export async function deleteAccount() {
  const { user } = await getUser();
  if (!user) return { error: "Unauthorized" };

  // Check if user owns any organizations
  const ownedOrgs = await db.organization.findMany({
    where: { ownerId: user.id },
  });

  if (ownedOrgs.length > 0) {
    return {
      error:
        "You must transfer or delete your organizations before deleting your account.",
    };
  }

  // Remove user memberships from Prisma
  await db.organizationMember.deleteMany({
    where: { userId: user.id },
  });

  // Delete user from Supabase via admin
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) return { error: error.message };

  return { success: "Account deleted" };
}
