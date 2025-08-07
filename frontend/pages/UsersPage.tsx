import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { UserTable } from '../components/UserTable';
import { CreateUserDialog } from '../components/CreateUserDialog';

export function UsersPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const backend = useBackend();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => backend.users.list(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <UserTable
        users={data?.users || []}
        onRefresh={refetch}
      />

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          refetch();
        }}
      />
    </div>
  );
}
