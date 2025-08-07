import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Risk } from '~backend/risks/types';

interface ViewRiskDialogProps {
  risk: Risk;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewRiskDialog({ risk, open, onOpenChange }: ViewRiskDialogProps) {
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Risk Details - SN {risk.sn}</DialogTitle>
          <DialogDescription>
            Complete risk information and treatment details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Risk Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Asset Group</label>
                  <p className="text-sm">{risk.assetGroup}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Asset</label>
                  <p className="text-sm">{risk.asset}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Threat</label>
                <p className="text-sm">{risk.threat}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Vulnerability</label>
                <p className="text-sm">{risk.vulnerability}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Risk Type</label>
                  <p className="text-sm">{risk.riskType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Risk Owner</label>
                  <p className="text-sm">{risk.riskOwner}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Likelihood</label>
                  <p className="text-sm">{risk.likelihood}/5</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Impact</label>
                  <p className="text-sm">{risk.impact}/5</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Risk Level</label>
                  <Badge className={getRiskLevelColor(risk.riskLevel)}>
                    {risk.riskLevel}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Impact Rationale</label>
                <p className="text-sm">{risk.impactRationale}</p>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Proposed Treatment Action</label>
                <p className="text-sm">{risk.proposedTreatmentAction}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Treatment Cost</label>
                  <p className="text-sm">{risk.treatmentCost}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Treatment Owner</label>
                  <p className="text-sm">{risk.treatmentActionOwner}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Timescale</label>
                  <p className="text-sm">{risk.treatmentActionTimescale}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge className={getTreatmentStatusColor(risk.treatmentActionStatus)}>
                    {risk.treatmentActionStatus}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Annex A Control Reference</label>
                <p className="text-sm">{risk.annexAControlReference}</p>
              </div>
            </CardContent>
          </Card>

          {/* Post-Treatment Assessment */}
          {(risk.postTreatmentLikelihood || risk.postTreatmentImpact) && (
            <Card>
              <CardHeader>
                <CardTitle>Post-Treatment Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Post-Treatment Likelihood</label>
                    <p className="text-sm">{risk.postTreatmentLikelihood || 'Not assessed'}/5</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Post-Treatment Impact</label>
                    <p className="text-sm">{risk.postTreatmentImpact || 'Not assessed'}/5</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Post-Treatment Risk Level</label>
                    {risk.postTreatmentRiskLevel ? (
                      <Badge className={getRiskLevelColor(risk.postTreatmentRiskLevel)}>
                        {risk.postTreatmentRiskLevel}
                      </Badge>
                    ) : (
                      <p className="text-sm">Not assessed</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review and Assessment Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Review and Assessment Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Review Date</label>
                  <p className="text-sm">{formatDate(risk.reviewDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Assessment Date</label>
                  <p className="text-sm">{formatDate(risk.nextAssessmentDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Frameworks */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Frameworks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {risk.complianceFrameworks.map((framework) => (
                  <Badge key={framework} variant="outline">
                    {framework}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          {risk.comments && (
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{risk.comments}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
