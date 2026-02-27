import Link from "next/link";
import { Shield, Users, Zap } from "lucide-react";
import { siteConfig } from "@/config/site";

const benefits = [
  {
    icon: Shield,
    title: "Enterprise-grade security",
    description: "Built-in authentication, RBAC, and data encryption.",
  },
  {
    icon: Users,
    title: "Team collaboration",
    description: "Multi-tenancy with organizations and team management.",
  },
  {
    icon: Zap,
    title: "Ship in days, not months",
    description: "Pre-built features so you can focus on your product.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding (hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-violet-600 to-purple-700 p-12 text-white">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="text-xl font-bold">
            {siteConfig.name}
          </Link>
        </div>

        {/* Benefits */}
        <div className="relative space-y-8">
          <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
            Build your SaaS
            <br />
            with confidence
          </h2>
          <div className="space-y-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{benefit.title}</p>
                  <p className="text-sm text-white/70">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative rounded-xl bg-white/10 p-6 backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-white/90">
            &ldquo;This boilerplate saved us weeks of development time.
            Everything just works out of the box &mdash; auth, teams,
            permissions. Highly recommended.&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20" />
            <div>
              <p className="text-sm font-medium">Happy Developer</p>
              <p className="text-xs text-white/60">CTO at Startup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <Link href="/" className="font-bold text-lg">
            {siteConfig.name}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-6">
            {children}
          </div>
        </div>

        {/* Bottom text */}
        <div className="p-4 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
