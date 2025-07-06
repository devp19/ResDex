"use client";

import React, { useEffect, useState } from "react";
import { getNotificationsForUser } from "@/lib/notificationService";
import { acceptFollowRequest, rejectFollowRequest } from "@/lib/followService";
import { supabase } from "@/lib/supabaseClient";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getNotificationsForUser(userId).then((notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
  }, [userId]);

  const handleAccept = async (actorId: string, notifId: number) => {
    setActionLoading((prev) => ({ ...prev, [notifId]: true }));
    await acceptFollowRequest(actorId);
    // Optionally, refresh notifications after action
    getNotificationsForUser(userId!).then((notifs) => setNotifications(notifs));
    setActionLoading((prev) => ({ ...prev, [notifId]: false }));
  };

  const handleReject = async (actorId: string, notifId: number) => {
    setActionLoading((prev) => ({ ...prev, [notifId]: true }));
    await rejectFollowRequest(actorId);
    getNotificationsForUser(userId!).then((notifs) => setNotifications(notifs));
    setActionLoading((prev) => ({ ...prev, [notifId]: false }));
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      {loading ? (
        <div>Loading...</div>
      ) : notifications.length === 0 ? (
        <div>No notifications yet.</div>
      ) : (
        <ul className="w-full max-w-xl space-y-4">
          {notifications.map((notif) => (
            <li key={notif.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={notif.actor?.avatar_url || "/empty-pic.webp"}
                  alt={notif.actor?.display_name || notif.actor?.username || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold">{notif.actor?.display_name || notif.actor?.full_name || notif.actor?.username}</div>
                  <div className="text-xs text-gray-500">@{notif.actor?.username}</div>
                </div>
              </div>
              <span className="font-semibold capitalize mb-1">{notif.type.replace(/_/g, ' ')}</span>
              <span>{typeof notif.content === 'string' ? JSON.parse(notif.content).message : notif.content.message}</span>
              <span className="text-xs text-gray-500 mt-2">{new Date(notif.created_at).toLocaleString()}</span>
              {notif.type === 'follow_request' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAccept(notif.actor_id, notif.id)}
                    disabled={actionLoading[notif.id]}
                    className="rounded-full bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 transition"
                  >
                    {actionLoading[notif.id] ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleReject(notif.actor_id, notif.id)}
                    disabled={actionLoading[notif.id]}
                    className="rounded-full bg-red-500 text-white px-4 py-2 text-sm font-semibold hover:bg-red-600 transition"
                  >
                    {actionLoading[notif.id] ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 