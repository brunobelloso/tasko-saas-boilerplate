export const siteConfig = {
  name: "SaaS Boilerplate",
  description:
    "A production-ready SaaS starter with authentication, multi-tenancy, and more.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/yourusername",
    github: "https://github.com/yourusername/saas-boilerplate",
  },
  nav: [
    { title: "Features", href: "/#features" },
    { title: "FAQ", href: "/#faq" },
  ],
  footerNav: {
    product: [
      { title: "Features", href: "/#features" },
      { title: "FAQ", href: "/#faq" },
    ],
    company: [
      { title: "About", href: "/about" },
      { title: "Blog", href: "/blog" },
      { title: "Contact", href: "/contact" },
    ],
    legal: [
      { title: "Privacy", href: "/privacy" },
      { title: "Terms", href: "/terms" },
    ],
  },
};
