import Link from "next/link";
import {
  Shield,
  Users,
  Lock,
  LayoutDashboard,
  Plug,
  Zap,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { siteConfig } from "@/config/site";

const features = [
  {
    icon: Shield,
    title: "Authentication",
    description:
      "Email/password, OAuth providers, and magic links out of the box with NextAuth.js.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Users,
    title: "Multi-Tenancy",
    description:
      "Organizations and workspaces with team invitations and member management.",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Lock,
    title: "Role-Based Access",
    description:
      "Granular permissions with owner, admin, and member roles per organization.",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Pre-built dashboard layout with sidebar navigation, analytics, and settings pages.",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Plug,
    title: "API Ready",
    description:
      "RESTful API routes with authentication middleware, rate limiting, and validation.",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    description:
      "Built on Next.js App Router with React Server Components for optimal performance.",
    gradient: "from-yellow-500/10 to-amber-500/10",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
];

const faqs = [
  {
    question: "Can I use this for commercial projects?",
    answer:
      "Yes! This boilerplate is licensed for both personal and commercial use. Build and ship your SaaS product with confidence.",
  },
  {
    question: "What tech stack does this use?",
    answer:
      "The boilerplate is built with Next.js, TypeScript, Tailwind CSS, Prisma, and NextAuth.js. It uses PostgreSQL as the database.",
  },
  {
    question: "Is it easy to add new features?",
    answer:
      "Absolutely. The codebase follows a modular architecture with clear separation of concerns, making it straightforward to extend with your own features.",
  },
  {
    question: "Do you provide support and updates?",
    answer:
      "Yes. The boilerplate receives regular updates for dependency upgrades, security patches, and new features. Community support is available via GitHub.",
  },
];

const highlights = [
  "TypeScript first",
  "Dark mode",
  "Responsive",
  "Accessible",
  "SEO optimized",
  "Open source",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="container relative mx-auto px-4 py-28 md:py-40">
            <div className="mx-auto max-w-3xl text-center">
              <div className="animate-fade-in-up">
                <Badge
                  variant="secondary"
                  className="mb-6 gap-1.5 px-3 py-1.5 text-sm font-medium border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Production-Ready SaaS Starter
                </Badge>
              </div>
              <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl [animation-delay:100ms]">
                Ship your SaaS{" "}
                <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-600 bg-clip-text text-transparent">
                  faster
                </span>
              </h1>
              <p className="animate-fade-in-up mt-6 text-lg text-muted-foreground md:text-xl leading-relaxed [animation-delay:200ms]">
                {siteConfig.description}
              </p>

              {/* Highlight pills */}
              <div className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-2 [animation-delay:300ms]">
                {highlights.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row [animation-delay:400ms]">
                <Button size="lg" className="px-8 shadow-lg shadow-primary/25" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8" asChild>
                  <Link href="/#features">See Features</Link>
                </Button>
              </div>

              {/* Social proof */}
              <div className="animate-fade-in-up mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground [animation-delay:500ms]">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/60 to-violet-500/60"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500"
                      />
                    ))}
                  </div>
                  <span className="ml-1">Loved by 500+ developers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4">
                Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to launch
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Stop reinventing the wheel. Start with a solid foundation and
                focus on what makes your product unique.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/30"
                >
                  <CardHeader className="space-y-3">
                    <div
                      className={`inline-flex rounded-lg bg-gradient-to-br ${feature.gradient} p-2.5 w-fit`}
                    >
                      <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-b py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4">
                FAQ
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about the boilerplate.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl space-y-2">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-lg border bg-card px-6 py-4 transition-colors hover:bg-muted/50"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-left font-medium">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,hsl(var(--primary)/0.08),transparent)]" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start building your SaaS today. No credit card required.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="px-8 shadow-lg shadow-primary/25" asChild>
                  <Link href="/register">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8" asChild>
                  <Link href={siteConfig.links.github}>View on GitHub</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
