// All site copy lives here. Ported from my-portfolio-v2/content/profile.ts.

export const profile = {
  name: "Ryan Joshua Charita",
  initials: "RJ",
  role: "Full stack developer",
  status: "Available for new projects",
  location: "Philippines",
  email: "ryanjoshuacharita@gmail.com",
  resume:
    "https://drive.google.com/file/d/1AW4oeUKaU3vhTbENLwuvHatcjfZgeze9/view?usp=sharing",
  socials: [
    { label: "GitHub", href: "https://github.com/ryancharita" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/rj-charita-6b4806342/" },
  ],
} as const;

export const nav = [
  { label: "Work", id: "work" },
  { label: "Capabilities", id: "capabilities" },
  { label: "Experience", id: "experience" },
] as const;

export const hero = {
  eyebrow: "Full stack developer · 7+ years",
  headline: ["I build web products", "that hold up in", "production."],
  lead: "Payroll, hiring, healthcare and school records — platforms people rely on every day, built end to end with React, Next.js, Node.js and PostgreSQL.",
  stats: [
    { label: "Experience", value: "7+ years" },
    { label: "Production", value: "5 platforms" },
    { label: "Mentored", value: "10 developers" },
  ],
};

export const intro = {
  eyebrow: "About",
  statement: "Interfaces, APIs and data pipelines —",
  accent: "one person, the whole stack.",
  body: "I started as a junior front-end developer in 2019 and have since led front-end teams, rebuilt a payroll platform for scale, cut a clinic app's load time by 35%, and shipped a resume builder solo from architecture to deployment. Today I build backend services, GraphQL APIs and Airflow pipelines for enterprise clients.",
};

export type Project = {
  name: string;
  category: string;
  description: string;
  tech: string[];
  image: string;
  href?: string;
};

export const work = {
  eyebrow: "Selected work",
  title: "Platforms in production",
  projects: [
    {
      name: "Pasajob",
      category: "Hiring platform",
      description: "Hiring through trusted referrals for Philippine employers and jobseekers.",
      tech: ["Next.js", "React"],
      image: "/projects/pasajob.webp",
      href: "https://www.pasajob.com/",
    },
    {
      name: "MyFolio",
      category: "AI resume builder",
      description: "AI-guided resume builder I built solo, from architecture to deployment.",
      tech: ["Next.js", "React"],
      image: "/projects/myfolio.webp",
      href: "https://www.myfolio.ph/",
    },
    {
      name: "School Records Portal",
      category: "Education",
      description: "Enrollment, grades and DepEd forms for Calbayog Pilot Central School.",
      tech: ["Next.js", "FastAPI", "PostgreSQL"],
      image: "/projects/school-records-portal.webp",
    },
    {
      name: "IronLink",
      category: "Mobile app",
      description: "Social workout tracker with offline logging, PRs and a community feed.",
      tech: ["React Native", "Expo", "Supabase"],
      image: "/projects/ironlink.webp",
    },
    {
      name: "Fresh Clinics",
      category: "Healthcare",
      description: "Web app and mobile API for cosmetic nurses and clinic owners.",
      tech: ["Vue.js", "Node.js", "MongoDB"],
      image: "/projects/fresh-clinics.webp",
      href: "https://app.freshclinics.com.au/",
    },
    {
      name: "Payruler",
      category: "Payroll & HRMS",
      description: "Payroll and HR platform for Philippine companies, rebuilt for scale.",
      tech: ["PHP", "Node.js"],
      image: "/projects/payruler.webp",
    },
    {
      name: "Fleet Management",
      category: "Operations",
      description: "Tracks vehicles, drivers, rentals and fuel for Cebu City taxi fleets.",
      tech: ["React", "GraphQL", "PostgreSQL"],
      image: "/projects/fleet-management.webp",
    },
  ] satisfies Project[],
};

export const stack = [
  "React", "Next.js", "TypeScript", "Node.js", "NestJS", "FastAPI", "PostgreSQL",
  "GraphQL", "Supabase", "Vue.js", "React Native", "Docker", "Snowflake", "Airflow",
];

export const capabilities = {
  eyebrow: "Capabilities",
  title: "From interface to deployment",
  groups: [
    {
      name: "Frontend",
      tagline: "Interfaces people use daily",
      skills: ["React", "Next.js", "Vue.js", "TypeScript", "Tailwind CSS", "React Native", "Three.js"],
    },
    {
      name: "Backend",
      tagline: "APIs and data that scale",
      skills: [
        "Node.js (Express, NestJS)", "FastAPI", "Java & Kotlin", "REST & GraphQL",
        "WebSockets", "PostgreSQL & MongoDB", "Prisma & Drizzle",
      ],
    },
    {
      name: "Data & Delivery",
      tagline: "Pipelines, CI and shipping",
      skills: ["Snowflake", "Apache Airflow", "Docker", "CircleCI", "Vercel", "Jest & RTL"],
    },
  ],
};

export const process = {
  eyebrow: "Process",
  title: "How a project runs",
  steps: [
    { title: "Discovery", body: "Map the users, the data and the constraints before writing code." },
    { title: "Architecture", body: "Choose the stack and schema that will still fit in two years." },
    { title: "Build", body: "Ship in small, reviewed increments you can click through every week." },
    { title: "Launch & support", body: "Deploy, monitor and keep tuning once real traffic arrives." },
  ],
};

export type TimelineEntry = { dates: string; title: string; org: string; summary?: string };

export const experience = {
  eyebrow: "Experience",
  title: "Where I've worked",
  roles: [
    {
      dates: "Dec 2025 — Now",
      title: "Software Engineer",
      org: "Eclaro Business Solutions",
      summary: "Backend services, REST and GraphQL APIs, a Java and Kotlin security API, and Airflow and Snowflake pipelines for enterprise clients.",
    },
    {
      dates: "Jul 2025 — Feb 2026",
      title: "Fullstack Web/Mobile Developer",
      org: "Digital Transformation",
      summary: "Shipped features for Pasajob and the Gjobs mini-program, and built MyFolio solo.",
    },
    {
      dates: "May 2021 — Jul 2025",
      title: "Mid-level Software Engineer",
      org: "Fresh Clinics",
      summary: "Built the web app and mobile API behind the clinic platform. Cut load time by 35%.",
    },
    {
      dates: "May 2023 — Oct 2024",
      title: "Senior Front-end Developer",
      org: "Digital Transformation",
      summary: "Led the front-end team on an international platform and mentored 10 junior developers.",
    },
    {
      dates: "May 2021 — May 2023",
      title: "Front-end Developer Lead",
      org: "Digital Transformation",
      summary: "Set up the team at a new office: onboarding, mentoring and technical workflows.",
    },
    {
      dates: "Aug 2019 — May 2021",
      title: "Junior Software Engineer",
      org: "Payruler",
      summary: "Helped build Payruler v2, a full rebuild focused on performance and scale.",
    },
  ] satisfies TimelineEntry[],
  education: { dates: "2015 — 2019", title: "BS Computer Science", org: "Northwest Samar State University" },
};

export const contact = {
  eyebrow: "Contact",
  headline: ["Have a product", "that needs building?"],
  body: "I'm taking on new projects. Send a short note about what you're building — what it is, who it's for, and when you need it.",
  services: ["Full product build", "Frontend", "Backend & APIs", "Data pipelines", "Something else"],
};
