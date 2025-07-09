"use client";

import React, { useState, useEffect } from "react";
import {
  sendFollowRequest,
  getFollowStatus,
  acceptFollowRequest,
  rejectFollowRequest
} from "@/lib/followService";

interface FollowButtonProps {
  userId: string;
  onStatusChange?: (newStatus: 'not_following' | 'pending' | 'accepted') => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ userId, onStatusChange }) => {
  const [status, setStatus] = useState<'not_following' | 'pending' | 'accepted' | 'loading'>('loading');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const result = await getFollowStatus(userId);
      setStatus(result.status);
    };
    checkStatus();
  }, [userId]);

  const handleFollowAction = async () => {
    setIsProcessing(true);
    try {
      if (status === 'not_following') {
        const result = await sendFollowRequest(userId);
        if (result.success) {
          setStatus('pending');
          onStatusChange?.('pending');
        }
      } else if (status === 'pending') {
        // Accept follow request (if you are being followed)
        const result = await acceptFollowRequest(userId);
        if (result.success) {
          setStatus('accepted');
          onStatusChange?.('accepted');
        }
      } else if (status === 'accepted') {
        // Unfollow logic could go here
      }
    } catch (error) {
      console.error('Error performing follow action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const result = await rejectFollowRequest(userId);
      if (result.success) {
        setStatus('not_following');
        onStatusChange?.('not_following');
      }
    } catch (error) {
      console.error('Error rejecting follow request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'loading') {
    return <button disabled className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center gap-2 font-semibold text-[#2a2a2a] border-none">Loading...</button>;
  }

  if (status === 'not_following') {
    return (
      <button
        onClick={handleFollowAction}
        disabled={isProcessing}
        className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center gap-2 font-semibold text-[#2a2a2a] border-none cursor-pointer"
      >
        {isProcessing ? 'Processing...' : 'Follow'}
      </button>
    );
  }

  if (status === 'pending') {
    return (
      <button
        onClick={handleFollowAction}
        disabled={isProcessing}
        className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center gap-2 font-semibold text-[#2a2a2a] border-none cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Requested'}
      </button>
    );
  }

  // Following state: dark background, white text
  return (
    <button
      onClick={handleFollowAction}
      disabled={isProcessing}
      className="px-4 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#444] transition flex items-center justify-center gap-2 font-semibold text-white border-none cursor-pointer"
    >
      {isProcessing ? 'Processing...' : 'Following'}
    </button>
  );
}; 