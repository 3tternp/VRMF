import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingUp, Users, Shield } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RiskChart } from '../components/RiskChart';
import { ComplianceChart } from '../components/ComplianceChart';

export function DashboardPage() {
  const backend = useBackend();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => backend.risks.getDashboardStats(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const riskLevelCards = [
    {
      title: 'High Risk',
      value: stats?.highRisks || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Medium Risk',
      value: stats?.mediumRisks || 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Low Risk',
      value: stats?.lowRisks || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Risks',
      value: stats?.totalRisks || 0,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const treatmentCards = [
    {
      title: 'Completed',
      value: stats?.completedTreatments || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'In Progress',
      value: stats?.inProgressTreatments || 0,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Not Started',
      value: stats?.notStartedTreatments || 0,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your risk management framework</p>
      </div>

      {/* Risk Level Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {riskLevelCards.map((card) => (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Treatment Status */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Treatment Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {treatmentCards.map((card) => (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risks by Asset Group</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskChart data={stats?.risksByAssetGroup || {}} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Framework Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceChart data={stats?.risksByComplianceFramework || {}} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
