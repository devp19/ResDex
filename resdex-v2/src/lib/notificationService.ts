import { supabase } from './supabaseClient';
import type { Notification } from './types';

/**
 * Fetch notifications for the current user, including actor's profile info
 */
export async function getNotificationsForUser(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles!actor_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data;
} 