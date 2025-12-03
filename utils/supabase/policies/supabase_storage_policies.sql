-- Helper function to check if user is an operator
create or replace function public.is_operator()
returns boolean as $$
begin
  return exists (
    select 1 from public.profile
    where id = auth.uid()
    and role in ('OPERATOR', 'ADMIN', 'KYC_APPROVER')
  );
end;
$$ language plpgsql security definer;

-- Policy 1: Users can upload (insert) their own KYC files
-- (Optional now since we use Admin key for upload, but good for security depth)
create policy "Users can upload their own KYC files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'keep' and
  (storage.foldername(name))[1] = 'kyc' and
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 2: Users can read (download) their own KYC files
-- REQUIRED for users to see their uploaded IDs
create policy "Users can view their own KYC files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'keep' and
  (storage.foldername(name))[1] = 'kyc' and
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 3: Operators can read ALL KYC files
-- REQUIRED for admins to review applications
create policy "Operators can view all KYC files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'keep' and
  public.is_operator() = true
);

-- Policy 4: Operators can manage all KYC files
create policy "Operators can manage all KYC files"
on storage.objects for all
to authenticated
using (
  bucket_id = 'keep' and
  public.is_operator() = true
);