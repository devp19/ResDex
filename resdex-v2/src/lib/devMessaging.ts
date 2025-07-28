// lib/devMessaging.ts
import { supabase } from './supabaseClient'; // <- uses your createClientComponentClient()

// SEND a message
export async function sendDevMessage({ senderId, recipientId, content, conversationId }: {
  senderId: string;
  recipientId: string;
  content: string;
  conversationId: string;
}) {
  const { data, error } = await supabase
    .from('dev_messages')
    .insert([{ sender_id: senderId, recipient_id: recipientId, content, conversation_id: conversationId }]);
  if (error) throw error;
  return data;
}

// FETCH previous messages for a chat
export async function fetchDevMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('dev_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

// SUBSCRIBE to new messages for a chat
export function subscribeToDevMessages(conversationId: string, onMessage: (msg: any) => void) {
  return supabase
    .channel('dev_messages_realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'dev_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onMessage(payload.new)
    )
    .subscribe();
}
