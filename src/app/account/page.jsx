import ProtectedComponent from "@/components/ProtectedRoute";
import AccountForm from "./profile";
import { createClient } from "@/utils/supabase/server";

export default async function Account() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ProtectedComponent>
      <AccountForm user={user} />;
    </ProtectedComponent>
  );
}
