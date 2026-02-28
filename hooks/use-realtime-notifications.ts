"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

export function useRealtimeNotifications() {
  const { data: session } = useSession();
  const incrementUnread = useAppStore((s) => s.incrementUnread);

  const onMessage = useCallback(
    (message: any) => {
      const data = message.data;
      if (data?.title) {
        toast.info(data.title, { description: data.body });
      }
      incrementUnread();
    },
    [incrementUnread]
  );

  // Disabled for now - Ably hooks require ChannelProvider which has SSR issues
  // Will be re-enabled once Ably provider is properly configured
  // useAblyChannel({
  //   channelName: `user:${session?.user?.id || "none"}`,
  //   eventName: "notification",
  //   onMessage,
  //   enabled: !!session?.user?.id,
  // });
}
