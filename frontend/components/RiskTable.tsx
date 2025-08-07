import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { Risk } from '~backend/risks/types';
import { EditRiskDialog } from './EditRiskDialog';
import { ViewRiskDialog } from './ViewRiskDialog';

interface RiskTableProps {
  risks: Risk[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function RiskTable({ risks, total, page, pageSize, onPageChange, onRefresh }: RiskTableProps) {
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  const backend = useBackend();
  const { user } = useAuth();
  const { toast } = useToast();

  const canEdit = user?.role === 'admin' || user?.role === 'iso_officer';
  const canDelete = user?.role === 'admin';

  const deleteRiskMutation = useMutation({
    mutationFn: (id: string) => backend.risks.deleteRisk({ id }),
    onSuccess: () => {
      toast({
        title: "Risk Deleted",
        description: "The risk has been deleted successfully.",
      });
      onRefresh();
    },
    onError: (error: any) => {
      console.error('Delete risk error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete risk.",
        variant: "destructive",
      });
    },
  });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTreatmentStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setShowEditDialog(true);
  };

  const handleView = (risk: Risk) => {
    setSelectedRisk(risk);
    setShowViewDialog(true);
  };

  const handleDelete = (risk: Risk) => {
    if (confirm(`Are you sure you want to delete risk SN ${risk.sn}?`)) {
      deleteRiskMutation.mutate(risk.id);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Risks ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SN</TableHead>
                  <TableHead>Asset Group</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Threat</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Treatment Status</TableHead>
                  <TableHead>Risk Owner</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-medium">{risk.sn}</TableCell>
                    <TableCell>{risk.assetGroup}</TableCell>
                    <TableCell className="max-w-xs truncate">{risk.asset}</TableCell>
                    <TableCell className="max-w-xs truncate">{risk.threat}</TableCell>
                    <TableCell>
                      <Badge className={getRiskLevelColor(risk.riskLevel)}>
                        {risk.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTreatmentStatusColor(risk.treatmentActionStatus)}>
                        {risk.treatmentActionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{risk.riskOwner}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {risk.complianceFrameworks.slice(0, 2).map((framework) => (
                          <Badge key={framework} variant="outline" className="text-xs">
                            {framework}
                          </Badge>
                        ))}
                        {risk.complianceFrameworks.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{risk.complianceFrameworks.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(risk)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(risk)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(risk)}
                            disabled={deleteRiskMutation.isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRisk && (
        <>
          <EditRiskDialog
            risk={selectedRisk}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onSuccess={() => {
              setShowEditDialog(false);
              setSelectedRisk(null);
              onRefresh();
            }}
          />
          <ViewRiskDialog
            risk={selectedRisk}
            open={showViewDialog}
            onOpenChange={setShowViewDialog}
          />
        </>
      )}
    </div>
  );
}
