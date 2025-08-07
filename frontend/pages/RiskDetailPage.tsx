import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, AlertTriangle } from 'lucide-react';
import { UpdateRiskDialog } from '../components/UpdateRiskDialog';
import { ControlsSection } from '../components/ControlsSection';
import { useState } from 'react';

export function RiskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const backend = useBackend();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const { data: risk, isLoading, refetch } = useQuery({
    queryKey: ['risk', id],
    queryFn: () => backend.risk.get({ id: parseInt(id!) }),
    enabled: !!id,
  });

  const canEdit = user?.role === 'admin' || user?.role === 'risk_officer';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Risk Not Found</h2>
        <p className="text-gray-600 mb-4">The requested risk could not be found.</p>
        <Link to="/risks">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Risks
          </Button>
        </Link>
      </div>
    );
  }

  const getRiskSeverityColor = (score: number) => {
    if (score >= 15) return 'bg-red-100 text-red-800';
    if (score >= 8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getRiskSeverityLabel = (score: number) => {
    if (score >= 15) return 'High';
    if (score >= 8) return 'Medium';
    return 'Low';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/risks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{risk.title}</h1>
            <p className="text-gray-600 mt-1">Risk ID: {risk.id}</p>
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => setShowUpdateDialog(true)}>
            Edit Risk
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Risk Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{risk.description || 'No description provided'}</p>
              </div>

              {risk.mitigation_plan && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mitigation Plan</h4>
                  <p className="text-gray-700">{risk.mitigation_plan}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                  <Badge variant="outline" className="capitalize">
                    {risk.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Compliance Framework</h4>
                  <Badge variant="secondary" className="uppercase">
                    {risk.compliance_framework.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <ControlsSection riskId={risk.id} />
        </div>

        {/* Risk Metrics Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{risk.risk_score}</div>
                <Badge className={getRiskSeverityColor(risk.risk_score)}>
                  {getRiskSeverityLabel(risk.risk_score)} Risk
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold text-blue-600">{risk.likelihood}</div>
                  <div className="text-sm text-gray-600">Likelihood</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-purple-600">{risk.impact}</div>
                  <div className="text-sm text-gray-600">Impact</div>
                </div>
              </div>

              {(risk.residual_likelihood || risk.residual_impact) && (
                <>
                  <hr />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Residual Risk</h4>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-2">{risk.residual_risk_score}</div>
                      <Badge className={getRiskSeverityColor(risk.residual_risk_score)}>
                        {getRiskSeverityLabel(risk.residual_risk_score)} Risk
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center mt-3">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          {risk.residual_likelihood || risk.likelihood}
                        </div>
                        <div className="text-xs text-gray-600">Likelihood</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-purple-600">
                          {risk.residual_impact || risk.impact}
                        </div>
                        <div className="text-xs text-gray-600">Impact</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                <Badge variant="outline" className="capitalize">
                  {risk.status.replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Owner</h4>
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span>{risk.owner_id}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Created</h4>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(risk.created_at)}</span>
                </div>
              </div>

              {risk.due_date && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Due Date</h4>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(risk.due_date)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <UpdateRiskDialog
        risk={risk}
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        onSuccess={() => {
          refetch();
          setShowUpdateDialog(false);
        }}
      />
    </div>
  );
}
