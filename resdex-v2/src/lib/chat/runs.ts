export type ChatUser = { id: string; name: string; avatarUrl?: string | null };
export type ChatMessage = {
  id: string;
  userId: string;
  text: string;
  createdAt: string; // ISO
  user: ChatUser;
};

export type WithRunFlags = ChatMessage & {
  isMine: boolean;
  isRunStart: boolean;
  isRunEnd: boolean;
};

/**
 * Annotate messages with run boundaries based ONLY on consecutive same-sender.
 * No time gap logic. A "run" ends when the NEXT message is from a different sender.
 */
export function annotateRuns(
  messages: ChatMessage[],
  currentUserId: string
): WithRunFlags[] {
  return messages.map((m, i, arr) => {
    const prev = arr[i - 1];
    const next = arr[i + 1];

    const prevSame = !!prev && prev.userId === m.userId;
    const nextSame = !!next && next.userId === m.userId;

    return {
      ...m,
      isMine: m.userId === currentUserId,
      isRunStart: !prevSame,
      isRunEnd: !nextSame,
    };
  });
}
