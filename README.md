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

### Google Sign-In

Enable Google in Supabase Authentication's provider settings and configure its Google OAuth client. In Google Cloud, use the Supabase provider callback URL shown in those settings as an authorized redirect URI (not the application's `/auth/callback` URL). Configure the OAuth consent screen with your application's name and authorized domains; if the app is in testing mode, add the accounts that need to sign in as test users.

In Supabase Authentication's URL configuration, set the production Site URL to `https://my-app-auth.netlify.app` and allow `https://my-app-auth.netlify.app/auth/callback` as a redirect URL. Add the corresponding callback URL for each development or preview origin you use. The sign-in page starts authentication on its current origin, so the callback must be allowed for that same origin.

Google sign-in requests an account chooser instead of silently selecting a saved Google account. The dashboard displays the authenticated account's email so users can confirm which account they selected. Cancellation or an unsuccessful callback returns to the sign-in page with an error instead of granting dashboard access.

Supabase Auth performs server-side email and password validation. The profile migration applies a database length constraint and own-row RLS policies. This repository defines only `profiles`; review every other table in the live database and enable RLS with table-specific policies. `@supabase/ssr` manages auth cookies, but XSS prevention is still required because script execution in an authenticated page can perform actions as that user.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
