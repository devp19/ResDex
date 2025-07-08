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

export type User = { id: string; name: string; avatar_url?: string; lastMessage?: string; convoDoc?: any; lastMessageTimestamp?: any; username?: string };

export default function MessagesPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState<{ display_name: string; avatar_url: string } | null>(null);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [paginatedConvos, setPaginatedConvos] = useState<User[]>([]);

  useEffect(() => {
    getCurrentUserId().then((id) => {
      if (id) setCurrentUserId(id);
    });
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    // Fetch current user's profile (display_name, avatar_url)
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", currentUserId)
        .single();
      if (!error && data) {
        setCurrentUserProfile({
          display_name: data.display_name,
          avatar_url: data.avatar_url,
        });
      }
    })();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedUser || !currentUserId) return;
    let unsubscribeMessages: (() => void) | undefined;

    const setupChat = async () => {
      const convoId = await createConversation(currentUserId, selectedUser.id);
      setConversationId(convoId);
      unsubscribeMessages = listenToMessages(convoId, (msgs) => {
        setMessages(msgs);
        loadRecentConversations();
      });
    };
    setupChat();

    return () => {
      unsubscribeMessages?.();
    };
  }, [selectedUser, currentUserId]);

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
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex h-[80vh] max-w-4xl mx-auto mt-10 border border-[var(--sidebar-border)] rounded-xl overflow-hidden shadow-lg bg-[var(--card)]">
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
              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? "bg-[var(--sidebar-accent)]" : "hover:bg-[var(--muted)]"
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
                    <div className="font-medium text-[var(--sidebar-foreground)] truncate">{user.name}</div>
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
        {selectedUser && (
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
            <div className="text-center text-gray-400 mt-20">Select a user to start chatting.</div>
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
  );
}
