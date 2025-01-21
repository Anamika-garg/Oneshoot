import { createClient } from "./supabase/client";

const supabase = createClient();

export const users = {
  async getUser(id) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createUser(user) {
    const { data, error } = await supabase
      .from("users")
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async captureUserDetails(authUser) {
    // Check if user already exists
    const existingUser = await this.getUser(authUser.id).catch(() => null);
    if (existingUser) return existingUser;

    // Extract provider
    const provider = authUser.app_metadata?.provider || "email";

    // Create new user
    const newUser = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.email.split("@")[0],
      avatar: authUser.user_metadata?.avatar_url || "",
      description: "",
      provider,
      links: [],
    };

    return await this.createUser(newUser);
  },

  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId, updates) {
    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (error) throw error;

    // Update auth user metadata if avatar or name changed
    const metadata = {};

    if (updates.avatar !== undefined) {
      metadata.avatar_url = updates.avatar;
    }

    if (updates.name !== undefined) {
      metadata.full_name = updates.name;
    }

    if (Object.keys(metadata).length > 0) {
      const { error: authError } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (authError) {
        console.error("Failed to update auth user metadata:", authError);
      }
    }
  },
};
