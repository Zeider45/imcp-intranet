'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckSquare, 
  Search, 
  FileText, 
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { documentApprovalApi } from '@/lib/api';
import type { DocumentApproval, PaginatedResponse } from '@/lib/api/types';

const decisionLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  approved_with_observations: 'Aprobado con Observaciones',
  rejected: 'Rechazado',
};

const decisionColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  approved: 'default',
  approved_with_observations: 'secondary',
  rejected: 'destructive',
};

const decisionIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  approved_with_observations: <AlertCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
};

export default function DocumentApprovalsPage() {
  const [approvals, setApprovals] = useState<DocumentApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<DocumentApproval | null>(null);
  const [approvalData, setApprovalData] = useState({
    observations: '',
    corrections: '',
    deadline: '',
    reason: '',
    approvalType: 'approve' as 'approve' | 'approve_with_observations',
  });

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (filterDecision !== 'all') params.decision = filterDecision;

    const response = await documentApprovalApi.list(params);
    if (response.data) {
      setApprovals((response.data as PaginatedResponse<DocumentApproval>).results || []);
    }
    setLoading(false);
  }, [searchTerm, filterDecision]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleApprove = async () => {
    if (!selectedApproval) return;
    
    let response;
    if (approvalData.approvalType === 'approve') {
      response = await documentApprovalApi.approve(selectedApproval.id, approvalData.observations);
    } else {
      response = await documentApprovalApi.approveWithObservations(
        selectedApproval.id,
        approvalData.observations,
        approvalData.corrections,
        approvalData.deadline || undefined
      );
    }
    
    if (response.data) {
      setIsApproveDialogOpen(false);
      resetApprovalData();
      fetchApprovals();
    }
  };

  const handleReject = async () => {
    if (!selectedApproval) return;
    const response = await documentApprovalApi.reject(selectedApproval.id, approvalData.reason);
    if (response.data) {
      setIsRejectDialogOpen(false);
      resetApprovalData();
      fetchApprovals();
    }
  };

  const resetApprovalData = () => {
    setApprovalData({
      observations: '',
      corrections: '',
      deadline: '',
      reason: '',
      approvalType: 'approve',
    });
    setSelectedApproval(null);
  };

  const openViewDialog = (approval: DocumentApproval) => {
    setSelectedApproval(approval);
    setIsViewDialogOpen(true);
  };

  const openApproveDialog = (approval: DocumentApproval, type: 'approve' | 'approve_with_observations') => {
    setSelectedApproval(approval);
    setApprovalData({ ...approvalData, approvalType: type });
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (approval: DocumentApproval) => {
    setSelectedApproval(approval);
    setIsRejectDialogOpen(true);
  };

  const pendingCount = approvals.filter(a => a.decision === 'pending').length;
  const approvedCount = approvals.filter(a => ['approved', 'approved_with_observations'].includes(a.decision)).length;
  const rejectedCount = approvals.filter(a => a.decision === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-primary" />
            Aprobación de Documentación
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de revisión y aprobación de documentación técnica
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aprobados</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rechazados</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{approvals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o observaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterDecision} onValueChange={setFilterDecision}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Decisión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las decisiones</SelectItem>
                  {Object.entries(decisionLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchApprovals}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Aprobación</CardTitle>
          <CardDescription>
            {approvals.length} solicitud(es) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron solicitudes de aprobación</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Revisor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Decisión</TableHead>
                  <TableHead>Junta Directiva</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell className="font-medium max-w-[250px] truncate">
                      {approval.document_draft_title}
                    </TableCell>
                    <TableCell>{approval.reviewer_name}</TableCell>
                    <TableCell>
                      {new Date(approval.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={decisionColors[approval.decision]} className="gap-1">
                        {decisionIcons[approval.decision]}
                        {decisionLabels[approval.decision] || approval.decision}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {approval.requires_board_approval ? (
                        approval.board_approved ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Aprobado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Pendiente
                          </Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground text-sm">No requerido</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openViewDialog(approval)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {approval.decision === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => openApproveDialog(approval, 'approve')}
                              className="text-green-600 hover:text-green-700"
                              title="Aprobar"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => openApproveDialog(approval, 'approve_with_observations')}
                              className="text-yellow-600 hover:text-yellow-700"
                              title="Aprobar con Observaciones"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => openRejectDialog(approval)}
                              className="text-red-600 hover:text-red-700"
                              title="Rechazar"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalle de Aprobación
            </DialogTitle>
            <DialogDescription>
              {selectedApproval?.document_draft_title}
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Revisor</span>
                  <p className="font-medium">{selectedApproval.reviewer_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Decisión</span>
                  <p>
                    <Badge variant={decisionColors[selectedApproval.decision]} className="gap-1">
                      {decisionIcons[selectedApproval.decision]}
                      {decisionLabels[selectedApproval.decision]}
                    </Badge>
                  </p>
                </div>
              </div>
              
              {selectedApproval.technical_observations && (
                <div>
                  <span className="text-sm text-muted-foreground">Observaciones Técnicas</span>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                    {selectedApproval.technical_observations}
                  </p>
                </div>
              )}
              
              {selectedApproval.corrections_required && (
                <div>
                  <span className="text-sm text-muted-foreground">Correcciones Requeridas</span>
                  <p className="mt-1 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                    {selectedApproval.corrections_required}
                  </p>
                </div>
              )}
              
              {selectedApproval.rejection_reason && (
                <div>
                  <span className="text-sm text-muted-foreground">Motivo de Rechazo</span>
                  <p className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                    {selectedApproval.rejection_reason}
                  </p>
                </div>
              )}
              
              {selectedApproval.correction_deadline && (
                <div>
                  <span className="text-sm text-muted-foreground">Plazo para Correcciones</span>
                  <p className="font-medium">
                    {new Date(selectedApproval.correction_deadline).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Firma del Revisor</span>
                  <p>
                    {selectedApproval.reviewer_signature ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </p>
                </div>
                {selectedApproval.approved_at && (
                  <div>
                    <span className="text-sm text-muted-foreground">Fecha de Aprobación</span>
                    <p className="font-medium">
                      {new Date(selectedApproval.approved_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {approvalData.approvalType === 'approve' ? (
                <>
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  Aprobar Documento
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5 text-yellow-600" />
                  Aprobar con Observaciones
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedApproval?.document_draft_title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Observaciones Técnicas</label>
              <Textarea
                placeholder="Ingrese sus observaciones técnicas..."
                value={approvalData.observations}
                onChange={(e) => setApprovalData({ ...approvalData, observations: e.target.value })}
                rows={3}
              />
            </div>
            
            {approvalData.approvalType === 'approve_with_observations' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Correcciones Requeridas *</label>
                  <Textarea
                    placeholder="Describa las correcciones que debe realizar el autor..."
                    value={approvalData.corrections}
                    onChange={(e) => setApprovalData({ ...approvalData, corrections: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plazo para Correcciones</label>
                  <Input
                    type="date"
                    value={approvalData.deadline}
                    onChange={(e) => setApprovalData({ ...approvalData, deadline: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              {approvalData.approvalType === 'approve' ? 'Aprobar' : 'Aprobar con Observaciones'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              Rechazar Documento
            </DialogTitle>
            <DialogDescription>
              {selectedApproval?.document_draft_title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo del Rechazo *</label>
              <Textarea
                placeholder="Explique el motivo del rechazo..."
                value={approvalData.reason}
                onChange={(e) => setApprovalData({ ...approvalData, reason: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReject} variant="destructive">
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
