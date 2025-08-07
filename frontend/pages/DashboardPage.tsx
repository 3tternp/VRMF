import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../hooks/useBackend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, TrendingUp, Activity } from 'lucide-react';
import { RiskHeatmap } from '../components/RiskHeatmap';
import { RiskChart } from '../components/RiskChart';

export function DashboardPage() {
  const backend = useBackend();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => backend.risk.dashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Risks',
      value: dashboardData?.total_risks || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'High Risk',
      value: dashboardData?.high_risk_count || 0,
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Medium Risk',
      value: dashboardData?.medium_risk_count || 0,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Low Risk',
      value: dashboardData?.low_risk_count || 0,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your organization's risk landscape
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Heatmap</CardTitle>
            <CardDescription>
              Visual representation of risk likelihood vs impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskHeatmap data={dashboardData?.risk_heatmap || []} />
          </CardContent>
        </Card>

        {/* Risk by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Risks by Status</CardTitle>
            <CardDescription>
              Current status distribution of all risks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.risks_by_status.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Risks by Category</CardTitle>
            <CardDescription>
              Distribution across different risk categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskChart 
              data={dashboardData?.risks_by_category || []} 
              dataKey="count"
              nameKey="category"
            />
          </CardContent>
        </Card>

        {/* Risk by Compliance Framework */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Frameworks</CardTitle>
            <CardDescription>
              Risks mapped to compliance standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.risks_by_compliance.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="uppercase">
                      {item.framework.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
