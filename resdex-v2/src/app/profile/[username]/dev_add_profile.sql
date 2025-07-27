
DECLARE
    lowercase_username TEXT;

    avatar_options text[] := ARRAY[
    'https://mhnughbveavfihztvfvb.supabase.co/storage/v1/object/public/avatars/default/blob1.png',
    'https://mhnughbveavfihztvfvb.supabase.co/storage/v1/object/public/avatars/default/blob2.png',
    'https://mhnughbveavfihztvfvb.supabase.co/storage/v1/object/public/avatars/default/blob3.png',
    'https://mhnughbveavfihztvfvb.supabase.co/storage/v1/object/public/avatars/default/blob4.png',
    'https://mhnughbveavfihztvfvb.supabase.co/storage/v1/object/public/avatars/default/blob5.png',
    'https://mhnughbveavfihztvfvb.supabase.co/storage/v1/object/public/avatars/default/blob6.png',
    'https://mhnughbveavfihztvfvb.supabase.co/storage/v1/object/public/avatars/default/blob7.png',
    'https://mhnughbveavfihztvfvb.supabase.co/storage/v1/object/public/avatars/default/blob8.png'
  ];
  random_index int;
  avatar_url text;

BEGIN
    -- Ensure username is always lowercase
    lowercase_username := LOWER(TRIM(NEW.raw_user_meta_data->>'username'));
    
    -- Generate a random index between 1 and 8
    random_index := floor(random() * 8) + 1;

     -- Set the avatar_url to the randomly selected image
    avatar_url := avatar_options[random_index];

    -- Insert a new profile for the user
    INSERT INTO public.dev_profiles (
        id, 
        full_name, 
        username,
        avatar_url
    )
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data->>'full_name',
        lowercase_username,
        avatar_url
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
