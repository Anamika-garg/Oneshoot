import { useState } from "react";
import PropTypes from "prop-types";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const AvatarUpload = ({ userId, onAvatarChange }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicURL, error: urlError } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      if (urlError) {
        throw urlError;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicURL },
      });

      if (updateError) {
        throw updateError;
      }

      setMessage("Avatar updated successfully.");
      onAvatarChange(); // Trigger re-fetch of user data
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage("Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      document.getElementById("avatar-upload").click();
    }
  };

  return (
    <div>
      <label
        htmlFor='avatar-upload'
        className='cursor-pointer px-4 py-2 bg-blue-600 text-white rounded'
        aria-label='Upload Avatar'
        tabIndex='0'
        onKeyDown={handleKeyDown}
      >
        {uploading ? "Uploading..." : "Change Avatar"}
      </label>
      <input
        type='file'
        id='avatar-upload'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
        aria-label='Avatar Upload Input'
      />
      {message && (
        <p
          className={`mt-2 ${
            message.includes("successfully") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

AvatarUpload.propTypes = {
  userId: PropTypes.string.isRequired,
  onAvatarChange: PropTypes.func,
};

AvatarUpload.defaultProps = {
  onAvatarChange: () => {},
};

export default AvatarUpload;
