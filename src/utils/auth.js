export const auth = {
  signUp: async (email, password, name) => {
    // Check if the email is already registered
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") { // PGRST116: No rows found
      throw fetchError;
    }

    if (existingUser) {
      throw new Error("This email is already registered. Please try signing in instead.");
    }

    // Attempt to sign up the user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: name },
      },
    });

    if (signUpError) {
      throw signUpError; // Throw the actual Supabase error
    }

    try {
      await users.captureUserDetails(data.user);
    } catch (profileError) {
      // Implement server-side user deletion if necessary
      await deleteUserServerSide(data.user.id); // Ensure this function is correctly implemented
      throw profileError;
    }

    return data;
  },
  logIn: async () => {},
  logOut: async () => {},
}