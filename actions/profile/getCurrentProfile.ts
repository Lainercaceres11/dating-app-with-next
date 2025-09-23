"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Fetches the current user's profile from the database.
 *
 * @returns {Profile | null} The current user's profile, or null if the user is not logged in or if there is an error fetching the profile.
 */
export async function getCurrentUserProfile() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch the user's profile
  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return profile;
}
