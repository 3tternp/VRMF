import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { userDB } from "./db";

export interface UpdateProfileImageRequest {
  imageUrl: string;
}

export interface UpdateProfileImageResponse {
  message: string;
  imageUrl: string;
}

// Updates the user's profile image URL after successful upload
export const updateProfileImage = api<UpdateProfileImageRequest, UpdateProfileImageResponse>(
  { auth: true, expose: true, method: "PUT", path: "/user/profile-image" },
  async (req) => {
    const auth = getAuthData()!;

    // Validate that the URL is from our bucket
    if (!req.imageUrl.includes('profile-images')) {
      throw APIError.invalidArgument("Invalid image URL");
    }

    try {
      await userDB.exec`
        UPDATE users 
        SET profile_image = ${req.imageUrl}, updated_at = NOW()
        WHERE id = ${auth.userID}
      `;

      return {
        message: "Profile image updated successfully",
        imageUrl: req.imageUrl,
      };
    } catch (error) {
      throw APIError.internal("Failed to update profile image");
    }
  }
);
