import {
    collection,
    addDoc,
    doc,
    setDoc,
    getDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    updateDoc,
  } from "firebase/firestore";
  import { db } from "./firebaseConfig";
  import { supabase } from "./supabaseClient";
  
  export type Message = {
    senderId: string;
    content: string;
    timestamp: any;
  };
  
  type Conversation = {
    participants: string[];
    lastMessage: Message | null;
    createdAt: any;
  };
  
  export const getCurrentUserId = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  };
  
  export const createConversation = async (
    user1: string,
    user2: string
  ): Promise<string> => {
    const convoId = [user1, user2].sort().join("_");
    const convoRef = doc(db, "conversations", convoId);
    const existing = await getDoc(convoRef);
    if (!existing.exists()) {
      const conversation: Conversation = {
        participants: [user1, user2].sort(),
        lastMessage: null,
        createdAt: serverTimestamp(),
      };
      await setDoc(convoRef, conversation);
    }
    return convoId;
  };
  
  async function syncMessageMetadata(
    conversation_id: string,
    sender_id: string,
    recipient_id: string,
    message: string
  ) {
    const session = (await supabase.auth.getSession()).data.session;
    const accessToken = session?.access_token;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
    await fetch(
      "https://mhnughbveavfihztvfvb.supabase.co/functions/v1/sync-message-metadata",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(anonKey ? { apikey: anonKey } : {}),
        },
        body: JSON.stringify({
          conversation_id,
          sender_id,
          recipient_id,
          message,
        }),
      }
    );
  }
  
  export const sendMessage = async (
    conversationId: string,
    messageText: string,
    recipientId: string
  ) => {
    const senderId = await getCurrentUserId();
    if (!senderId) throw new Error("User not authenticated");
  
    const msg: Message = {
      senderId,
      content: messageText,
      timestamp: serverTimestamp(),
    };
  
    await addDoc(collection(db, `conversations/${conversationId}/messages`), msg);
  
    await setDoc(
      doc(db, "conversations", conversationId),
      {
        lastMessage: msg,
      },
      { merge: true }
    );
  
    await syncMessageMetadata(conversationId, senderId, recipientId, messageText);
  };
  
  export const listenToMessages = (
    conversationId: string,
    callback: (messages: Message[]) => void
  ) => {
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy("timestamp", "desc"),
      limit(50)
    );
  
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          content: data.content,
          timestamp: data.timestamp,
        };
      }) as Message[];
      callback(messages.reverse());
    });
  };
  
  export const listenToConversationUpdates = (
    userId: string,
    callback: () => void
  ) => {
    const q = query(
      collection(db, "conversations"),
      orderBy("lastMessage.timestamp", "desc"),
      limit(20)
    );
    return onSnapshot(q, () => callback());
  };
  
  export const updateTypingStatus = async (
    conversationId: string,
    userId: string,
    isTyping: boolean
  ) => {
    const convoRef = doc(db, "conversations", conversationId);
    await updateDoc(convoRef, {
      [`typing_${userId}`]: isTyping,
    });
  };
  
  export const listenToTyping = (
    conversationId: string,
    otherUserId: string,
    callback: (isTyping: boolean) => void
  ) => {
    const convoRef = doc(db, "conversations", conversationId);
    return onSnapshot(convoRef, (snap) => {
      const data = snap.data();
      callback(data?.[`typing_${otherUserId}`] || false);
    });
  };
 