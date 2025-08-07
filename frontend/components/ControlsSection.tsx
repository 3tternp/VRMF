import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useBackend } from '../hooks/useBackend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { CreateControlDialog } from './CreateControlDialog';

interface ControlsSectionProps {
  riskId: number;
}

export function ControlsSection({ riskId }: ControlsSectionProps) {
  const { user } = useAuth();
  const backend = useBackend();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: controlsData, isLoading, refetch } = useQuery({
    queryKey: ['controls', riskId],
    queryFn: () => backend.control.list({ risk_id: riskId }),
  });

  const canCreateControl = user?.role === 'admin' || user?.role === 'risk_officer';

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-orange-100 text-orange-800';
      case 'not_effective':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_implemented':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Risk Controls</CardTitle>
            <CardDescription>
              Controls implemented to mitigate this risk
            </CardDescription>
          </div>
          {canCreateControl && (
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Control
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : controlsData?.controls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No controls have been added for this risk yet.
          </div>
        ) : (
          <div className="space-y-4">
            {controlsData?.controls.map((control) => (
              <div key={control.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{control.control_name}</h4>
                  <div className="flex space-x-2">
                    <Badge className={getEffectivenessColor(control.effectiveness)}>
                      {control.effectiveness.replace('_', ' ')}
                    </Badge>
                    <Badge className={getStatusColor(control.implementation_status)}>
                      {control.implementation_status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                {control.control_description && (
                  <p className="text-sm text-gray-600">{control.control_description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="capitalize">Type: {control.control_type}</span>
                  <span>•</span>
                  <span>Created: {new Date(control.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CreateControlDialog
        riskId={riskId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          refetch();
          setShowCreateDialog(false);
        }}
      />
    </Card>
  );
}
