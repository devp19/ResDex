"use client";
import React from "react";
import Avatar from "./Avatar";
import type { WithRunFlags } from "@/lib/chat/runs";

export default function ChatBubble({ msg, showMineAvatar = false }: {
  msg: WithRunFlags;
  /** set true if you also want your own avatar on your run end */
  showMineAvatar?: boolean;
}) {
  const isMine = msg.isMine;

  const wrap = isMine ? "justify-end" : "justify-start";
  const bubble = isMine
    ? "bg-[#2a2a2a] text-white"
    : "bg-gray-200 text-black";

  // Slightly different rounding so grouped runs look connected
  const radius = isMine
    ? [
        "rounded-2xl",
        msg.isRunStart ? "rounded-tr-md" : "rounded-tr-sm",
        msg.isRunEnd   ? "rounded-br-2xl" : "rounded-br-md",
        "rounded-tl-2xl",
      ].join(" ")
    : [
        "rounded-2xl",
        msg.isRunStart ? "rounded-tl-md" : "rounded-tl-sm",
        msg.isRunEnd   ? "rounded-bl-2xl" : "rounded-bl-md",
        "rounded-tr-2xl",
      ].join(" ");

  const shouldShowAvatar = msg.isRunEnd && (!isMine || showMineAvatar);

  return (
    <div className={`relative flex ${wrap}`}>
      {/* bubble */}
      <div className={`relative max-w-[75%] px-3 py-2 ${bubble} ${radius} ${!isMine ? 'ml-6' : ''}`}>
        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

        {/* Avatar appears only on the LAST message of a run */}
        {shouldShowAvatar && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${
              isMine ? "-right-8" : "-left-8"
            }`}
            aria-hidden
          >
            <Avatar src={msg.user.avatarUrl} alt={msg.user.name} size={30} />
          </div>
        )}
      </div>
    </div>
  );
}
