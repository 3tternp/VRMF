import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { Bucket } from "encore.dev/storage/objects";
import { usersDB } from "../users/db";

const profilePictures = new Bucket("profile-pictures", { public: true });

interface UploadProfilePictureRequest {
  fileName: string;
  fileData: string; // base64 encoded
}

interface UploadProfilePictureResponse {
  url: string;
}

// Uploads a profile picture for the authenticated user.
export const uploadProfilePicture = api<UploadProfilePictureRequest, UploadProfilePictureResponse>(
  { auth: true, expose: true, method: "POST", path: "/storage/profile-picture" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Validate file type
    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExtension = req.fileName.toLowerCase().substring(req.fileName.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw APIError.invalidArgument("Only PNG, JPG, and JPEG files are allowed");
    }

    // Validate file size (max 5MB)
    const fileData = Buffer.from(req.fileData, 'base64');
    if (fileData.length > 5 * 1024 * 1024) {
      throw APIError.invalidArgument("File size must be less than 5MB");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${auth.userID}-${timestamp}${fileExtension}`;

    // Upload to bucket
    await profilePictures.upload(uniqueFileName, fileData, {
      contentType: `image/${fileExtension.substring(1)}`,
    });

    // Get public URL
    const url = profilePictures.publicUrl(uniqueFileName);

    // Update user's profile picture URL
    await usersDB.exec`
      UPDATE users 
      SET 
        profile_picture_url = ${url},
        updated_at = CURRENT_TIMESTAMP,
        updated_by = ${auth.userID}
      WHERE id = ${auth.userID}
    `;

    return { url };
  }
);
