import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";
import { Bucket } from "encore.dev/storage/objects";

const profileImagesBucket = new Bucket("profile-images", {
  public: true,
});

export interface UploadProfileImageRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface UploadProfileImageResponse {
  uploadUrl: string;
  imageUrl: string;
}

// Generates a signed upload URL for profile image
export const uploadProfileImage = api<UploadProfileImageRequest, UploadProfileImageResponse>(
  { auth: true, expose: true, method: "POST", path: "/user/upload-profile-image" },
  async (req) => {
    const auth = getAuthData()!;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(req.fileType)) {
      throw APIError.invalidArgument("Only JPEG, JPG, and PNG files are allowed");
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (req.fileSize > maxSize) {
      throw APIError.invalidArgument("File size must be less than 5MB");
    }

    // Generate unique filename
    const fileExtension = req.fileName.split('.').pop();
    const uniqueFileName = `${auth.userID}-${Date.now()}.${fileExtension}`;

    try {
      // Generate signed upload URL
      const { url: uploadUrl } = await profileImagesBucket.signedUploadUrl(uniqueFileName, {
        ttl: 3600, // 1 hour
      });

      // Generate public URL for the image
      const imageUrl = profileImagesBucket.publicUrl(uniqueFileName);

      return {
        uploadUrl,
        imageUrl,
      };
    } catch (error) {
      throw APIError.internal("Failed to generate upload URL");
    }
  }
);
