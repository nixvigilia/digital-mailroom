-- Add storage policies for mail-items folder
-- Users can only access their own mail item scans
-- Operators can access all mail item scans

-- Policy 5: Users can read (download) their own mail item files
-- REQUIRED for users to see their mail scans
CREATE POLICY IF NOT EXISTS "Users can view their own mail items"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'keep' AND
  (storage.foldername(name))[1] = 'mail-items' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 6: Operators can read ALL mail item files
-- REQUIRED for operators to view mail scans
CREATE POLICY IF NOT EXISTS "Operators can view all mail items"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'keep' AND
  (storage.foldername(name))[1] = 'mail-items' AND
  public.is_operator() = true
);







