import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';

export function ProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  const backend = useBackend();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => user ? backend.users.get({ id: user.id }) : null,
    enabled: !!user,
    onSuccess: (data) => {
      if (data) {
        setFirstName(data.firstName);
        setLastName(data.lastName);
      }
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string }) =>
      backend.users.update({ id: user!.id, ...data }),
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      refetch();
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: (data: { fileName: string; fileData: string }) =>
      backend.storage.uploadProfilePicture(data),
    onSuccess: () => {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
      refetch();
    },
    onError: (error: any) => {
      console.error('Upload profile picture error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ firstName, lastName });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PNG, JPG, and JPEG files are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix
      
      uploadProfilePictureMutation.mutate({
        fileName: file.name,
        fileData: base64Data,
      });
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'iso_officer':
        return 'ISO Officer';
      case 'auditor':
        return 'Auditor';
      default:
        return role;
    }
  };

  if (isLoading || !profile) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.profilePictureUrl} />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.firstName, profile.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <input
                type="file"
                id="profile-picture"
                accept=".png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('profile-picture')?.click()}
                disabled={uploadProfilePictureMutation.isLoading}
              >
                <Camera className="mr-2 h-4 w-4" />
                {uploadProfilePictureMutation.isLoading ? 'Uploading...' : 'Change Picture'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, JPEG up to 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={getRoleDisplayName(profile.role)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChangePassword(true)}
                >
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </div>
  );
}
