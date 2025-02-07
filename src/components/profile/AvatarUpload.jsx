"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

const AvatarUpload = ({ userId, onAvatarChange }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: userData, error: updateError } =
        await supabase.auth.updateUser({
          data: { avatar_url: filePath },
        });

      if (updateError) {
        throw updateError;
      }
      const { data, error: signedUrlError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

      if (signedUrlError) {
        throw signedUrlError;
      }

      if (data) {
        onAvatarChange(data.signedUrl);
        toast.success("Avatar updated successfully");
      } else {
        throw new Error("Failed to get signed URL");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(
        `Failed to upload avatar: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        style={{ display: "none" }}
        type='file'
        id='avatar-upload'
        accept='image/*'
        onChange={uploadAvatar}
        disabled={uploading}
      />
      <Button
        variant='outline'
        disabled={uploading}
        onClick={handleButtonClick}
        className='bg-orange hover:bg-yellow text-black font-semibold w-full border-0'
      >
        {uploading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Uploading...
          </>
        ) : (
          "Upload New Avatar"
        )}
      </Button>
    </div>
  );
};

export default AvatarUpload;
