-- Organizations table (billable entity)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text default 'inactive' check (subscription_status in ('inactive', 'active', 'canceled', 'past_due', 'trialing')),
  seats integer default 1,
  created_at timestamptz default now() not null
);

-- Organization members table
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')) not null,
  created_at timestamptz default now() not null,
  unique(organization_id, user_id)
);

-- Indexes
create index organizations_owner_id_idx on public.organizations(owner_id);
create index organizations_stripe_customer_id_idx on public.organizations(stripe_customer_id);
create index organization_members_user_id_idx on public.organization_members(user_id);
create index organization_members_organization_id_idx on public.organization_members(organization_id);

-- RLS policies
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Organizations: users can view orgs they belong to
create policy "Users can view their organizations"
  on public.organizations for select
  using (
    id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Organizations: only owner can update
create policy "Owner can update organization"
  on public.organizations for update
  using (owner_id = auth.uid());

-- Organization members: users can view members of their orgs
create policy "Users can view org members"
  on public.organization_members for select
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Organization members: owner and admin can insert
create policy "Owner and admin can add members"
  on public.organization_members for insert
  with check (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Organization members: owner and admin can delete
create policy "Owner and admin can remove members"
  on public.organization_members for delete
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );
