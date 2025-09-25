"use server";

import { createClient } from "@/lib/supabase/server";
import { StreamChat } from "stream-chat";

export async function getStreamUserToken() {
  const supasbase = await createClient();

  const {
    data: { user },
  } = await supasbase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data: userData, error: userError } = await supasbase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.log("Error getting user data: ", userError);
    throw new Error("Failed to get user data");
  }

  // Create a Stream user
  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );

  // Get tokent from Stream
  const token = await serverClient.createToken(user.id);

  // Upsert user in Stream
  await serverClient.upsertUser({
    id: user.id,
    name: userData.full_name,
    image: userData.avatar_url || undefined,
  });

  return {
    token,
    userId: user.id,
    userImage: userData.avatar_url || undefined,
    userName: userData.full_name,
  };
}
