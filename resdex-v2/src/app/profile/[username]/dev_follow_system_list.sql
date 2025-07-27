-- Function to get followers of a user
CREATE OR REPLACE FUNCTION public.dev_get_followers(p_user_id UUID)
RETURNS TABLE (
    follower_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    followed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.follower_id, 
        p.username, 
        p.full_name, 
        p.avatar_url,
        f.created_at AS followed_at
    FROM public.dev_user_followers f
    JOIN public.dev_profiles p ON f.follower_id = p.id
    WHERE f.followed_id = p_user_id
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users a profile is following
CREATE OR REPLACE FUNCTION public.dev_get_following(p_user_id UUID)
RETURNS TABLE (
    followed_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    followed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.followed_id, 
        p.username, 
        p.full_name, 
        p.avatar_url,
        f.created_at AS followed_at
    FROM public.dev_user_followers f
    JOIN public.dev_profiles p ON f.followed_id = p.id
    WHERE f.follower_id = p_user_id
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION 
    public.dev_get_followers(UUID),
    public.dev_get_following(UUID)
TO authenticated, anon;