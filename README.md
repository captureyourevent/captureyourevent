# CaptureYourEvent — Deployment Guide (Supabase + Vercel)

Data syncs across ALL devices. Follow these steps in order.

---

## PART 1 — Set Up Supabase (your database)

### Step 1 — Create a Supabase account
1. Go to **supabase.com**
2. Click "Start your project" → sign up with GitHub or email (free)

### Step 2 — Create a new project
1. Click "New Project"
2. Name it: captureyourevent
3. Set a database password (save it somewhere safe)
4. Choose a region close to you
5. Click "Create new project" — takes ~1 minute

### Step 3 — Create the database tables
1. In Supabase, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Paste and run this SQL:

create table clients (
  id text primary key,
  name text not null,
  email text,
  phone text,
  "heardAboutUs" text,
  notes text,
  created_at timestamptz default now()
);

create table events (
  id text primary key,
  client_id text references clients(id) on delete cascade,
  type text,
  insurer text,
  effective text,
  premium text,
  notes text,
  created_at timestamptz default now()
);

create table activities (
  id text primary key,
  client_id text references clients(id) on delete cascade,
  type text,
  subject text,
  priority text,
  "dueDate" text,
  notes text,
  done boolean default false,
  created_at timestamptz default now()
);

alter table clients enable row level security;
alter table events enable row level security;
alter table activities enable row level security;

create policy "Allow all" on clients for all using (true) with check (true);
create policy "Allow all" on events for all using (true) with check (true);
create policy "Allow all" on activities for all using (true) with check (true);

### Step 4 — Get your API keys
Go to Settings > API and copy:
- Project URL (https://xxxx.supabase.co)
- anon / public key (starts with eyJ...)

---

## PART 2 — GitHub

### Step 5 — Create a GitHub account at github.com (free)

### Step 6 — Create a new repository named: captureyourevent

### Step 7 — Upload all files from this zip keeping folder structure:
  package.json
  .env.example
  public/index.html
  src/index.js
  src/App.jsx
  src/supabaseClient.js

---

## PART 3 — Vercel

### Step 8 — Go to vercel.com, sign up with GitHub

### Step 9 — Add New Project > select captureyourevent repo

### Step 10 — Before deploying, add Environment Variables:
  REACT_APP_SUPABASE_URL       = your Project URL
  REACT_APP_SUPABASE_ANON_KEY  = your anon key

### Step 11 — Click Deploy. Done! ~60 seconds.

Your app is now live and syncs across all devices.

---

## Future Updates
1. Ask Claude for changes
2. Download new App.jsx
3. Edit src/App.jsx in GitHub (pencil icon)
4. Paste new code and commit
5. Vercel auto-redeploys in ~60 seconds
