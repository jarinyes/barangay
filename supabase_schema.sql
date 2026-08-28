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
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;
CREATE POLICY "Allow authenticated users to read users" ON public.users 
  FOR SELECT TO authenticated USING (true);

-- Policy: Allow users to update their own profile
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;
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

-- Cases Table
CREATE TABLE IF NOT EXISTS public.cases (
  id TEXT PRIMARY KEY,
  "incidentId" TEXT,
  "complaintId" TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  "initialNarrative" TEXT,
  "currentNarrativeSummary" TEXT,
  "dateReported" TIMESTAMP WITH TIME ZONE NOT NULL,
  "incidentDate" TEXT NOT NULL,
  barangay TEXT NOT NULL,
  "specificLocation" TEXT NOT NULL,
  
  -- JSONB for nested arrays
  complainants JSONB DEFAULT '[]'::jsonb,
  respondents JSONB DEFAULT '[]'::jsonb,
  witnesses JSONB DEFAULT '[]'::jsonb,
  "personsInvolved" JSONB DEFAULT '[]'::jsonb,
  "vehiclesInvolved" JSONB DEFAULT '[]'::jsonb,
  "statusHistory" JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  "imageUrls" JSONB DEFAULT '[]'::jsonb,
  
  -- Tracking
  "isInvolvingOfficial" BOOLEAN DEFAULT false,
  "officialInvolvedType" TEXT,
  "officialInvolvedName" TEXT,
  "officialInvolvedPosition" TEXT,
  "officialInvolvedAgency" TEXT,
  
  "originatingAgency" TEXT,
  "currentHandlingAgency" TEXT,
  "assignedPersonnel" TEXT,
  "assignedPersonnelContact" TEXT,
  priority TEXT,
  status TEXT,
  
  "resolutionSummary" TEXT,
  "dateResolved" TIMESTAMP WITH TIME ZONE,
  "dateClosed" TIMESTAMP WITH TIME ZONE,
  "outcomeType" TEXT,
  
  "isCitizenReport" BOOLEAN DEFAULT false,
  "residentReporterId" TEXT,
  "isAccidentEmergency" BOOLEAN DEFAULT false,
  "accidentVehicleDetails" TEXT,
  "accidentCasualties" TEXT,
  "isAccidentProneArea" BOOLEAN DEFAULT false,
  "emergencyAlarmAcknowledged" BOOLEAN DEFAULT false,
  "emergencyFirstRespondersDispatched" BOOLEAN DEFAULT false,
  
  "collisionImpactType" TEXT,
  "roadSurfaceCondition" TEXT,
  "weatherCondition" TEXT,
  "injuriesCount" INTEGER,
  "casualtiesCount" INTEGER,
  "isHitAndRun" BOOLEAN DEFAULT false,
  "respondingAmbulanceUnit" TEXT,
  "hospitalTransported" TEXT,
  
  "dateCreated" TIMESTAMP WITH TIME ZONE NOT NULL,
  "dateLastUpdated" TIMESTAMP WITH TIME ZONE NOT NULL,
  "createdBy" TEXT,
  "isConfidential" BOOLEAN DEFAULT false
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read cases" ON public.cases;
CREATE POLICY "Allow authenticated users to read cases" ON public.cases FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to insert cases" ON public.cases;
CREATE POLICY "Allow authenticated users to insert cases" ON public.cases FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated users to update cases" ON public.cases;
CREATE POLICY "Allow authenticated users to update cases" ON public.cases FOR UPDATE TO authenticated USING (true);


-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  role TEXT NOT NULL,
  agency TEXT NOT NULL,
  action TEXT NOT NULL,
  "caseId" TEXT,
  "previousValue" TEXT,
  "newValue" TEXT,
  details TEXT,
  "ipAddress" TEXT
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read audit_logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated users to read audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to insert audit_logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated users to insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);


-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  "caseId" TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  "isRead" BOOLEAN DEFAULT false,
  "targetAgency" TEXT,
  "targetAgencyTypes" JSONB DEFAULT '[]'::jsonb,
  "targetRoles" JSONB DEFAULT '[]'::jsonb,
  "targetBarangay" TEXT,
  "targetUserId" TEXT,
  "targetResidentName" TEXT,
  priority TEXT,
  "actionUrl" TEXT,
  "senderName" TEXT,
  "senderAgency" TEXT,
  "isAccidentEmergency" BOOLEAN DEFAULT false,
  "accidentDetails" JSONB,
  "alarmSound" BOOLEAN DEFAULT false
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read notifications" ON public.notifications;
CREATE POLICY "Allow authenticated users to read notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON public.notifications;
CREATE POLICY "Allow authenticated users to insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated users to update notifications" ON public.notifications;
CREATE POLICY "Allow authenticated users to update notifications" ON public.notifications FOR UPDATE TO authenticated USING (true);


-- Storage Bucket for Report Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'report-images' bucket
DROP POLICY IF EXISTS "Allow public to read report images" ON storage.objects;
CREATE POLICY "Allow public to read report images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'report-images');

DROP POLICY IF EXISTS "Allow authenticated to upload report images" ON storage.objects;
CREATE POLICY "Allow authenticated to upload report images" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'report-images');
