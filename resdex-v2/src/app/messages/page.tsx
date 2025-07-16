"use client";
import { useEffect, useState, useRef } from "react";
import {
  createConversation,
  sendMessage,
  listenToMessages,
  getCurrentUserId,
} from "@/lib/chatService";
import { supabase } from "@/lib/supabaseClient";
import type { Message } from "@/lib/chatService";
import Image from "next/image";
import { collection, query, where, orderBy, limit as fbLimit, startAfter, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { ArrowUp } from "lucide-react";
import { Navbar, NavBody, NavbarLogo, NavItems, NotificationBadge, MessageBadge } from "@/components/ui/navbar";
import { AvatarDropdown } from "@/components/ui/AvatarDropdown";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { QRCodeCanvas } from "qrcode.react";
// @ts-ignore
import ColorThief from "colorthief";
import { useSearchParams } from "next/navigation";

export type User = { id: string; name: string; avatar_url?: string; lastMessage?: string; convoDoc?: any; lastMessageTimestamp?: any; username?: string };

export default function MessagesPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState<{ display_name: string; avatar_url: string; username: string; bio?: string; organization?: string; location?: string } | null>(null);
  const [gradient, setGradient] = useState("linear-gradient(to right, #fbe6b2, #f6b47b)");
  const imgRef = useRef<HTMLImageElement>(null);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [paginatedConvos, setPaginatedConvos] = useState<User[]>([]);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<{ [convoId: string]: number }>({});

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    getCurrentUserId().then((id) => {
      if (id) setCurrentUserId(id);
    });
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    // Fetch current user's profile (display_name, avatar_url, username, bio, organization, location)
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, username, bio, organization, location")
        .eq("id", currentUserId)
        .single();
      if (!error && data) {
        setCurrentUserProfile({
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          username: data.username,
          bio: data.bio,
          organization: data.organization,
          location: data.location,
        });
      }
    })();
  }, [currentUserId]);

  // Dynamic gradient extraction from avatar
  const darkenColor = (rgbArr: number[], amount = 0.15): number[] => {
    return rgbArr.map((c: number) => Math.max(0, Math.floor(c * (1 - amount))));
  };
  const extractColors = () => {
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

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!selectedUser || !currentUserId) return;
    let unsubscribeMessages: (() => void) | undefined;

    const setupChat = async () => {
      const convoId = await createConversation(currentUserId, selectedUser.id);
      setConversationId(convoId);
      unsubscribeMessages = listenToMessages(convoId, async (msgs) => {
        setMessages(msgs);
        loadRecentConversations();

        // Update unread counts in real-time if a new message is received from the other user
        const latestMsg = msgs[msgs.length - 1];
        if (latestMsg && latestMsg.senderId !== currentUserId) {
          await refreshUnreadCounts();
        }
      });
    };
    setupChat();

    return () => {
      unsubscribeMessages?.();
    };
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    if (!selectedUser || !currentUserId || !conversationId) return;
    // Mark all message notifications for this conversation as read
    console.log('Marking notifications as read for:', {
      recipient_id: currentUserId,
      conversationId,
      selectedUserId: selectedUser.id
    });
    supabase
      .from('notifications')
      .update({ read: true, dismissed: true })
      .eq('recipient_id', currentUserId)
      .eq('related_resource_type', 'conversation')
      .eq('related_resource_id', conversationId)
      .eq('type', 'message')
      .eq('read', false)
      .then(({ error, data }) => {
        if (error) {
          console.error('Error marking notification as read:', error);
        } else {
          console.log('Notification(s) marked as read:', data);
        }
      });
  }, [selectedUser, currentUserId, conversationId]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim() === "") {
        loadRecentConversations();
      } else {
        searchUsers(search);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    loadRecentConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!currentUserId) return;
    setLoadingUsers(true);
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUserId),
      orderBy("lastMessage.timestamp", "desc"),
      fbLimit(20)
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convos = snapshot.docs.map((doc) => {
        const data = doc.data();
        const otherId = (data.participants || []).find((id: string) => id !== currentUserId);
        return {
          id: otherId,
          name: "",
          avatar_url: "",
          lastMessage: data.lastMessage?.content || "",
          lastMessageTimestamp: data.lastMessage?.timestamp || null,
          convoDoc: doc,
        };
      });
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.size === 20);
      const userIds = convos.map((c) => c.id);
      if (userIds.length) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", userIds);
        if (!error && data) {
          const userMap = Object.fromEntries(data.map((u: any) => [u.id, u]));
          setUsers(
            convos.map((c) => ({
              ...c,
              name: userMap[c.id]?.display_name || userMap[c.id]?.username || c.id,
              avatar_url: userMap[c.id]?.avatar_url || "",
              username: userMap[c.id]?.username || "",
            }))
          );
        } else {
          setUsers(convos);
        }
      } else {
        setUsers([]);
      }
      setPaginatedConvos([]);
      setLoadingUsers(false);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  const fetchMoreConversations = async () => {
    if (!currentUserId || !lastVisible) return;
    setLoadingUsers(true);
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUserId),
      orderBy("lastMessage.timestamp", "desc"),
      startAfter(lastVisible),
      fbLimit(20)
    );
    const snap = await getDocs(q);
    const convos = snap.docs.map((doc) => {
      const data = doc.data();
      const otherId = (data.participants || []).find((id: string) => id !== currentUserId);
      return {
        id: otherId,
        name: "",
        avatar_url: "",
        lastMessage: data.lastMessage?.content || "",
        lastMessageTimestamp: data.lastMessage?.timestamp || null,
        convoDoc: doc,
      };
    });
    setLastVisible(snap.docs[snap.docs.length - 1]);
    setHasMore(snap.size === 20);
    const userIds = convos.map((c) => c.id);
    if (userIds.length) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", userIds);
      if (!error && data) {
        const userMap = Object.fromEntries(data.map((u: any) => [u.id, u]));
        setPaginatedConvos((prev) => [
          ...prev,
          ...convos.map((c) => ({
            ...c,
            name: userMap[c.id]?.display_name || userMap[c.id]?.username || c.id,
            avatar_url: userMap[c.id]?.avatar_url || "",
            username: userMap[c.id]?.username || "",
          })),
        ]);
      } else {
        setPaginatedConvos((prev) => [...prev, ...convos]);
      }
    } else {
      setPaginatedConvos((prev) => [...prev, ...convos]);
    }
    setLoadingUsers(false);
  };

  const loadRecentConversations = async () => {
    const currentId = await getCurrentUserId();
    if (!currentId) return;
    const { data, error } = await supabase.rpc("get_user_conversations", {
      user_id: currentId,
    });
    if (error) return console.error("Error loading convos", error.message);
    // If edge function returns metadata array, use it
    let formatted = [];
    if (data && Array.isArray(data.metadata)) {
      formatted = data.metadata.map((u: any) => ({
        id: u.other_user_id,
        name: u.other_display_name,
        avatar_url: u.other_avatar_url,
        lastMessage: u.last_message,
        lastMessageTimestamp: u.last_updated,
        username: u.other_username || "",
      }));
    } else if (Array.isArray(data)) {
      // fallback for old RPC shape
      formatted = data.map((u: any) => ({
        id: u.other_user_id,
        name: u.other_display_name || u.other_username,
        avatar_url: u.other_avatar_url,
        lastMessage: u.last_message,
        lastMessageTimestamp: u.last_message_timestamp,
        username: u.other_username || "",
      }));
    }
    setUsers(formatted);
    setLoadingUsers(false);
  };

  const searchUsers = async (term: string) => {
    setLoadingUsers(true);
    const currentId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .ilike("username", `%${term}%`)
      .neq("id", currentId)
      .limit(10);
    if (error) return console.error("Search error", error);
    const formatted = data.map((u: any) => ({
      id: u.id,
      name: u.display_name || u.username,
      avatar_url: u.avatar_url,
      username: u.username || "",
    }));
    setUsers(formatted);
    setLoadingUsers(false);
  };

  const handleSend = async () => {
    if (!text.trim() || !conversationId || !selectedUser) return;
    await sendMessage(conversationId, text, selectedUser.id);
    setText("");
    await loadRecentConversations();
    await refreshUnreadCounts();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Refactored: Fetch unread message notification counts for each conversation
  const refreshUnreadCounts = async () => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('related_resource_id')
      .eq('recipient_id', currentUserId)
      .eq('related_resource_type', 'conversation')
      .eq('type', 'message')
      .eq('read', false)
      .eq('dismissed', false);
    if (!error && data) {
      const counts: { [convoId: string]: number } = {};
      data.forEach((row: any) => {
        if (row.related_resource_id) {
          counts[row.related_resource_id] = (counts[row.related_resource_id] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    } else {
      setUnreadCounts({});
    }
  };

  useEffect(() => {
    refreshUnreadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, users, paginatedConvos]);

  useEffect(() => {
    // Auto-select user if ?user=username is present
    const usernameParam = searchParams?.get("user");
    if (usernameParam && users.length > 0) {
      const found = users.find(u => u.username === usernameParam);
      if (found) {
        setSelectedUser(found);
      } else {
        // If not found, try to fetch user by username
        (async () => {
          const { data, error } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url")
            .eq("username", usernameParam)
            .single();
          if (!error && data) {
            setSelectedUser({
              id: data.id,
              name: data.display_name || data.username,
              avatar_url: data.avatar_url,
              username: data.username,
            });
          }
        })();
      }
    }
    // eslint-disable-next-line
  }, [searchParams, users]);

  // Sign out handler for AvatarDropdown
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Network", link: "/network" },
    { name: "Jobs", link: "/jobs" },
  ];

  return (
    <>
      <Navbar>
        <NavBody>
          <div className="flex items-center w-full">
            {/* Left group: Logo + Search */}
            <div className="flex items-center gap-6 min-w-0">
              <NavbarLogo />
              <div className="relative w-full max-w-xs">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="rounded-full bg-white/30 backdrop-blur-md border-none shadow-none focus-visible:ring-2 focus-visible:ring-blue-200 placeholder:text-gray-400 px-6 py-3 h-12 w-full text-base !outline-none pr-12"
                  style={{ boxShadow: "0 2px 16px 0 rgba(80, 72, 72, 0.04)", background: "rgba(255,255,255,0.35)" }}
                />
                {/* Optionally add a search icon here if desired */}
              </div>
            </div>
            {/* Spacer */}
            <div className="flex-grow" />
            {/* Nav items on the right */}
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
      {/* Main layout: profile card | chat sidebar | chat area */}
      <div className="flex h-[80vh] max-w-6xl mx-auto mt-10">
        {/* Profile card column */}
        {currentUserProfile && (
          <div className="w-80 flex flex-col items-center justify-start bg-transparent mr-4">
            <Card className="w-full max-w-xs rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white" style={{ minHeight: 420, height: '100%' }}>
              {/* Banner with dynamic gradient */}
              <div className="pl-4 pr-4">
                <div
                  className="w-full h-40 rounded-xl"
                  style={{ background: gradient }}
                />
              </div>
              {/* Avatar - overlapping banner */}
              <div className="relative w-full">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-10">
                  <img
                    ref={imgRef}
                    src={currentUserProfile.avatar_url || "/empty-pic.webp"}
                    alt="Profile Avatar"
                    className="w-24 h-24 rounded-full border-8 border-white object-cover bg-gray-300"
                    crossOrigin="anonymous"
                    onLoad={extractColors}
                  />
                </div>
                {/* Info Section - centered below avatar */}
                <div className="flex flex-col items-center w-full mt-6 pb-8">
                  <div className="text-2xl font-bold text-neutral-800 flex items-center">
                    {currentUserProfile.display_name}
                  </div>
                  {currentUserProfile.bio && (
                    <div className="text-sm text-gray-700 font-medium mt-2 text-center px-4">{currentUserProfile.bio}</div>
                  )}
                  {currentUserProfile.location && (
                    <div className="text-sm text-gray-400 mt-2">{currentUserProfile.location}</div>
                  )}
                  {currentUserProfile.organization && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="font-semibold text-gray-400">{currentUserProfile.organization}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
        {/* Chat sidebar and chat area container */}
        <div className="flex flex-1 h-full border border-[var(--sidebar-border)] rounded-xl overflow-hidden shadow-lg bg-[var(--card)]">
          <div className="w-72 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] flex flex-col">
            <h3 className="px-6 py-4 text-lg font-semibold text-[var(--sidebar-foreground)] border-b border-[var(--sidebar-border)]">Chat</h3>
            <div className="px-4 py-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full px-4 py-2 rounded-lg border border-[var(--input)] bg-[var(--muted)] text-[var(--sidebar-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-ring)]"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : users.length === 0 && paginatedConvos.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No users found.</div>
              ) : (
                [...users, ...paginatedConvos].map((user) => {
                  let lastMsgTime = "";
                  // Only use Firestore's lastMessageTimestamp for sidebar
                  let ts = user.lastMessageTimestamp;
                  if (ts) {
                    // Firestore Timestamp object or ISO string
                    const dateObj = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
                    lastMsgTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                  // Debug log only the timestamp
                  console.log('Sidebar lastMessageTimestamp:', ts, 'lastMsgTime:', lastMsgTime);
                  // Conversation ID is always [currentUserId, user.id] sorted and joined with _
                  const convoId = [currentUserId, user.id].sort().join("_");
                  const unread = unreadCounts[convoId] || 0;
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? "bg-[var(--sidebar-accent)]"
                          : unread > 0
                            ? "bg-gray-200"
                            : "hover:bg-[var(--muted)]"
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover border border-[var(--sidebar-border)]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold border border-[var(--sidebar-border)]">
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="font-medium text-[var(--sidebar-foreground)] truncate flex items-center gap-2">
                          {user.name}
                          {unread > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                              {unread}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[160px] flex items-center gap-2">
                          {user.lastMessage && <span className="truncate">{user.lastMessage}</span>}
                          {lastMsgTime && (
                            <span className="text-gray-400 ml-2 whitespace-nowrap">{lastMsgTime}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {hasMore && !loadingUsers && (
                <button
                  className="w-full py-2 text-sm text-blue-600 hover:underline bg-transparent"
                  onClick={fetchMoreConversations}
                >
                  Show more
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col bg-[var(--card)]">
            {/* Chat header with avatar and display name */}
            {selectedUser ? (
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--sidebar-border)] bg-[var(--card)] justify-between">
                  <div className="flex items-center gap-3">
                    {selectedUser.avatar_url ? (
                      <Image
                        src={selectedUser.avatar_url}
                        alt={selectedUser.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover border border-[var(--sidebar-border)]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold border border-[var(--sidebar-border)]">
                        {getInitials(selectedUser.name)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg text-[var(--foreground)]">{selectedUser.name}</span>
                      <span className="text-xs text-gray-400">@{selectedUser.username || selectedUser.id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-ring)]"
                    aria-label="Close chat"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-500">
                      <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mt-50">
                  <img
                    src="/transparent-black.png"
                    alt="ResDex Logo"
                    className="w-24 h-24 mb-6 opacity-20 grayscale"
                  />
                  <div className="text-center text-gray-400  ml-20 mr-20">Start a conversation! ResDex is a place to share your thoughts and ideas with others.</div>
                </div>
              )}
            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
              {selectedUser ? (
                messages.length > 0 ? (
                  // Group consecutive messages by sender
                  (() => {
                    const groups: Message[][] = [];
                    let currentGroup: Message[] = [];
                    let lastSender: string | null = null;
                    messages.forEach((msg, i) => {
                      if (msg.senderId !== lastSender) {
                        if (currentGroup.length > 0) groups.push(currentGroup);
                        currentGroup = [msg];
                        lastSender = msg.senderId;
                      } else {
                        currentGroup.push(msg);
                      }
                    });
                    if (currentGroup.length > 0) groups.push(currentGroup);
                    return groups.map((group, idx) => {
                      const isCurrentUser = group[0].senderId === currentUserId;
                      let avatarUrl = "";
                      let senderName = "";
                      if (isCurrentUser) {
                        avatarUrl = currentUserProfile?.avatar_url || "";
                        senderName = currentUserProfile?.display_name || "You";
                      } else if (selectedUser) {
                        avatarUrl = selectedUser.avatar_url || "";
                        senderName = selectedUser.name;
                      }
                      return (
                        <div
                          key={idx}
                          className={`flex items-end gap-2 mb-4 ${isCurrentUser ? " flex-row-reverse" : "justify-start flex-row"}`}
                        >
                          {/* Avatar for both sides, only for last in group */}
                          <div className="flex flex-col justify-end">
                            <div style={{ height: 24 * (group.length - 1) }} />
                            {avatarUrl ? (
                              <Image
                                src={avatarUrl}
                                alt={senderName}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">
                                {senderName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className={`flex flex-col gap-1 ${isCurrentUser ? "items-end" : "items-start"}`}>
                            {/* Sender name only at the top of group */}
                            <span className="text-xs text-gray-500 font-semibold mb-1 ml-1">{senderName}</span>
                            {group.map((msg, j) => {
                              // Format timestamp to show only time (e.g., 12:30 PM)
                              let timeString = "";
                              if (msg.timestamp) {
                                const dateObj = typeof msg.timestamp.toDate === "function"
                                  ? msg.timestamp.toDate()
                                  : new Date(msg.timestamp);
                                timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              }
                              return (
                                <div
                                  key={j}
                                  className={`group flex items-center max-w-[80%] sm:max-w-md md:max-w-lg px-0 mb-0.5 transition-all duration-200 ${
                                    isCurrentUser
                                      ? "flex-row self-end"
                                      : "flex-row self-start"
                                  }`}
                                >
                                  {/* Timestamp on hover, left for current user, right for other user */}
                                  {isCurrentUser && timeString && (
                                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap mr-2">
                                      {timeString}
                                    </span>
                                  )}
                                  <div
                                    className={`px-4 py-2 rounded-2xl shadow-sm transition-colors duration-200 break-words ${
                                      isCurrentUser
                                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] text-right"
                                        : "bg-[var(--muted)] text-[var(--foreground)] text-left"
                                    }`}
                                  >
                                    {msg.content}
                                  </div>
                                  {!isCurrentUser && timeString && (
                                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap ml-2">
                                      {timeString}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="text-center text-gray-400 mt-20">No messages yet.</div>
                )
              ) : (
                <div className="text-center text-gray-400 mt-20"></div>
              )}
            </div>
            {selectedUser && (
              <div className="flex items-center border-t border-[var(--sidebar-border)] p-4 bg-[var(--muted)]">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-full border border-[var(--input)] bg-white text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-ring)]"
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                />
                <button
                  onClick={handleSend}
                  className="ml-3 p-2 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-sm transition-colors flex items-center justify-center cursor-pointer hover:bg-[#444444]"
                  aria-label="Send message"
                  type="button"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
