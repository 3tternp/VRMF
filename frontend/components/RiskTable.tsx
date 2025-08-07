import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import type { Risk } from '~backend/risk/types';

interface RiskTableProps {
  risks: Risk[];
  onUpdate: () => void;
}

export function RiskTable({ risks }: RiskTableProps) {
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (risks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No risks found matching your criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Framework</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.map((risk) => (
            <TableRow key={risk.id}>
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{risk.title}</div>
                  {risk.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {risk.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {risk.category.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="uppercase text-xs">
                  {risk.compliance_framework.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{risk.risk_score}</span>
                  <Badge className={getRiskSeverityColor(risk.risk_score)}>
                    {getRiskSeverityLabel(risk.risk_score)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {risk.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {risk.owner_id}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(risk.created_at)}
              </TableCell>
              <TableCell>
                <Link to={`/risks/${risk.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
