import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create plans
  const freePlan = await prisma.plan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      name: "Free",
      slug: "free",
      description: "Get started with basic features",
      price: 0,
      features: JSON.stringify([
        "1 team member",
        "1 project",
        "Basic analytics",
        "Community support",
      ]),
      limits: JSON.stringify({
        members: 1,
        projects: 1,
      }),
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro",
      slug: "pro",
      description: "Everything you need to grow",
      price: 2900,
      stripePriceIdMonthly: "price_pro_monthly",
      stripePriceIdYearly: "price_pro_yearly",
      features: JSON.stringify([
        "Up to 10 team members",
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "Custom integrations",
      ]),
      limits: JSON.stringify({
        members: 10,
        projects: -1,
      }),
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { slug: "enterprise" },
    update: {},
    create: {
      name: "Enterprise",
      slug: "enterprise",
      description: "For large-scale organizations",
      price: 9900,
      stripePriceIdMonthly: "price_enterprise_monthly",
      stripePriceIdYearly: "price_enterprise_yearly",
      features: JSON.stringify([
        "Unlimited team members",
        "Unlimited projects",
        "Advanced analytics",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "SSO / SAML",
      ]),
      limits: JSON.stringify({
        members: -1,
        projects: -1,
      }),
    },
  });

  console.log("Seed completed:", {
    plans: [freePlan.name, proPlan.name, enterprisePlan.name],
  });

  // NOTE: Users are managed by Supabase Auth.
  // To create a super admin, register a user via the app and then run:
  //   UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"SUPER_ADMIN"}' WHERE email = 'admin@example.com';
  // Or use the Supabase admin API.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
