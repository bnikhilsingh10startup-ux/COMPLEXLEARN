# ComplexLearn

A responsive full-stack learning platform starter with a navy-and-gold visual identity.

## Included
- React + Vite frontend
- Login and registration
- Student / Teacher role selection
- Supabase authentication and profile table support
- Browser-only demo mode when Supabase is not configured
- AI doubt solver through a server-side Cloudflare Pages Function
- Sample mock test with scoring and explanations
- Reminders saved in the browser
- Newspaper links and digital library links
- Responsive dashboard for desktop and mobile

## 1. Run on your computer
Install Node.js (LTS), then open a terminal in this folder and run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## 2. Add the official logo
The supplied ComplexLearn logo is included as `public/complexlearn-logo.png`.

## 3. Configure real login (Supabase)
1. Create a project at https://supabase.com/.
2. In Supabase, open Project Settings -> API and copy the Project URL and anon/public key.
3. Copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. In Supabase SQL Editor, run `supabase/schema.sql`.
5. In Authentication -> URL Configuration, add your deployed website URL to the allowed redirect URLs.

If these values are empty, the website uses DEMO MODE. Demo accounts are stored only in the current browser and are NOT secure production authentication. Do not use demo mode for real users.

## 4. Configure the AI tutor (Cloudflare Pages)
1. Deploy this project to Cloudflare Pages using the Git integration.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. In Cloudflare Pages -> your project -> Settings -> Variables and Secrets, add a secret named `OPENAI_API_KEY`.
5. Optionally add `OPENAI_MODEL` as a variable. Default: `gpt-4.1-mini`.
6. Redeploy the site.

The AI key is read only by `functions/api/ask.js` on the server. Never put the secret key in a `VITE_` variable or in frontend code.

## 5. Important limitations in this starter
- The mock test is a sample quiz; add your own syllabus and question bank before launch.
- Reminders are stored in the current browser. This version does not deliver push notifications while the site is closed.
- News and library sections link to external educational publishers and resources.
- Teacher Corner currently saves a draft only in the current page session; it does not yet publish announcements to students.
- Before public launch, test authentication, privacy, accessibility, and all workflows with a trusted adult/developer.

## Deploy on Cloudflare Pages
Connect your Git repository, then use:
- Framework preset: Vite (or None)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (the project root)

Cloudflare Pages Functions in the `functions/` directory are deployed alongside the static site when using Pages Git integration or Wrangler Pages deployment. A plain drag-and-drop upload of only the `dist` folder will not deploy the server function; use Git integration for the AI endpoint.
