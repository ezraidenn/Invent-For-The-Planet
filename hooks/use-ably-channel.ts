"use client";

import { useEffect, useCallback } from "react";
import { useChannel } from "ably/react";
import type { Message } from "ably";

interface UseAblyChannelOptions {
  channelName: string;
  eventName?: string;
  onMessage: (message: Message) => void;
  enabled?: boolean;
}

export function useAblyChannel({
  channelName,
  eventName,
  onMessage,
  enabled = true,
}: UseAblyChannelOptions) {
  const callback = useCallback(
    (message: Message) => {
      onMessage(message);
    },
    [onMessage]
  );

  const { channel } = useChannel(
    { channelName, skip: !enabled },
    eventName ?? channelName,
    callback
  );

  return { channel };
}
