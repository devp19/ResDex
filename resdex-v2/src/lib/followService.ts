import { supabase } from './supabaseClient';
import type { FollowResponse, PendingFollowRequest, Profile } from './types';

/**
 * Send a follow request to another user
 */
export async function sendFollowRequest(followingId: string): Promise<FollowResponse> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Check if already following or has pending request
    const { data: existingFollow, error: checkError } = await supabase
      .from('followers')
      .select('id, status')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingFollow) {
      return { 
        success: false, 
        error: `Already ${existingFollow.status === 'pending' ? 'requested to follow' : 'following'} this user` 
      };
    }
    
    // Insert follow request with pending status
    const { data: follow, error: followError } = await supabase
      .from('followers')
      .insert({
        follower_id: user.id,
        following_id: followingId,
        status: 'pending'
      })
      .select('id')
      .single();
    
    if (followError) throw followError;
    
    console.log('Follow request created:', follow);
    
    // The notification will be created automatically by the database trigger
    
    return { 
      success: true, 
      data: { follow_id: follow.id }
    };
  } catch (error: any) {
    console.error('Error sending follow request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all pending follow requests for the current user
 */
export async function getPendingFollowRequests(): Promise<FollowResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('pending_follow_requests')
      .select('*')
      .eq('following_id', user.id);
    if (error) throw error;
    return {
      success: true,
      data: data as PendingFollowRequest[]
    };
  } catch (error: any) {
    console.error('Error getting pending requests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Accept a follow request from another user
 */
export async function acceptFollowRequest(followerId: string): Promise<FollowResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    // Find the follow request
    const { data: followRequest, error: findError } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', user.id)
      .eq('status', 'pending')
      .single();
    if (findError) throw findError;
    if (!followRequest) {
      return { success: false, error: 'Follow request not found' };
    }
    // Update status to accepted
    const { error: updateError } = await supabase
      .from('followers')
      .update({ status: 'accepted' })
      .eq('id', followRequest.id);
    if (updateError) throw updateError;
    // Create notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: followerId,
        actor_id: user.id,
        type: 'follow_request_accepted',
        content: { message: 'accepted your follow request' },
        read: false
      });
    if (notifError) throw notifError;
    return {
      success: true,
      data: { follow_id: followRequest.id }
    };
  } catch (error: any) {
    console.error('Error accepting follow request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reject a follow request from another user
 */
export async function rejectFollowRequest(followerId: string): Promise<FollowResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', user.id)
      .eq('status', 'pending');
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting follow request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all users who follow the current user
 */
export async function getFollowers(): Promise<FollowResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('followers')
      .select(`
        id,
        follower:profiles!followers_follower_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        ),
        created_at
      `)
      .eq('following_id', user.id)
      .eq('status', 'accepted');
    if (error) throw error;
    const followers = data?.map(item => ({
      id: item.id,
      profile: (item.follower && !Array.isArray(item.follower)) ? item.follower as Profile : undefined,
      created_at: item.created_at
    })) || [];
    return {
      success: true,
      data: followers
    };
  } catch (error: any) {
    console.error('Error getting followers:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all users the current user is following
 */
export async function getFollowing(): Promise<FollowResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('followers')
      .select(`
        id,
        following:profiles!followers_following_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        ),
        created_at
      `)
      .eq('follower_id', user.id)
      .eq('status', 'accepted');
    if (error) throw error;
    const following = data?.map(item => ({
      id: item.id,
      profile: (item.following && !Array.isArray(item.following)) ? item.following as Profile : undefined,
      created_at: item.created_at
    })) || [];
    return {
      success: true,
      data: following
    };
  } catch (error: any) {
    console.error('Error getting following:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check the follow status between the current user and another user
 */
export async function getFollowStatus(otherUserId: string): Promise<{
  status: 'not_following' | 'pending' | 'accepted',
  error?: string
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('followers')
      .select('status')
      .eq('follower_id', user.id)
      .eq('following_id', otherUserId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return { status: 'not_following' };
    }
    return { status: data.status as 'pending' | 'accepted' };
  } catch (error: any) {
    console.error('Error checking follow status:', error);
    return { status: 'not_following', error: error.message };
  }
}

/**
 * Get all users who follow a specific user (by userId)
 */
export async function getFollowersForUser(userId: string): Promise<FollowResponse> {
  try {
    const { data, error } = await supabase
      .from('followers')
      .select(`
        id,
        follower:profiles!followers_follower_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        ),
        created_at
      `)
      .eq('following_id', userId)
      .eq('status', 'accepted');
    if (error) throw error;
    const followers = data?.map(item => ({
      id: item.id,
      profile: (item.follower && !Array.isArray(item.follower)) ? item.follower as Profile : undefined,
      created_at: item.created_at
    })) || [];
    return {
      success: true,
      data: followers
    };
  } catch (error: any) {
    console.error('Error getting followers for user:', error);
    return { success: false, error: error.message };
  }
} 