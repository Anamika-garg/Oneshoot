import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const ProfileOverview = ({ user, onAvatarChange }) => {
  const [currentUser, setCurrentUser] = useState(user);
  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAvatarUrl = async (userMetadata) => {
    const avatarData = userMetadata.avatar_url;

    // Determine if avatar_url is a string or an object
    let avatarPath = "";
    if (typeof avatarData === "string") {
      avatarPath = avatarData;
    } else if (avatarData && typeof avatarData === "object" && avatarData.path) {
      avatarPath = avatarData.path;
    }

    if (!avatarPath) {
      setAvatarUrl("/default-avatar.png");
      setIsLoading(false);
      return;
    }

    // Generate the public URL for the avatar
    const { data, error } = supabase.storage
      .from("avatars") // Replace with your storage bucket name
      .getPublicUrl(avatarPath);

    if (error) {
      console.error("Error fetching public URL:", error);
      setAvatarUrl("/default-avatar.png");
    } else {
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    setCurrentUser(user);
    setIsLoading(true);
    fetchAvatarUrl(user.user_metadata);
  }, [user]);

  const handleAvatarChange = async () => {
    try {
      // Refresh the session to ensure the latest user data
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Error refreshing session:", refreshError);
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching updated user:", error);
        return;
      }

      const updatedUser = data.user;
      setCurrentUser(updatedUser);
      await fetchAvatarUrl(updatedUser.user_metadata);

      if (onAvatarChange && typeof onAvatarChange === "function") {
        onAvatarChange();
      }
    } catch (error) {
      console.error("Error in handleAvatarChange:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Image
                src={avatarUrl}
                alt="User Avatar"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
              <AvatarUpload
                userId={currentUser.id}
                onAvatarChange={handleAvatarChange}
              />
            </div>
            <div>
              <h3 className="text-gray-400 mb-1">Username</h3>
              <p className="text-xl text-white">
                {currentUser.user_metadata.full_name || "Not set"}
              </p>
            </div>
            <div>
              <h3 className="text-gray-400 mb-1">Joined</h3>
              <p className="text-xl text-white">
                {new Date(currentUser.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-400 mb-1">Email</h3>
              <p className="text-xl text-white">{currentUser.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-1 md:col-span-2 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Latest Orders</h2>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="text-gray-400">There are no orders</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

ProfileOverview.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    user_metadata: PropTypes.shape({
      avatar_url: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          path: PropTypes.string,
        }),
      ]),
      full_name: PropTypes.string,
    }).isRequired,
  }).isRequired,
  onAvatarChange: PropTypes.func,
};

ProfileOverview.defaultProps = {
  onAvatarChange: () => {},
};

export default ProfileOverview;