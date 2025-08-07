import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Settings } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function SettingsPage() {
  const backend = useBackend();
  const { toast } = useToast();

  const { data: mfaSettings, isLoading, refetch } = useQuery({
    queryKey: ['mfa-settings'],
    queryFn: () => backend.users.getMfaSettings(),
  });

  const updateMfaMutation = useMutation({
    mutationFn: (enabled: boolean) => backend.users.updateMfaSettings({ enabled }),
    onSuccess: () => {
      toast({
        title: "MFA Settings Updated",
        description: "Multi-factor authentication settings have been updated.",
      });
      refetch();
    },
    onError: (error: any) => {
      console.error('Update MFA settings error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update MFA settings.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage system-wide settings and security preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>
              Configure security policies and authentication requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mfa-enabled">Multi-Factor Authentication</Label>
                <p className="text-sm text-gray-500">
                  Require MFA for all user logins
                </p>
              </div>
              <Switch
                id="mfa-enabled"
                checked={mfaSettings?.enabled || false}
                onCheckedChange={(checked) => updateMfaMutation.mutate(checked)}
                disabled={updateMfaMutation.isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <CardTitle>Password Policy</CardTitle>
            </div>
            <CardDescription>
              Current password requirements and policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Minimum 10 characters</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one lowercase letter</li>
                <li>• At least one number</li>
                <li>• At least one special character</li>
                <li>• Password expires every 90 days</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Frameworks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Supported Compliance Frameworks</CardTitle>
            <CardDescription>
              Risk management framework supports the following compliance standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'ISO 27001',
                'SOC2',
                'HIPAA',
                'PCI DSS',
                'COSO',
                'COBIT',
                'GDPR',
                'NIST RMF',
              ].map((framework) => (
                <div
                  key={framework}
                  className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <span className="text-sm font-medium text-blue-900">
                    {framework}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
