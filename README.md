This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Setup

Set `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` using the project URL and public key from Supabase. These public client credentials are not service-role secrets. Restart the dev server after changing them.

Apply the SQL migration in `supabase/migrations` to create the row-protected `profiles` table and the auth-user profile trigger.

For production, configure auth rate limits in Supabase Auth settings. Never expose a Supabase service-role or secret key.

Supabase Auth performs server-side email and password validation. The profile migration applies a database length constraint and own-row RLS policies. This repository defines only `profiles`; review every other table in the live database and enable RLS with table-specific policies. `@supabase/ssr` manages auth cookies, but XSS prevention is still required because script execution in an authenticated page can perform actions as that user.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Netlify

Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the Netlify dashboard environment variables before deploying. The existing client also supports `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a legacy alternative. Store actual values in the dashboard, not in tracked files; use `.env.local` only for local development. Only the placeholder `.env.example` is tracked.

Next.js embeds `NEXT_PUBLIC_` values into browser bundles at build time, even when they are configured only in the dashboard. The Supabase project URL and publishable/anon keys are intentionally public client configuration, not privileged credentials. `netlify.toml` excludes only these three variable names from Netlify's environment-value secrets scan so their expected presence in build output does not block deployment. Secrets scanning remains enabled for all other variables and files; no paths are excluded.

Never put a Supabase secret or service-role key into any `NEXT_PUBLIC_` variable or add it to the exclusions. Keep Row Level Security enabled with appropriate policies for client-accessible tables. If a genuine private credential was exposed, revoke or rotate it and remove it from tracked files and history.

If a deploy still fails, inspect the scanner's reported variable names and file paths earlier in the deploy log. The provided log excerpt does not include those findings. Confirm that the resolved `SECRETS_SCAN_OMIT_KEYS` contains the three names in `netlify.toml`, and review any context-specific configuration overrides. Do not disable scanning or exclude entire build directories to suppress unrelated findings.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
