"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Uploads a profile image to the profile-photos bucket in Supabase.
 *
 * @param {File} file The file to be uploaded.
 * @returns {Promise<{success: boolean, message?: string, publicUrl?: string}>}
 * A promise that resolves to an object containing a success flag and optionally a message and public URL.
 */
export async function uploadProfilePhoto(file: File) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { succes: false, message: "User not found" };
  }

  const fileExtension = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExtension}`;

  const { error } = await supabase.storage
    .from("profile-photos")
    .upload(fileName, file, { cacheControl: "3600", upsert: true });

  if (error) {
    return { success: false, message: error.message };
  }

  const {
    data: { publicUrl },
  } = await supabase.storage.from("profile-photos").getPublicUrl(fileName);

  return { success: true, publicUrl };
}
