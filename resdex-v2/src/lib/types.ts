// types.ts
export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

export interface Follower {
  id: number;
  follower_id: string;
  following_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface PendingFollowRequest {
  id: number;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower_username: string;
  follower_display_name: string;
  follower_avatar_url: string;
}

export interface Notification {
  id: number;
  recipient_id: string;
  actor_id: string;
  type: 'follow_request' | 'follow_request_accepted';
  content: { message: string };
  related_resource_type?: string;
  related_resource_id?: string;
  created_at: string;
  read: boolean;
}

export interface FollowResponse {
  success: boolean;
  data?: any;
  error?: string;
} 