"use server";

import { createClient } from "@/lib/supabase/server";
import { UserProfile } from "@/src/app/profile/page";

/**
 * Fetches the current user's profile from the database.
 *
 * @returns {Profile | null} The current user's profile, or null if the user is not logged in or if there is an error fetching the profile.
 */
export async function updateUserProfile(profileData: UserProfile) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { error } = await supabase
    .from("users")
    .update({
      full_name: profileData.full_name,
      username: profileData.username,
      bio: profileData.bio,
      gender: profileData.gender,
      birthdate: profileData.birthdate,
      avatar_url: profileData.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
