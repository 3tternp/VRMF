import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBackend } from '../hooks/useBackend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Upload, X } from 'lucide-react';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string) => void;
}

export function ProfileImageUpload({ currentImageUrl, onImageUpdate }: ProfileImageUploadProps) {
  const backend = useBackend();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      // Get signed upload URL
      const uploadResponse = await backend.user.uploadProfileImage({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // Upload file to the signed URL
      const uploadResult = await fetch(uploadResponse.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload file');
      }

      // Update profile with new image URL
      await backend.user.updateProfileImage({
        imageUrl: uploadResponse.imageUrl,
      });

      return uploadResponse.imageUrl;
    },
    onSuccess: (imageUrl) => {
      toast({
        title: 'Success',
        description: 'Profile image updated successfully',
      });
      onImageUpdate(imageUrl);
      setPreviewUrl(null);
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
      setPreviewUrl(null);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, JPG, and PNG files are allowed';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        title: 'Invalid File',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Start upload
    setIsUploading(true);
    uploadImageMutation.mutate(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>Profile Picture</span>
        </CardTitle>
        <CardDescription>
          Upload a profile picture. Only JPEG, JPG, and PNG files are allowed (max 5MB).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {displayImageUrl ? (
              <div className="relative">
                <img
                  src={displayImageUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                {previewUrl && (
                  <button
                    onClick={handleRemovePreview}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              variant="outline"
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {currentImageUrl ? 'Change Picture' : 'Upload Picture'}
                </>
              )}
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Supported formats: JPEG, JPG, PNG</p>
          <p>• Maximum file size: 5MB</p>
          <p>• Recommended size: 400x400 pixels</p>
        </div>
      </CardContent>
    </Card>
  );
}
