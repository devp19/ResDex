"use client";
import { useEffect, useState } from "react";
import {
  createConversation,
  sendMessage,
  listenToMessages,
  getCurrentUserId,
  listenToConversationUpdates,
} from "@/lib/chatService";
import { supabase } from "@/lib/supabaseClient";
import type { Message } from "@/lib/chatService";
import Image from "next/image";

export type User = { id: string; name: string; avatar_url?: string; lastMessage?: string };

export default function MessagesPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    getCurrentUserId().then((id) => {
      if (id) setCurrentUserId(id);
    });
  }, []);

  useEffect(() => {
    if (!selectedUser || !currentUserId) return;
    let unsubscribeMessages: (() => void) | undefined;

    const setupChat = async () => {
      const convoId = await createConversation(currentUserId, selectedUser.id);
      setConversationId(convoId);
      unsubscribeMessages = listenToMessages(convoId, async (msgs) => {
        setMessages(msgs);
        await loadRecentConversations();
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
    if (!currentUserId) return;
    const unsubscribe = listenToConversationUpdates(currentUserId, () => {
      loadRecentConversations();
    });
    return () => unsubscribe?.();
  }, [currentUserId]);

  const loadRecentConversations = async () => {
    const currentId = await getCurrentUserId();
    if (!currentId) return;
    const { data, error } = await supabase.rpc("get_user_conversations", {
      user_id: currentId,
    });
    if (error) return console.error("Error loading convos", error.message);
    const formatted = data.map((u: any) => ({
      id: u.other_user_id,
      name: u.other_username,
      avatar_url: u.other_avatar_url,
      lastMessage: u.last_message,
    }));
    setUsers(formatted);
    setLoadingUsers(false);
  };

  const searchUsers = async (term: string) => {
    setLoadingUsers(true);
    const currentId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${term}%`)
      .neq("id", currentId)
      .limit(10);
    if (error) return console.error("Search error", error);
    const formatted = data.map((u: any) => ({
      id: u.id,
      name: u.username,
      avatar_url: u.avatar_url,
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
          ) : users.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No users found.</div>
          ) : (
            users.map((user) => (
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
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--sidebar-foreground)] truncate">{user.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[160px]">
                    {user.lastMessage ? user.lastMessage : search === "" ? (
                      <span className="italic text-gray-400">No messages yet</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-[var(--card)]">
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedUser ? (
            messages.length > 0 ? (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex mb-3 ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                    msg.senderId === currentUserId
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--foreground)]"
                  }`}>
                    <span className="block text-sm font-semibold mb-1">
                      {msg.senderId === currentUserId ? "You" : selectedUser.name}
                    </span>
                    <span className="break-words">{msg.content}</span>
                  </div>
                </div>
              ))
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
              className="ml-3 px-6 py-2 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-sm hover:bg-[var(--sidebar-primary)] transition-colors"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
