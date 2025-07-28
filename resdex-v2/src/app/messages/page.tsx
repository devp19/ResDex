"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Navbar, NavBody, NavbarLogo, NavItems, MessageBadge, NotificationBadge } from "@/components/ui/navbar";
import Link from "next/link";
import { FaPaperPlane } from 'react-icons/fa';
import { FaLink } from "react-icons/fa";


// Types
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
  // Auth/profile state
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Sidebar state
  const [sidebarConvos, setSidebarConvos] = useState<SidebarConvo[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Message/chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageContent, setMessageContent] = useState("");


  const chatScrollBoxRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
  if (!searchTerm || !currentUserId) {
    setSearchResults([]);
    setSearchLoading(false);
    return;
  }
  setSearchLoading(true);

  // Search by full_name or username match (case-insensitive)
  supabase
    .from('dev_profiles')
    .select('id, full_name, username, avatar_url')
    .or(
      `full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
    )
    .neq('id', currentUserId)
    .limit(10)
    .then(({ data }) => {
      setSearchResults(data || []);
      setSearchLoading(false);
    });
}, [searchTerm, currentUserId]);


useEffect(() => {
  if (chatScrollBoxRef.current) {
    chatScrollBoxRef.current.scrollTop = chatScrollBoxRef.current.scrollHeight;
  }
}, [messages]);


  // Navbar navigation
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Network", link: "/network" },
    { name: "Jobs", link: "/jobs" },
  ];

  // Get current user and their profile
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: userData }) => {
      if (!userData?.user?.id) return;
      setCurrentUserId(userData.user.id);

      const { data: profile } = await supabase
        .from("dev_profiles")
        .select("id, full_name, username, avatar_url")
        .eq("id", userData.user.id)
        .single();
      if (profile) setCurrentUserProfile(profile);
    });
  }, []);

  // Sidebar: fetch conversation users + last messages
  useEffect(() => {
    if (!currentUserId) return;
    setLoadingConvos(true);

    async function fetchSidebarConvos() {
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

      // Map by partner id
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

  // Message fetching for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);

      if (!selectedUser || !currentUserId) {
        setLoadingMessages(false);
        return;
      }
      const ids = [currentUserId, selectedUser.id].sort();
      const conversationId = `${ids[0]}_${ids[1]}`;

      const { data } = await supabase
        .from('dev_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
      setLoadingMessages(false);
    };

    fetchMessages();
  }, [selectedUser, currentUserId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    const ids = [currentUserId, selectedUser.id].sort();
    const conversationId = `${ids[0]}_${ids[1]}`;

    const channel = supabase
      .channel('dev_messages_live_' + conversationId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dev_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          setMessages(prev =>
            prev.some(m => m.id === payload.new.id)
              ? prev
              : [...prev, payload.new]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, currentUserId]);

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
        <div className="flex flex-1 h-full border border-[var(--sidebar-border)] rounded-xl overflow-hidden shadow-lg bg-[var(--card)]">
          {/* SIDEBAR */}
          <div className="w-72 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] flex flex-col">
  <h3 className="px-6 pt-4 pb-2 text-lg font-semibold text-[var(--sidebar-foreground)] border-b border-[var(--sidebar-border)]">Chat</h3>
  {/* Search box */}
  <div className="px-6 pb-2 pt-2 bg-[var(--sidebar)] border-b border-[var(--sidebar-border)]">
    <input
      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-gray-50 focus:border-gray-400 focus:outline-none"
      type="text"
      placeholder="Search users…"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  </div>
  <div className="flex-1 overflow-y-auto">
    {/* If searching, show user results */}
    {searchTerm ? (
      searchLoading ? (
        <div className="text-center text-gray-400 py-8">Searching…</div>
      ) : searchResults.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No users found.</div>
      ) : (
        searchResults.map(user => (
          <div
            key={user.id}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 ${
              selectedUser?.id === user.id ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
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
              <div className="text-xs text-gray-500 truncate">Start conversation</div>
            </div>
          </div>
        ))
      )
    ) : loadingConvos ? (
      <div className="text-center text-gray-400 py-8">Loading...</div>
    ) : sidebarConvos.length === 0 ? (
      <div className="text-center text-gray-400 py-8">No conversations yet.</div>
    ) : (
      sidebarConvos.map(({ user, lastMessage }) => (
        <div
          key={user.id}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 ${
            selectedUser?.id === user.id ? "bg-gray-200" : ""
          }`}
          onClick={() => setSelectedUser(user)}
        >
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

          {/* CHAT PANEL */}
          <div className="flex-1 flex flex-col bg-[var(--card)] min-h-0">
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
    <div className="flex flex-col h-full min-h-0">
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
      {(selectedUser.full_name || "Loading...")[0]}
    </div>
  )}
  <div className="flex flex-col">
    <Link
  href={`/profile/${selectedUser.username}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex flex-col group cursor-pointer"
  style={{ textDecoration: "none" }}
>
  <span className="flex items-center">
    <span className="text-lg font-semibold">{selectedUser.full_name || selectedUser.username}</span>
    {/* Link icon on hover */}
    <FaLink
      size={14}
      className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    />
  </span>
  {selectedUser.username && (
    <span className="text-xs text-gray-400">@{selectedUser.username}</span>
  )}
</Link>

  </div>
  
</div>

      {/* Chat messages with proper scroll-to-bottom */}
      <div
        className="flex-1 overflow-y-auto p-6 min-h-0"
        style={{ background: "#fafbfc" }}
        ref={chatScrollBoxRef}
      >
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
                {isMe ? (
                  <>
                    <span className="hidden group-hover:inline text-xs text-gray-400 mb-3 mr-2">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div className="max-w-[70%] px-4 py-2 rounded-2xl shadow text-base bg-[#2a2a2a] gray-800 text-white">
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
        {/* End-of-messages anchor */}
        <div ref={messagesEndRef} />
      </div>
      {/* Composer */}
      {selectedUser && (
        <form
          className="flex gap-2 px-6 py-4 border-t border-gray-200 bg-white"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!messageContent.trim()) return;
            if (!currentUserId || !selectedUser) return;
            const ids = [currentUserId, selectedUser.id].sort();
            const conversationId = `${ids[0]}_${ids[1]}`;

            const { error } = await supabase.from('dev_messages').insert([
              {
                sender_id: currentUserId,
                recipient_id: selectedUser.id,
                content: messageContent,
                conversation_id: conversationId,
              },
            ]);
            if (!error) setMessageContent("");
          }}
          autoComplete="off"
        >
          <input
            className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Type a message…"
            value={messageContent}
            onChange={e => setMessageContent(e.target.value)}
            disabled={!currentUserId}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#2a2a2a] text-white rounded-full hover:bg-[#3a3a3a] hover:cursor-pointer transition"
            disabled={!messageContent.trim()}
          >
            <FaPaperPlane className="inline-flex ml-2 mr-2 mb-1" />
          </button>
        </form>
      )}
    </div>
  )}
</div>

        </div>
      </div>
    </>
  );
}
