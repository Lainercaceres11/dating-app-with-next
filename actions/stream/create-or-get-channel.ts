"use server";

import { createClient } from "@/lib/supabase/server";
import { StreamChat } from "stream-chat";

export async function createOrGetChannel(otherUserId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
    )
    .eq("is_active", true)
    .single();

  if (matchError || !matches) {
    throw new Error("Users are not matched. Cannot create chat channel.");
  }

  const sortedIds = [user.id, otherUserId].sort();
  const combinedIds = sortedIds.join("_");

  let hash = 0;
  for (let i = 0; i < combinedIds.length; i++) {
    const char = combinedIds.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const channelId = `match_${Math.abs(hash).toString(36)}`;

  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );

  const { data: otherUserData, error: otherUserError } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", otherUserId)
    .single();

  if (otherUserError) {
    console.error("Error fetching user data:", otherUserError);
    throw new Error("Failed to fetch user data");
  }

  const channel = serverClient.channel("messaging", channelId, {
    members: [user.id, otherUserId],
    created_by_id: user.id,
  });

  await serverClient.upsertUser({
    id: otherUserId,
    name: otherUserData.full_name,
    image: otherUserData.avatar_url || undefined,
  });

  try {
    await channel.create();
    console.log("Channel created successfully:", channelId);
  } catch (error) {
    console.log("Channel creation error:", error);

    if (error instanceof Error && !error.message.includes("already exists")) {
      throw error;
    }
  }

  return {
    channelType: "messaging",
    channelId,
  };
}
