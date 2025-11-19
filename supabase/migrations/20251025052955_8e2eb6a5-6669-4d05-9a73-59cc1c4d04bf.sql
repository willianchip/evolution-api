-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  device_fingerprint TEXT,
  geolocation TEXT,
  email_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON public.users(verification_token);

-- Create trigger to update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create check_duplicate_free_account function
CREATE OR REPLACE FUNCTION public.check_duplicate_free_account(
  p_email TEXT,
  p_device_fingerprint TEXT,
  p_geolocation TEXT
)
RETURNS TABLE(is_duplicate BOOLEAN, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_count INTEGER;
  v_geolocation_parts TEXT[];
  v_lat FLOAT;
  v_lon FLOAT;
  v_existing_lat FLOAT;
  v_existing_lon FLOAT;
  v_distance FLOAT;
BEGIN
  -- Check for duplicate email
  SELECT COUNT(*) INTO v_user_count
  FROM public.users
  WHERE email = p_email;
  
  IF v_user_count > 0 THEN
    is_duplicate := true;
    reason := 'Email já cadastrado';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check for duplicate device fingerprint
  IF p_device_fingerprint IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_count
    FROM public.users
    WHERE device_fingerprint = p_device_fingerprint;
    
    IF v_user_count > 0 THEN
      is_duplicate := true;
      reason := 'Dispositivo já cadastrado';
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;

  -- Check for duplicate geolocation (within 50km radius)
  IF p_geolocation IS NOT NULL AND p_geolocation != '' THEN
    -- Parse the new geolocation (format: "lat,lon")
    v_geolocation_parts := string_to_array(p_geolocation, ',');
    
    IF array_length(v_geolocation_parts, 1) = 2 THEN
      v_lat := v_geolocation_parts[1]::FLOAT;
      v_lon := v_geolocation_parts[2]::FLOAT;
      
      -- Check existing users with geolocation
      FOR v_existing_lat, v_existing_lon IN
        SELECT 
          split_part(geolocation, ',', 1)::FLOAT,
          split_part(geolocation, ',', 2)::FLOAT
        FROM public.users
        WHERE geolocation IS NOT NULL 
          AND geolocation != ''
          AND position(',' in geolocation) > 0
      LOOP
        -- Calculate approximate distance using Haversine formula (simplified)
        v_distance := 6371 * acos(
          cos(radians(v_lat)) * cos(radians(v_existing_lat)) *
          cos(radians(v_existing_lon) - radians(v_lon)) +
          sin(radians(v_lat)) * sin(radians(v_existing_lat))
        );
        
        IF v_distance < 50 THEN
          is_duplicate := true;
          reason := 'Localização muito próxima de outra conta';
          RETURN NEXT;
          RETURN;
        END IF;
      END LOOP;
    END IF;
  END IF;

  -- No duplicates found
  is_duplicate := false;
  reason := NULL;
  RETURN NEXT;
END;
$$;