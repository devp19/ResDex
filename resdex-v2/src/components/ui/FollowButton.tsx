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
    return <button disabled className="ml-4 rounded-full px-8 py-3 border bg-gray-200 text-gray-500">Loading...</button>;
  }

  if (status === 'not_following') {
    return (
      <button
        onClick={handleFollowAction}
        disabled={isProcessing}
        className="ml-4 rounded-full px-8 py-3 border bg-[#2a2a2a] text-white hover:bg-[#444] transition"
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
        className="ml-4 rounded-full px-8 py-3 border bg-gray-300 text-gray-700 cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Requested'}
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowAction}
      disabled={isProcessing}
      className="ml-4 rounded-full px-8 py-3 border bg-[#2a2a2a] text-white hover:bg-[#444] transition"
    >
      {isProcessing ? 'Processing...' : 'Following'}
    </button>
  );
}; 