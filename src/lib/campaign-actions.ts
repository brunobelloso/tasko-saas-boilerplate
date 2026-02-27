"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createCampaignSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).optional(),
});

const addFieldSchema = z.object({
  name: z.string().min(1, "Field name is required").max(100),
  type: z.enum(["TEXT", "TEXTAREA", "NUMBER", "EMAIL", "PHONE", "DATE", "BOOLEAN", "SELECT", "URL"]).default("TEXT"),
  required: z.boolean().default(false),
  options: z.string().optional(),
});

const updateFieldSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["TEXT", "TEXTAREA", "NUMBER", "EMAIL", "PHONE", "DATE", "BOOLEAN", "SELECT", "URL"]).optional(),
  required: z.boolean().optional(),
  options: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
});

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function generateSlug(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export async function createCampaign(
  orgId: string,
  values: { name: string; description?: string }
) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership || !["OWNER", "ADMIN", "MEMBER"].includes(membership.role)) {
    return { error: "Unauthorized" };
  }

  const validated = createCampaignSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const campaign = await db.campaign.create({
    data: {
      name: validated.data.name,
      description: validated.data.description || null,
      authorId: user.id,
      orgId,
      slug: generateSlug(),
    },
  });

  revalidatePath("/dashboard/campaigns");
  return { success: "Campaign created", campaignId: campaign.id };
}

export async function getCampaigns(orgId: string) {
  const user = await getUser();
  if (!user) return [];

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership) return [];

  const campaigns = await db.campaign.findMany({
    where: { orgId },
    include: {
      _count: { select: { fields: true, submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get new submission counts for each campaign
  const campaignsWithNew = await Promise.all(
    campaigns.map(async (c) => {
      let newSubmissionCount = 0;
      if (c.lastViewedAt) {
        newSubmissionCount = await db.campaignSubmission.count({
          where: { campaignId: c.id, createdAt: { gt: c.lastViewedAt } },
        });
      } else {
        newSubmissionCount = c._count.submissions;
      }
      return { ...c, newSubmissionCount };
    })
  );

  return campaignsWithNew.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    status: c.status,
    slug: c.slug,
    createdAt: c.createdAt,
    fieldCount: c._count.fields,
    submissionCount: c._count.submissions,
    newSubmissionCount: c.newSubmissionCount,
  }));
}

export async function getCampaign(campaignId: string) {
  const user = await getUser();
  if (!user) return null;

  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      fields: { orderBy: { order: "asc" } },
      _count: { select: { submissions: true } },
    },
  });

  if (!campaign) return null;

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: campaign.orgId } },
  });

  if (!membership) return null;

  let newSubmissionCount = 0;
  if (campaign.lastViewedAt) {
    newSubmissionCount = await db.campaignSubmission.count({
      where: { campaignId: campaign.id, createdAt: { gt: campaign.lastViewedAt } },
    });
  } else {
    newSubmissionCount = campaign._count.submissions;
  }

  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    status: campaign.status,
    slug: campaign.slug,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    authorId: campaign.authorId,
    orgId: campaign.orgId,
    fields: campaign.fields,
    submissionCount: campaign._count.submissions,
    newSubmissionCount,
    lastViewedAt: campaign.lastViewedAt,
  };
}

export async function updateCampaign(
  campaignId: string,
  values: { name?: string; description?: string; status?: string }
) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { error: "Campaign not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: campaign.orgId } },
  });

  if (!membership) return { error: "Unauthorized" };

  const isAuthor = campaign.authorId === user.id;
  const isAdminOrOwner = ["OWNER", "ADMIN"].includes(membership.role);
  if (!isAuthor && !isAdminOrOwner) {
    return { error: "Unauthorized" };
  }

  const validated = updateCampaignSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const data: Record<string, unknown> = {};
  if (validated.data.name !== undefined) data.name = validated.data.name;
  if (validated.data.description !== undefined) data.description = validated.data.description;
  if (validated.data.status !== undefined) data.status = validated.data.status;

  await db.campaign.update({
    where: { id: campaignId },
    data,
  });

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  revalidatePath("/dashboard/campaigns");
  return { success: "Campaign updated" };
}

export async function deleteCampaign(campaignId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { error: "Campaign not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: campaign.orgId } },
  });

  if (!membership) return { error: "Unauthorized" };

  const isAuthor = campaign.authorId === user.id;
  const isAdminOrOwner = ["OWNER", "ADMIN"].includes(membership.role);
  if (!isAuthor && !isAdminOrOwner) {
    return { error: "Unauthorized" };
  }

  await db.campaign.delete({ where: { id: campaignId } });

  revalidatePath("/dashboard/campaigns");
  return { success: "Campaign deleted" };
}

export async function addCampaignField(
  campaignId: string,
  values: { name: string; type?: string; required?: boolean; options?: string }
) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: { _count: { select: { fields: true } } },
  });
  if (!campaign) return { error: "Campaign not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: campaign.orgId } },
  });

  if (!membership || !["OWNER", "ADMIN", "MEMBER"].includes(membership.role)) {
    return { error: "Unauthorized" };
  }

  const validated = addFieldSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  await db.campaignField.create({
    data: {
      name: validated.data.name,
      type: validated.data.type,
      required: validated.data.required,
      options: validated.data.options || null,
      order: campaign._count.fields,
      campaignId,
    },
  });

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  return { success: "Field added" };
}

export async function updateCampaignField(
  fieldId: string,
  values: { name?: string; type?: string; required?: boolean; options?: string | null; order?: number }
) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const field = await db.campaignField.findUnique({
    where: { id: fieldId },
    include: { campaign: true },
  });
  if (!field) return { error: "Field not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: field.campaign.orgId } },
  });

  if (!membership || !["OWNER", "ADMIN", "MEMBER"].includes(membership.role)) {
    return { error: "Unauthorized" };
  }

  const validated = updateFieldSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const data: Record<string, unknown> = {};
  if (validated.data.name !== undefined) data.name = validated.data.name;
  if (validated.data.type !== undefined) data.type = validated.data.type;
  if (validated.data.required !== undefined) data.required = validated.data.required;
  if (validated.data.options !== undefined) data.options = validated.data.options;
  if (validated.data.order !== undefined) data.order = validated.data.order;

  await db.campaignField.update({
    where: { id: fieldId },
    data,
  });

  revalidatePath(`/dashboard/campaigns/${field.campaignId}`);
  return { success: "Field updated" };
}

export async function deleteCampaignField(fieldId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const field = await db.campaignField.findUnique({
    where: { id: fieldId },
    include: { campaign: true },
  });
  if (!field) return { error: "Field not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: field.campaign.orgId } },
  });

  if (!membership || !["OWNER", "ADMIN", "MEMBER"].includes(membership.role)) {
    return { error: "Unauthorized" };
  }

  await db.campaignField.delete({ where: { id: fieldId } });

  revalidatePath(`/dashboard/campaigns/${field.campaignId}`);
  return { success: "Field deleted" };
}

export async function reorderCampaignFields(
  campaignId: string,
  fieldIds: string[]
) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { error: "Campaign not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: campaign.orgId } },
  });

  if (!membership || !["OWNER", "ADMIN", "MEMBER"].includes(membership.role)) {
    return { error: "Unauthorized" };
  }

  const updates = fieldIds.map((id, index) =>
    db.campaignField.update({ where: { id }, data: { order: index } })
  );

  await Promise.all(updates);

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  return { success: "Fields reordered" };
}

export async function getCampaignBySlug(slug: string) {
  const campaign = await db.campaign.findUnique({
    where: { slug },
    include: {
      fields: { orderBy: { order: "asc" } },
    },
  });

  if (!campaign || campaign.status !== "ACTIVE") return null;

  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    slug: campaign.slug,
    fields: campaign.fields,
  };
}

export async function submitCampaignResponse(
  slug: string,
  values: { fieldId: string; value: string }[]
) {
  const campaign = await db.campaign.findUnique({
    where: { slug },
    include: { fields: true },
  });

  if (!campaign || campaign.status !== "ACTIVE") {
    return { error: "Campaign not found or not active" };
  }

  // Validate required fields
  const requiredFields = campaign.fields.filter((f) => f.required);
  for (const field of requiredFields) {
    const val = values.find((v) => v.fieldId === field.id);
    if (!val || !val.value.trim()) {
      return { error: `Field "${field.name}" is required` };
    }
  }

  const submission = await db.campaignSubmission.create({
    data: {
      campaignId: campaign.id,
      values: {
        create: values
          .filter((v) => v.value.trim())
          .map((v) => ({
            fieldId: v.fieldId,
            value: v.value,
          })),
      },
    },
  });

  return { success: "Response submitted", submissionId: submission.id };
}

export async function markCampaignViewed(campaignId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { error: "Campaign not found" };

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: campaign.orgId } },
  });

  if (!membership) return { error: "Unauthorized" };

  await db.campaign.update({
    where: { id: campaignId },
    data: { lastViewedAt: new Date() },
  });

  return { success: "Campaign marked as viewed" };
}

export async function getNewSubmissionCountForOrg(orgId: string) {
  const user = await getUser();
  if (!user) return 0;

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId } },
  });

  if (!membership) return 0;

  const campaigns = await db.campaign.findMany({
    where: { orgId },
    select: { id: true, lastViewedAt: true },
  });

  let total = 0;
  for (const c of campaigns) {
    if (c.lastViewedAt) {
      total += await db.campaignSubmission.count({
        where: { campaignId: c.id, createdAt: { gt: c.lastViewedAt } },
      });
    } else {
      total += await db.campaignSubmission.count({
        where: { campaignId: c.id },
      });
    }
  }

  return total;
}

export async function getCampaignSubmissions(campaignId: string) {
  const user = await getUser();
  if (!user) return [];

  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return [];

  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: campaign.orgId } },
  });

  if (!membership) return [];

  const submissions = await db.campaignSubmission.findMany({
    where: { campaignId },
    include: {
      values: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return submissions;
}
