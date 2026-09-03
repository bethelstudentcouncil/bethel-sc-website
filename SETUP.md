# Bethel SC Website — Beginner Setup Guide (Windows)

## What this version does

This is the production-style shared version. The public site is still the same Bethel design, but its editable content comes from Supabase.

- Cloudflare Pages hosts the HTML files.
- Supabase Authentication handles admin login.
- Supabase Postgres stores draft/published content.
- Supabase Storage stores uploaded images.
- `index.html` reads the published content, so the same content appears on phones, laptops, and other devices.
- `admin.html` lets authorized admins edit, reorder, save drafts, and publish.

## Important safety rules

1. Never put a Supabase Secret key or Service Role key in `config.js`.
2. Only the Supabase Publishable key is safe to place in browser code, and only because Row Level Security is enabled.
3. Never send your Supabase password to anyone in chat.
4. The old prototype login (`admin` / `bethel2026`) is NOT used here.

Supabase now recommends browser apps use a Publishable key (the legacy `anon` key is also still supported during the migration period). Secret/service-role keys must stay on the server and must never be shipped to the browser.

## Phase 0 — Files

The final folder you upload to GitHub is:

    bethel_sc_production/
    ├── index.html
    ├── admin.html
    ├── config.js
    ├── SETUP.md
    ├── js/
    │   └── supabase-client.js
    ├── supabase/
    │   └── database.sql
    ├── original/
    │   └── bethel-homepage1(1).html
    └── prototype/
        ├── index.html
        ├── admin.html
        └── README.txt

The `original/` and `prototype/` folders are reference copies. They are not required for the live site, but they are included so you still have your earlier files.

## Phase 1 — Create GitHub

1. Go to https://github.com/ and sign in or create an account.
2. Create a new repository named `bethel-sc-website`.
3. You can keep the repository public for this beginner setup. The Supabase Publishable key is not a secret, but the database is still protected by RLS.
4. Upload the LIVE files/folders from `bethel_sc_production`:
   - `index.html`
   - `admin.html`
   - `config.js`
   - `SETUP.md`
   - `js/`
   - `supabase/`
   - `original/`
   - `prototype/`

Do not change `config.js` yet except in the later Supabase step.

## Phase 2 — Create Supabase

1. Go to https://supabase.com/.
2. Sign in.
3. Create a new project. Suggested name: `bethel-sc`.
4. Save the database password somewhere safe.
5. Open the project.

## Phase 3 — Create the database and storage

1. In Supabase, open **SQL Editor**.
2. Create a new SQL query.
3. Open this file from your computer:
   `supabase/database.sql`
4. Copy ALL of the SQL in that file.
5. Paste it into Supabase SQL Editor.
6. Click **Run**.
7. The query should create:
   - `admin_users`
   - `site_content`
   - the RLS helper function
   - RLS policies
   - the `website-images` storage bucket
   - storage policies
   - initial editable content

If the query says it already exists, that is usually okay because the script uses `if not exists` / policy replacement where appropriate.

## Phase 4 — Create your admin login

Use the SC email you gave for this project:

    bethelstudentcouncilsy24@gmail.com

1. In Supabase, go to **Authentication** > **Users**.
2. Create a new user with that email.
3. Set a strong password that only the website owner knows.
4. If Supabase asks whether the email is confirmed, follow the dashboard's current confirmation flow. For a school-owned admin account, you can use an official email you control.

## Phase 5 — Authorize your admin account

Supabase Auth creates a UUID for each user.

1. In **Authentication > Users**, find your new user.
2. Copy its **User UID**.
3. Go to **SQL Editor**.
4. Run this, replacing `PASTE-USER-UUID-HERE` with the copied UID:

    insert into public.admin_users (user_id, email)
    values ('PASTE-USER-UUID-HERE', 'bethelstudentcouncilsy24@gmail.com')
    on conflict (user_id) do update set email = excluded.email;

This is the step that gives the account permission to edit the site.

## Phase 6 — Get the two browser values

You need only:

1. **Project URL**
2. **Publishable key**

Supabase's current dashboard exposes these in the project's **Connect** dialog or under **Settings > API Keys**.

Open `config.js` and replace:

    window.BETHEL_SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
    window.BETHEL_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_REPLACE_ME';

with your real values.

Example shape only:

    window.BETHEL_SUPABASE_URL = 'https://abcdefghijk.supabase.co';
    window.BETHEL_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xxxxxxxxxx';

Do NOT paste a key starting with `sb_secret_` here.

## Phase 7 — Upload the updated config to GitHub

1. Save `config.js`.
2. In GitHub, open your repository.
3. Replace the old `config.js` with the updated one.
4. Commit the change.

Cloudflare will redeploy automatically once the repository is connected.

## Phase 8 — Test Supabase before hosting

You can test the admin by opening the live site after Cloudflare deployment. The file `admin.html` cannot authenticate successfully until `config.js`, the SQL setup, and the admin user are all correct.

Open:

    https://YOUR-SITE.pages.dev/admin.html

Sign in with:

    bethelstudentcouncilsy24@gmail.com

and the password you created in Supabase.

## Phase 9 — Create the Cloudflare Pages site

1. Go to https://www.cloudflare.com/ and create/sign in to an account.
2. Open **Workers & Pages**.
3. Choose **Create application**.
4. Choose **Pages**.
5. Choose **Connect to Git**.
6. Connect GitHub.
7. Select your `bethel-sc-website` repository.
8. Use the `main` branch as the production branch.
9. For a plain HTML site, use:
   - Framework preset: None
   - Build command: `exit 0`
   - Build output directory: `.`
10. Deploy.

Cloudflare should give you a public `*.pages.dev` address.

## Phase 10 — Test across devices

On your Windows laptop:

    https://YOUR-SITE.pages.dev/

On your phone, open the exact same URL.

Then test the admin:

    https://YOUR-SITE.pages.dev/admin.html

Log in on the laptop and publish a harmless test announcement.

Refresh the public homepage on the phone.

The same published content should appear because both devices are reading the same Supabase database.

## Phase 11 — Add another admin later

For a second admin:

1. In Supabase **Authentication > Users**, create their account.
2. Copy their User UID.
3. Run:

    insert into public.admin_users (user_id, email)
    values ('SECOND-USER-UUID', 'their-email@example.com')
    on conflict (user_id) do update set email = excluded.email;

They can then sign in at `/admin.html` with their own password.

Do NOT give them your password if you do not need to. Separate accounts are safer and make it possible to remove one person's access later.

## Phase 12 — How daily editing works

Once the setup is complete, the SC website owner does NOT edit HTML.

For a news post:

1. Open `/admin.html`.
2. Sign in.
3. Click **News**.
4. Click **+ Add**.
5. Enter the category, date, title, excerpt, and body.
6. Upload the image.
7. Leave it unpublished while preparing, or check **Published** when it is ready.
8. Click **Save Item**.
9. Click **Publish Changes** at the top.

For events, gallery, testimonials, programs, officers, hero text, mission/vision, and contact information, the process is similar.

## Phase 13 — Free URL

The easiest free address is the Cloudflare `pages.dev` address, for example:

    https://bethel-sc-website.pages.dev

The exact hostname depends on what is available when you create the project.

A custom `.com`, `.org`, or `.ph` domain is normally a paid registration. If Bethel already owns a school domain, you can later connect a subdomain such as:

    sc.your-school-domain.com

Cloudflare Pages supports custom domains.

## Troubleshooting

### The public page is blank or still shows old content

Check:

- `config.js` contains the correct Project URL and Publishable key.
- `site_content` has row `id = 1`.
- There is published content in the `published` column.
- Your browser console does not show a Supabase error.

### Admin says "not authorized"

Your Auth user exists, but their UUID is not in `public.admin_users`.

Add the Auth user's UID using the SQL in Phase 5.

### Admin login works but saving fails

Check the RLS policies from `database.sql` were executed successfully.

### Image upload fails

Check that the `website-images` bucket exists and the four storage policies in `database.sql` were created.

### Cloudflare shows 404 for the home page

Make sure `index.html` is at the top level of the repository, not inside an extra folder. Cloudflare's static HTML guide specifically expects a top-level `index.html` for the root page.

## What NOT to upload

Never upload:

- a Supabase `sb_secret_...` key
- the legacy `service_role` key
- a database password
- passwords for admins
- school account passwords

The browser only needs the Project URL and Publishable key.
