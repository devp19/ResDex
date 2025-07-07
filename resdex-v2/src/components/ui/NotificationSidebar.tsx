import React, { useEffect, useState, useRef } from "react";
import { getNotificationsForUser } from "@/lib/notificationService";
import { acceptFollowRequest, rejectFollowRequest } from "@/lib/followService";
import { supabase } from '@/lib/supabaseClient';
import { SidebarProvider } from "./sidebar";
import { X } from "lucide-react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NotificationSidebarProps {
  open: boolean;
  onClose: () => void;
}

const Tilt = dynamic(() => import("react-parallax-tilt"), { ssr: false });

// Utility: Convert string to Title Case
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export const NotificationSidebar: React.FC<NotificationSidebarProps> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  const prevOpen = useRef(open);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      // Use mock data if not authenticated
      setNotifications([
        {
          id: 1,
          actor: { display_name: "Fleur", username: "fleur", avatar_url: "/dev.jpg" },
          type: "comment",
          content: { message: "Really love this approach. I think this is the best solution for the document sync issue." },
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          actor: { display_name: "Lily-Rose", username: "lilyrose", avatar_url: "/dev2.jpg" },
          type: "follow",
          content: { message: "Lily-Rose followed you" },
          created_at: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getNotificationsForUser(userId).then((notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
  }, [userId]);

  // Refetch notifications when sidebar closes
  useEffect(() => {
    if (prevOpen.current && !open && userId) {
      setLoading(true);
      getNotificationsForUser(userId).then((notifs) => {
        setNotifications(notifs);
        setLoading(false);
      });
    }
    prevOpen.current = open;
  }, [open, userId]);

  const handleAccept = async (actorId: string, notifId: number) => {
    setActionLoading((prev) => ({ ...prev, [notifId]: true }));
    await acceptFollowRequest(actorId);
    getNotificationsForUser(userId!).then((notifs) => setNotifications(notifs));
    setActionLoading((prev) => ({ ...prev, [notifId]: false }));
  };

  const handleReject = async (actorId: string, notifId: number) => {
    setActionLoading((prev) => ({ ...prev, [notifId]: true }));
    await rejectFollowRequest(actorId);
    getNotificationsForUser(userId!).then((notifs) => setNotifications(notifs));
    setActionLoading((prev) => ({ ...prev, [notifId]: false }));
  };

  const handleDismiss = async (notificationId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    console.log('Dismiss clicked for notification:', notificationId);
    try {
      const { error } = await supabase.rpc(
        'dismiss_notification',
        { notification_id: notificationId }
      );
      if (error) {
        console.error('Error dismissing notification:', error);
        return;
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Unexpected error dismissing notification:', err);
    }
  };

  // Handler to close sidebar on profile link click
  const handleProfileClick = (e: React.MouseEvent, href: string) => {
    if (onClose) onClose();
  };

  return (
    <SidebarProvider defaultOpen={open} open={open} onOpenChange={onClose}>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm transition-opacity" onClick={onClose} />
      )}
      <div
        className={`fixed right-0 top-0 bottom-0 h-auto w-[400px] max-w-full z-50 transition-transform duration-300 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 outline outline-1 outline-gray-400/40 dark:outline-zinc-700/40 bg-[rgba(230,230,230,0.18)] dark:bg-[rgba(24,24,27,0.28)] backdrop-blur-2xl flex flex-col m-4 sm:m-6
        ${open ? 'translate-x-0' : 'translate-x-[calc(100%+1.5rem)]'}`}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-transparent backdrop-blur-xl rounded-t-3xl">
          <h2 className="text-2xl lg:leading-tight tracking-tight font-medium text-black dark:text-white">Notifications</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="text-center text-zinc-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-zinc-500 mt-8">You're all caught up!</div>
          ) : (
            <ul className="space-y-4 bg-transparent">
              {notifications.map((notif) => (
                <Tilt
                  key={notif.id}
                  tiltMaxAngleX={6}
                  tiltMaxAngleY={6}
                  scale={1.03}
                  transitionSpeed={400}
                  glareEnable={false}
                  className="w-full"
                >
                  <li className="relative rounded-2xl p-4 flex flex-col border border-zinc-200 dark:border-zinc-800 outline outline-1 outline-gray-400/40 dark:outline-zinc-700/40 bg-[rgba(230,230,230,0.18)] dark:bg-[rgba(24,24,27,0.28)] hover:bg-black/[.025] dark:hover:bg-white/10 transition-colors">
                    {notif.type === 'follow_request' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition" aria-label="Dismiss">
                              <X className="w-4 h-4 text-zinc-900" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">Dismiss</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {notif.type === 'follow_request_accepted' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="absolute top-2 right-2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                              aria-label="Dismiss"
                              type="button"
                              onClick={(e) => handleDismiss(notif.id, e)}
                            >
                              <X className="w-4 h-4 text-zinc-500" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">Dismiss</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={notif.actor?.avatar_url || "/empty-pic.webp"}
                        alt={notif.actor?.display_name || notif.actor?.username || "User"}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                      />
                      <div>
                        <Link
                          href={`/profile/${notif.actor?.username}`}
                          className="group inline-flex items-center font-bold text-zinc-900 dark:text-white focus:outline-none"
                          onClick={(e) => handleProfileClick(e, `/profile/${notif.actor?.username}`)}
                        >
                          <span className="group-hover:underline">{notif.actor?.display_name || notif.actor?.full_name || notif.actor?.username}</span>
                          <ExternalLink className="ml-1 w-4 h-4 group-hover:underline" strokeWidth={2} />
                        </Link>
                        <div className="text-xs text-zinc-500">@{notif.actor?.username}</div>
                      </div>
                    </div>
                    <span className="text-1xl lg:leading-tight tracking-tight font-medium text-black dark:text-white">
                      {notif.type === 'follow_request_accepted'
                        ? 'Accepted your follow request.'
                        : toTitleCase(notif.type.replace(/_/g, ' '))}
                    </span>
                    {!(notif.type === 'follow_request' || notif.type === 'follow_request_accepted') && (
                      <span className="text-zinc-800 dark:text-zinc-100">{typeof notif.content === 'string' ? JSON.parse(notif.content).message : notif.content.message}</span>
                    )}
                    <span className="text-xs text-zinc-400 mt-2">{new Date(notif.created_at).toLocaleString()}</span>
                    {notif.type === 'follow_request' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAccept(notif.actor_id, notif.id)}
                          disabled={actionLoading[notif.id]}
                          className="rounded-full bg-[#2a2a2a] text-white px-4 py-2 text-sm font-semibold hover:bg-[#444] transition hover:cursor-pointer"
                        >
                          {actionLoading[notif.id] ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleReject(notif.actor_id, notif.id)}
                          disabled={actionLoading[notif.id]}
                          className="rounded-full bg-[#2a2a2a] text-white px-4 py-2 text-sm font-semibold hover:bg-[#444] transition hover:cursor-pointer"
                        >
                          {actionLoading[notif.id] ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </li>
                </Tilt>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default NotificationSidebar; 