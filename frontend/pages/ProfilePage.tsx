import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { User, Shield, Key, AlertTriangle } from 'lucide-react';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';
import { MfaSetupDialog } from '../components/MfaSetupDialog';
import { ProfileImageUpload } from '../components/ProfileImageUpload';

export function ProfilePage() {
  const { user } = useAuth();
  const backend = useBackend();
  const { toast } = useToast();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
  });

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => backend.user.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => backend.user.updateProfile(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      refetch();
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const disableMfaMutation = useMutation({
    mutationFn: (password: string) => backend.user.disableMfa({ password }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'MFA disabled successfully',
      });
      refetch();
    },
    onError: (error: any) => {
      console.error('Disable MFA error:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable MFA. Please check your password.',
        variant: 'destructive',
      });
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleDisableMfa = () => {
    const password = prompt('Enter your password to disable MFA:');
    if (password) {
      disableMfaMutation.mutate(password);
    }
  };

  const handleImageUpdate = (imageUrl: string) => {
    refetch();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'risk_officer':
        return 'bg-blue-100 text-blue-800';
      case 'auditor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'risk_officer':
        return 'Risk Officer';
      case 'auditor':
        return 'Auditor';
      default:
        return role;
    }
  };

  const isPasswordExpired = profile?.password_expires_at && new Date() > new Date(profile.password_expires_at);
  const passwordExpiresIn = profile?.password_expires_at 
    ? Math.ceil((new Date(profile.password_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and security preferences
        </p>
      </div>

      {isPasswordExpired && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Password Expired</span>
            </div>
            <p className="text-red-700 mt-1">
              Your password has expired. Please change it immediately for security.
            </p>
            <Button 
              variant="destructive" 
              size="sm" 
              className="mt-3"
              onClick={() => setShowChangePassword(true)}
            >
              Change Password Now
            </Button>
          </CardContent>
        </Card>
      )}

      {passwordExpiresIn && passwordExpiresIn <= 7 && passwordExpiresIn > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Password Expiring Soon</span>
            </div>
            <p className="text-yellow-700 mt-1">
              Your password will expire in {passwordExpiresIn} day{passwordExpiresIn !== 1 ? 's' : ''}. 
              Consider changing it soon.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="mt-1 text-sm text-gray-900">{profile?.email}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Role</Label>
                    <div className="mt-1">
                      <Badge className={getRoleColor(profile?.role || '')}>
                        {getRoleDisplay(profile?.role || '')}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                    <div className="mt-1 text-sm text-gray-900">
                      {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Last Login</Label>
                    <div className="mt-1 text-sm text-gray-900">
                      {profile?.last_login ? formatDate(profile.last_login) : 'Never'}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name || profile?.name || ''}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <ProfileImageUpload
              currentImageUrl={profile?.profile_image}
              onImageUpdate={handleImageUpdate}
            />
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Password Security</span>
              </CardTitle>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-600">
                    {isPasswordExpired 
                      ? 'Your password has expired'
                      : passwordExpiresIn 
                        ? `Expires in ${passwordExpiresIn} days`
                        : 'Last changed recently'
                    }
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowChangePassword(true)}
                  className={isPasswordExpired ? 'border-red-300 text-red-700' : ''}
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Two-Factor Authentication</span>
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">MFA Status</h4>
                  <p className="text-sm text-gray-600">
                    {profile?.mfa_enabled 
                      ? 'Two-factor authentication is enabled'
                      : 'Two-factor authentication is disabled'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={profile?.mfa_enabled ? 'default' : 'secondary'}>
                    {profile?.mfa_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  {profile?.mfa_enabled ? (
                    <Button 
                      variant="outline" 
                      onClick={handleDisableMfa}
                      disabled={disableMfaMutation.isPending}
                    >
                      {disableMfaMutation.isPending ? 'Disabling...' : 'Disable'}
                    </Button>
                  ) : (
                    <Button onClick={() => setShowMfaSetup(true)}>
                      Enable MFA
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
        onSuccess={() => {
          refetch();
          setShowChangePassword(false);
        }}
      />

      <MfaSetupDialog
        open={showMfaSetup}
        onOpenChange={setShowMfaSetup}
        onSuccess={() => {
          refetch();
          setShowMfaSetup(false);
        }}
      />
    </div>
  );
}
