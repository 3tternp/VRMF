import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RiskTable } from '../components/RiskTable';
import { CreateRiskDialog } from '../components/CreateRiskDialog';

export function RisksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [assetGroupFilter, setAssetGroupFilter] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState('');
  const [treatmentStatusFilter, setTreatmentStatusFilter] = useState('');
  const [complianceFrameworkFilter, setComplianceFrameworkFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const backend = useBackend();
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'risks',
      page,
      assetGroupFilter,
      riskLevelFilter,
      treatmentStatusFilter,
      complianceFrameworkFilter,
    ],
    queryFn: () =>
      backend.risks.list({
        limit: pageSize,
        offset: page * pageSize,
        assetGroup: assetGroupFilter || undefined,
        riskLevel: riskLevelFilter || undefined,
        treatmentStatus: treatmentStatusFilter || undefined,
        complianceFramework: complianceFrameworkFilter || undefined,
      }),
  });

  const canCreateRisk = user?.role === 'admin' || user?.role === 'iso_officer';

  const filteredRisks = data?.risks.filter(risk =>
    searchTerm === '' ||
    risk.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.threat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.vulnerability.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
          <p className="text-gray-600">Manage and monitor organizational risks</p>
        </div>
        {canCreateRisk && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Risk
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search risks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={assetGroupFilter} onValueChange={setAssetGroupFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Asset Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Asset Groups</SelectItem>
              <SelectItem value="Information">Information</SelectItem>
              <SelectItem value="Network">Network</SelectItem>
              <SelectItem value="Hardware">Hardware</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="Physical/Site">Physical/Site</SelectItem>
              <SelectItem value="People">People</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={treatmentStatusFilter} onValueChange={setTreatmentStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Treatment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={complianceFrameworkFilter} onValueChange={setComplianceFrameworkFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Compliance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frameworks</SelectItem>
              <SelectItem value="ISO 27001">ISO 27001</SelectItem>
              <SelectItem value="SOC2">SOC2</SelectItem>
              <SelectItem value="HIPAA">HIPAA</SelectItem>
              <SelectItem value="PCI DSS">PCI DSS</SelectItem>
              <SelectItem value="COSO">COSO</SelectItem>
              <SelectItem value="COBIT">COBIT</SelectItem>
              <SelectItem value="GDPR">GDPR</SelectItem>
              <SelectItem value="NIST RMF">NIST RMF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Risk Table */}
      <RiskTable
        risks={filteredRisks}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onRefresh={refetch}
      />

      <CreateRiskDialog
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
