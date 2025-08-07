import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBackend } from '../hooks/useBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface CreateRiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateRiskDialog({ open, onOpenChange, onSuccess }: CreateRiskDialogProps) {
  const backend = useBackend();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Basic fields
    title: '',
    description: '',
    category: '',
    compliance_framework: '',
    likelihood: 1,
    impact: 1,
    owner_id: '',
    mitigation_plan: '',
    
    // ISO 27001 specific fields
    asset_group: '',
    asset: '',
    threat: '',
    vulnerability: '',
    risk_type: '',
    risk_owner_approval: false,
    existing_controls: '',
    impact_rationale: '',
    treatment_option: '',
    proposed_treatment_action: '',
    annex_a_reference: '',
    treatment_cost: '',
    treatment_action_owner: '',
    treatment_timescale: '',
    treatment_status: 'not_started',
    comments: '',
  });

  const createRiskMutation = useMutation({
    mutationFn: async (data: any) => {
      const submitData = {
        ...data,
        treatment_cost: data.treatment_cost ? parseInt(data.treatment_cost) : undefined,
      };
      return await backend.risk.create(submitData);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Risk created successfully',
      });
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create risk error:', error);
      let errorMessage = 'Failed to create risk. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      compliance_framework: '',
      likelihood: 1,
      impact: 1,
      owner_id: '',
      mitigation_plan: '',
      asset_group: '',
      asset: '',
      threat: '',
      vulnerability: '',
      risk_type: '',
      risk_owner_approval: false,
      existing_controls: '',
      impact_rationale: '',
      treatment_option: '',
      proposed_treatment_action: '',
      annex_a_reference: '',
      treatment_cost: '',
      treatment_action_owner: '',
      treatment_timescale: '',
      treatment_status: 'not_started',
      comments: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.compliance_framework || !formData.owner_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createRiskMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!createRiskMutation.isPending) {
      onOpenChange(false);
      resetForm();
    }
  };

  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return { level: 'HIGH', color: 'text-red-600' };
    if (score >= 8) return { level: 'MEDIUM', color: 'text-yellow-600' };
    return { level: 'LOW', color: 'text-green-600' };
  };

  const riskLevel = getRiskLevel(formData.likelihood, formData.impact);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Risk</DialogTitle>
          <DialogDescription>
            Add a new risk to your organization's risk register with ISO 27001 compliance details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
              <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Risk Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., SQL injection attack compromises web application"
                    required
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the risk in detail"
                    rows={3}
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="asset_group">Asset Group</Label>
                  <Select 
                    value={formData.asset_group} 
                    onValueChange={(value) => setFormData({ ...formData, asset_group: value })}
                    disabled={createRiskMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="information">Information</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="physical_site">Physical/Site</SelectItem>
                      <SelectItem value="people">People</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="asset">Specific Asset</Label>
                  <Input
                    id="asset"
                    value={formData.asset}
                    onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                    placeholder="e.g., Customer database, Web server"
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="threat">Threat</Label>
                  <Textarea
                    id="threat"
                    value={formData.threat}
                    onChange={(e) => setFormData({ ...formData, threat: e.target.value })}
                    placeholder="Describe the threat (e.g., SQL injection attack compromises web application)"
                    rows={2}
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="vulnerability">Vulnerability</Label>
                  <Textarea
                    id="vulnerability"
                    value={formData.vulnerability}
                    onChange={(e) => setFormData({ ...formData, vulnerability: e.target.value })}
                    placeholder="Identify the specific weakness (e.g., Inadequate input validation in web application)"
                    rows={2}
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="risk_type">Risk Type</Label>
                  <Select 
                    value={formData.risk_type} 
                    onValueChange={(value) => setFormData({ ...formData, risk_type: value })}
                    disabled={createRiskMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confidentiality">Confidentiality (C)</SelectItem>
                      <SelectItem value="integrity">Integrity (I)</SelectItem>
                      <SelectItem value="availability">Availability (A)</SelectItem>
                      <SelectItem value="confidentiality_integrity">Confidentiality & Integrity (CI)</SelectItem>
                      <SelectItem value="confidentiality_availability">Confidentiality & Availability (CA)</SelectItem>
                      <SelectItem value="integrity_availability">Integrity & Availability (IA)</SelectItem>
                      <SelectItem value="confidentiality_integrity_availability">Confidentiality, Integrity & Availability (CIA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={createRiskMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="strategic">Strategic</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="reputation">Reputation</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="compliance_framework">Compliance Framework *</Label>
                  <Select 
                    value={formData.compliance_framework} 
                    onValueChange={(value) => setFormData({ ...formData, compliance_framework: value })}
                    disabled={createRiskMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso_27001">ISO 27001</SelectItem>
                      <SelectItem value="soc2">SOC 2</SelectItem>
                      <SelectItem value="hipaa">HIPAA</SelectItem>
                      <SelectItem value="pci_dss">PCI DSS</SelectItem>
                      <SelectItem value="nist_rmf">NIST RMF</SelectItem>
                      <SelectItem value="gdpr">GDPR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="owner_id">Risk Owner *</Label>
                  <Input
                    id="owner_id"
                    value={formData.owner_id}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    placeholder="e.g., IT Manager, ISO, HR Manager"
                    required
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="risk_owner_approval"
                    checked={formData.risk_owner_approval}
                    onCheckedChange={(checked) => setFormData({ ...formData, risk_owner_approval: !!checked })}
                    disabled={createRiskMutation.isPending}
                  />
                  <Label htmlFor="risk_owner_approval">Risk Owner's Approval</Label>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="existing_controls">Existing Controls</Label>
                  <Textarea
                    id="existing_controls"
                    value={formData.existing_controls}
                    onChange={(e) => setFormData({ ...formData, existing_controls: e.target.value })}
                    placeholder="List any current mitigations (e.g., Basic input validation implemented)"
                    rows={2}
                    disabled={createRiskMutation.isPending}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="likelihood">Likelihood (1-5) *</Label>
                  <Select 
                    value={formData.likelihood.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, likelihood: parseInt(value) })}
                    disabled={createRiskMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Improbable</SelectItem>
                      <SelectItem value="2">2 - Unlikely</SelectItem>
                      <SelectItem value="3">3 - Likely</SelectItem>
                      <SelectItem value="4">4 - Very Likely</SelectItem>
                      <SelectItem value="5">5 - Almost Certain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="impact">Impact (1-5) *</Label>
                  <Select 
                    value={formData.impact.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, impact: parseInt(value) })}
                    disabled={createRiskMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Insignificant</SelectItem>
                      <SelectItem value="2">2 - Slight</SelectItem>
                      <SelectItem value="3">3 - Moderate</SelectItem>
                      <SelectItem value="4">4 - High</SelectItem>
                      <SelectItem value="5">5 - Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold">Risk Score: {formData.likelihood * formData.impact}</div>
                      <div className={`text-lg font-semibold ${riskLevel.color}`}>
                        Risk Level: {riskLevel.level}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="impact_rationale">Impact Rationale</Label>
                  <Textarea
                    id="impact_rationale"
                    value={formData.impact_rationale}
                    onChange={(e) => setFormData({ ...formData, impact_rationale: e.target.value })}
                    placeholder="Provide justification for the impact rating (e.g., Compromise of customer data leads to significant reputational damage)"
                    rows={3}
                    disabled={createRiskMutation.isPending}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="treatment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="treatment_option">Treatment Option</Label>
                  <Select 
                    value={formData.treatment_option} 
                    onValueChange={(value) => setFormData({ ...formData, treatment_option: value })}
                    disabled={createRiskMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accept">Accept</SelectItem>
                      <SelectItem value="avoid">Avoid</SelectItem>
                      <SelectItem value="modify">Modify</SelectItem>
                      <SelectItem value="share">Share</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="treatment_status">Treatment Status</Label>
                  <Select 
                    value={formData.treatment_status} 
                    onValueChange={(value) => setFormData({ ...formData, treatment_status: value })}
                    disabled={createRiskMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="proposed_treatment_action">Proposed Treatment Action</Label>
                  <Textarea
                    id="proposed_treatment_action"
                    value={formData.proposed_treatment_action}
                    onChange={(e) => setFormData({ ...formData, proposed_treatment_action: e.target.value })}
                    placeholder="Describe specific actions to mitigate the risk (e.g., Implement strict input validation and regular security testing)"
                    rows={3}
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="annex_a_reference">Annex A/Control Reference</Label>
                  <Input
                    id="annex_a_reference"
                    value={formData.annex_a_reference}
                    onChange={(e) => setFormData({ ...formData, annex_a_reference: e.target.value })}
                    placeholder="e.g., A.8.26 Application security requirements"
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="treatment_cost">Treatment Cost (NPR)</Label>
                  <Input
                    id="treatment_cost"
                    type="number"
                    value={formData.treatment_cost}
                    onChange={(e) => setFormData({ ...formData, treatment_cost: e.target.value })}
                    placeholder="e.g., 90000"
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="treatment_action_owner">Treatment Action Owner</Label>
                  <Input
                    id="treatment_action_owner"
                    value={formData.treatment_action_owner}
                    onChange={(e) => setFormData({ ...formData, treatment_action_owner: e.target.value })}
                    placeholder="e.g., IT Manager, ISO"
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="treatment_timescale">Treatment Timescale</Label>
                  <Input
                    id="treatment_timescale"
                    value={formData.treatment_timescale}
                    onChange={(e) => setFormData({ ...formData, treatment_timescale: e.target.value })}
                    placeholder="e.g., 2 months, 6 weeks"
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="mitigation_plan">Additional Mitigation Plan</Label>
                  <Textarea
                    id="mitigation_plan"
                    value={formData.mitigation_plan}
                    onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
                    placeholder="Describe additional mitigation strategies"
                    rows={3}
                    disabled={createRiskMutation.isPending}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    placeholder="Any additional notes or comments"
                    rows={2}
                    disabled={createRiskMutation.isPending}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createRiskMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createRiskMutation.isPending}
            >
              {createRiskMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Risk'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
