"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Navbar, NavBody, NavbarLogo, NavItems, MessageBadge, NotificationBadge } from "@/components/ui/navbar";
import Link from "next/link";
import { Card } from "@/components/ui/card";

// Types for convenience
type UserProfile = {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
};
type LastMessage = {
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
};

type SidebarConvo = {
  user: UserProfile;
  lastMessage: LastMessage;
};

export default function MessagesPage() {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [gradient, setGradient] = useState("linear-gradient(to right, #fbe6b2, #f6b47b)");
  const imgRef = useRef<HTMLImageElement>(null);

  const [sidebarConvos, setSidebarConvos] = useState<SidebarConvo[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
const [loadingMessages, setLoadingMessages] = useState(false);


  useEffect(() => {
  const fetchMessages = async () => {
    setLoadingMessages(true);
    setMessages([]);

    if (!selectedUser || !currentUserId) {
      setLoadingMessages(false);
      return;
    }

    // Always sort for DM conversation_id consistency!
    const ids = [currentUserId, selectedUser.id].sort();
    const conversationId = `${ids[0]}_${ids[1]}`;

    const { data, error } = await supabase
      .from('dev_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
    setLoadingMessages(false);
  };

  fetchMessages();
}, [selectedUser, currentUserId]);


  // Navbar navigation items
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Network", link: "/network" },
    { name: "Jobs", link: "/jobs" },
  ];

  // Get Supabase user and profile
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: userData }) => {
      if (!userData?.user?.id) return;
      setCurrentUserId(userData.user.id);

      // Profile fetch (customize as needed for your schema)
      const { data: profile } = await supabase
        .from("dev_profiles")
        .select("id, full_name, username, avatar_url")
        .eq("id", userData.user.id)
        .single();
      if (profile) setCurrentUserProfile(profile);
    });
  }, []);

  // Sidebar: Fetch conversation partners and last messages
  useEffect(() => {
    if (!currentUserId) return;
    setLoadingConvos(true);

    async function fetchSidebarConvos() {
      // Get last 100 messages involving this user, most recent first
      const { data, error } = await supabase
        .from('dev_messages')
        .select('id, sender_id, recipient_id, content, created_at')
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !data) {
        setSidebarConvos([]);
        setLoadingConvos(false);
        return;
      }

      // Group by the chat partner (each DM per person, not per conversation)
      const partnerMap: { [otherUserId: string]: LastMessage } = {};
      data.forEach((msg: LastMessage) => {
        const otherId = msg.sender_id === currentUserId ? msg.recipient_id : msg.sender_id;
        if (!partnerMap[otherId]) partnerMap[otherId] = msg;
      });

      const partnerIds = Object.keys(partnerMap);
      if (partnerIds.length === 0) {
        setSidebarConvos([]);
        setLoadingConvos(false);
        return;
      }

      // Fetch sidebar user profiles
      const { data: usersData } = await supabase
        .from("dev_profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", partnerIds);

      const results: SidebarConvo[] = partnerIds.map((id) => ({
        user: usersData?.find((u: UserProfile) => u.id === id) || { id },
        lastMessage: partnerMap[id],
      }));

      setSidebarConvos(results);
      setLoadingConvos(false);
    }
    fetchSidebarConvos();
  }, [currentUserId]);

  // Gradient helper (optional, for pretty profile cards)
  const darkenColor = (rgbArr: number[], amount = 0.15): number[] =>
    rgbArr.map((c: number) => Math.max(0, Math.floor(c * (1 - amount))));
  const extractColors = () => {
    // @ts-ignore
    const ColorThief = window.ColorThief || (globalThis as any).ColorThief;
    const colorThief = new ColorThief();
    const img = imgRef.current;
    if (img && img.complete) {
      try {
        const dominant = colorThief.getColor(img);
        const rgb1 = `rgb(${dominant.join(",")})`;
        const darker = darkenColor(dominant, 0.15);
        const rgb2 = `rgb(${darker.join(",")})`;
        setGradient(`linear-gradient(to right, ${rgb1}, ${rgb2})`);
      } catch (e) {
        setGradient("linear-gradient(to right, #fbe6b2, #f6b47b)");
      }
    }
  };

  // Helper for initials fallback
  const getInitials = (name: string = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <>
      <Navbar>
        <NavBody>
          <div className="flex items-center w-full">
            <div className="flex items-center gap-6 min-w-0">
              <NavbarLogo />
            </div>
            <div className="flex-grow" />
            <NavItems items={navItems} className="static flex justify-end flex-1 space-x-2" />
            <MessageBadge />
            <NotificationBadge />
            {currentUserProfile && (
              <Link href={`/profile/${currentUserProfile.username}`} className="ml-4">
                <Image
                  src={currentUserProfile.avatar_url || "/empty-pic.webp"}
                  alt="Profile"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border border-gray-300 cursor-pointer"
                />
              </Link>
            )}
          </div>
        </NavBody>
      </Navbar>
      <div className="flex h-[80vh] max-w-6xl mx-auto mt-10">
        {/* (Optional) Current user profile card at left, use if you wish */}
        {/* <div className="w-80 flex flex-col items-center justify-start bg-transparent mr-4"> ... </div> */}
        <div className="flex flex-1 h-full border border-[var(--sidebar-border)] rounded-xl overflow-hidden shadow-lg bg-[var(--card)]">
          {/* SIDEBAR: Chat List */}
          <div className="w-72 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] flex flex-col">
            <h3 className="px-6 py-4 text-lg font-semibold text-[var(--sidebar-foreground)] border-b border-[var(--sidebar-border)]">Chat</h3>
            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : sidebarConvos.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No conversations yet.</div>
              ) : (
                sidebarConvos.map(({ user, lastMessage }) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 ${selectedUser?.id === user.id ? "bg-gray-200" : ""
                      }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    {/* Avatar */}
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.full_name || user.username || "User"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover border border-[var(--sidebar-border)]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold border border-[var(--sidebar-border)]">
                        {getInitials(user.full_name || user.username || "")}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="font-medium truncate">{user.full_name || user.username || "User"}</div>
                      <div className="text-xs text-gray-500 truncate">{lastMessage.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Placeholder chat area: will fill this in next step */}
          <div className="flex-1 flex flex-col bg-[var(--card)]">
  {!selectedUser ? (
    <div className="flex flex-col items-center justify-center mt-50 h-full">
      <img
        src="/transparent-black.png"
        alt="ResDex Logo"
        className="w-24 h-24 mb-6 opacity-20 grayscale"
      />
      <div className="text-center text-gray-400 ml-20 mr-20">
        Select a conversation to get started!
      </div>
    </div>
  ) : (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        {selectedUser.avatar_url ? (
          <Image
            src={selectedUser.avatar_url}
            alt={selectedUser.full_name || selectedUser.username || "User"}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold border border-[var(--sidebar-border)]">
            {(selectedUser.full_name || selectedUser.username || "U")[0]}
          </div>
        )}
        <span className="text-lg font-semibold">{selectedUser.full_name || selectedUser.username}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6" style={{ background: "#fafbfc" }}>
  {loadingMessages ? (
    <div className="text-gray-400 text-center py-12">Loading messages…</div>
  ) : messages.length === 0 ? (
    <div className="text-gray-400 text-center py-12">No messages yet.</div>
  ) : (
    messages.map((msg) => {
      const isMe = msg.sender_id === currentUserId;
      return (
        <div
          key={msg.id}
          className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3 group items-end`}
        >
          {/* Timestamp on hover (left for sender, right for receiver) */}
          {isMe ? (
            <>
              <span className="hidden group-hover:inline text-xs text-gray-400 mb-3 mr-2">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <div className="max-w-[70%] px-4 py-2 rounded-2xl shadow text-base bg-gray-800 text-white">
                {msg.content}
              </div>
            </>
          ) : (
            <>
              <div className="max-w-[70%] px-4 py-2 rounded-2xl shadow text-base bg-gray-200 text-black">
                {msg.content}
              </div>
              <span className="hidden group-hover:inline text-xs mb-3 text-gray-400 ml-2">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </>
          )}
        </div>
      );
    })
  )}
</div>

      {/* Message composer input comes in next step */}
    </div>
  )}
</div>

        </div>
      </div>
    </>
  );
}
