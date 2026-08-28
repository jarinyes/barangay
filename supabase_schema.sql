-- Run this in the Supabase SQL Editor to create the public.users table

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  legacy_id TEXT, -- To map to the old string-based IDs like USR-LGU-01
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  "agencyType" TEXT NOT NULL,
  "agencyName" TEXT NOT NULL,
  barangay TEXT,
  position TEXT,
  "badgeOrIdNumber" TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  "avatarUrl" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all users (since we need to list officers)
CREATE POLICY "Allow authenticated users to read users" ON public.users 
  FOR SELECT TO authenticated USING (true);

-- Policy: Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON public.users 
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create a trigger to automatically create a public.users row on auth.users insert
-- Note: This is optional, but helpful if you want new signups to automatically get a profile row.
-- Since the migration script inserts directly, this is mostly for future signups.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, "agencyType", "agencyName", position, "badgeOrIdNumber", barangay, "avatarUrl")
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'Unknown User'),
    COALESCE(new.raw_user_meta_data->>'role', 'RESIDENT'),
    COALESCE(new.raw_user_meta_data->>'agencyType', 'RESIDENT'),
    COALESCE(new.raw_user_meta_data->>'agencyName', 'Unknown Agency'),
    COALESCE(new.raw_user_meta_data->>'position', ''),
    COALESCE(new.raw_user_meta_data->>'badgeOrIdNumber', ''),
    new.raw_user_meta_data->>'barangay',
    new.raw_user_meta_data->>'avatarUrl'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
