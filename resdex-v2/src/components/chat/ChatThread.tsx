"use client";
import React from "react";
import ChatBubble from "./ChatBubble";
import { annotateRuns, type ChatMessage } from "@/lib/chat/runs";

export default function ChatThread({
  messages,
  currentUserId,
}: {
  messages: ChatMessage[];
  currentUserId: string;
}) {
  const rows = annotateRuns(messages, currentUserId);
  return (
    <div className="space-y-1">
      {rows.map(m => (
        <ChatBubble key={m.id} msg={m} />
      ))}
    </div>
  );
}
