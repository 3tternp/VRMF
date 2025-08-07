import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Calendar, CheckCircle } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { RiskMonitoringItem } from '~backend/risks/types';

export function MonitoringPage() {
  const backend = useBackend();

  const { data: monitoring, isLoading } = useQuery({
    queryKey: ['risk-monitoring'],
    queryFn: () => backend.risks.getMonitoring(),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const getDaysText = (days: number) => {
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return 'Due today';
    } else {
      return `${days} days remaining`;
    }
  };

  const RiskMonitoringTable = ({ items, title, icon: Icon, emptyMessage }: {
    items: RiskMonitoringItem[];
    title: string;
    icon: any;
    emptyMessage: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <span>{title} ({items.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">SN</th>
                  <th className="text-left py-2">Asset</th>
                  <th className="text-left py-2">Threat</th>
                  <th className="text-left py-2">Risk Level</th>
                  <th className="text-left py-2">Treatment Status</th>
                  <th className="text-left py-2">Risk Owner</th>
                  <th className="text-left py-2">Assessment Date</th>
                  <th className="text-left py-2">Days</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{item.sn}</td>
                    <td className="py-2 max-w-xs truncate">{item.asset}</td>
                    <td className="py-2 max-w-xs truncate">{item.threat}</td>
                    <td className="py-2">
                      <Badge className={getRiskLevelColor(item.riskLevel)}>
                        {item.riskLevel}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Badge className={getTreatmentStatusColor(item.treatmentActionStatus)}>
                        {item.treatmentActionStatus}
                      </Badge>
                    </td>
                    <td className="py-2">{item.riskOwner}</td>
                    <td className="py-2">{formatDate(item.nextAssessmentDate)}</td>
                    <td className="py-2">
                      <span className={`text-sm ${item.daysUntilAssessment < 0 ? 'text-red-600 font-medium' : item.daysUntilAssessment <= 7 ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                        {getDaysText(item.daysUntilAssessment)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Monitoring</h1>
        <p className="text-gray-600">Track upcoming and overdue risk assessments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Assessments</p>
                <p className="text-3xl font-bold text-red-600">{monitoring?.totalOverdue || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Assessments</p>
                <p className="text-3xl font-bold text-amber-600">{monitoring?.totalUpcoming || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-50">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Monitored</p>
                <p className="text-3xl font-bold text-blue-600">
                  {(monitoring?.totalOverdue || 0) + (monitoring?.totalUpcoming || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Track</p>
                <p className="text-3xl font-bold text-green-600">
                  {monitoring?.upcomingAssessments.filter(item => item.daysUntilAssessment > 7).length || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Assessments */}
      <RiskMonitoringTable
        items={monitoring?.overdueAssessments || []}
        title="Overdue Assessments"
        icon={AlertTriangle}
        emptyMessage="No overdue assessments. Great job staying on track!"
      />

      {/* Upcoming Assessments */}
      <RiskMonitoringTable
        items={monitoring?.upcomingAssessments || []}
        title="Upcoming Assessments (Next 30 Days)"
        icon={Clock}
        emptyMessage="No upcoming assessments in the next 30 days."
      />
    </div>
  );
}
