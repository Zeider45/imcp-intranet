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
  ClipboardList, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Eye,
  Truck,
  RotateCcw,
  ThumbsUp
} from 'lucide-react';
import { documentLoanApi, technicalDocumentApi } from '@/lib/api';
import type { DocumentLoan, TechnicalDocument, PaginatedResponse } from '@/lib/api/types';

const statusLabels: Record<string, string> = {
  requested: 'Solicitado',
  approved: 'Aprobado',
  delivered: 'Entregado',
  returned: 'Devuelto',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  requested: 'outline',
  approved: 'secondary',
  delivered: 'default',
  returned: 'default',
  overdue: 'destructive',
  cancelled: 'outline',
};

const statusIcons: Record<string, React.ReactNode> = {
  requested: <Clock className="h-3 w-3" />,
  approved: <ThumbsUp className="h-3 w-3" />,
  delivered: <Truck className="h-3 w-3" />,
  returned: <CheckCircle className="h-3 w-3" />,
  overdue: <AlertTriangle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

export default function DocumentLoansPage() {
  const [loans, setLoans] = useState<DocumentLoan[]>([]);
  const [documents, setDocuments] = useState<TechnicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<DocumentLoan | null>(null);
  const [formData, setFormData] = useState({
    document: 0,
    purpose: '',
    expected_return_date: '',
  });

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (filterStatus !== 'all') params.status = filterStatus;

    const response = await documentLoanApi.list(params);
    if (response.data) {
      setLoans((response.data as PaginatedResponse<DocumentLoan>).results || []);
    }
    setLoading(false);
  }, [searchTerm, filterStatus]);

  const fetchDocuments = useCallback(async () => {
    const response = await technicalDocumentApi.list({ status: 'available' });
    if (response.data) {
      setDocuments((response.data as PaginatedResponse<TechnicalDocument>).results || []);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
    fetchDocuments();
  }, [fetchLoans, fetchDocuments]);

  const handleCreate = async () => {
    const response = await documentLoanApi.create(formData);
    if (response.data) {
      setIsCreateDialogOpen(false);
      resetForm();
      fetchLoans();
    }
  };

  const handleApprove = async (id: number) => {
    const response = await documentLoanApi.approve(id);
    if (response.data) {
      fetchLoans();
    }
  };

  const handleDeliver = async (id: number) => {
    const response = await documentLoanApi.deliver(id);
    if (response.data) {
      fetchLoans();
      fetchDocuments();
    }
  };

  const handleReturn = async (id: number) => {
    const response = await documentLoanApi.returnDocument(id);
    if (response.data) {
      fetchLoans();
      fetchDocuments();
    }
  };

  const resetForm = () => {
    setFormData({
      document: 0,
      purpose: '',
      expected_return_date: '',
    });
  };

  const openViewDialog = (loan: DocumentLoan) => {
    setSelectedLoan(loan);
    setIsViewDialogOpen(true);
  };

  const pendingCount = loans.filter(l => l.status === 'requested').length;
  const deliveredCount = loans.filter(l => l.status === 'delivered').length;
  const overdueCount = loans.filter(l => l.status === 'overdue').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            Préstamos de Documentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Registro y control de préstamos de documentación técnica
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Solicitar Préstamo
        </Button>
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
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Préstamo</p>
                <p className="text-2xl font-bold">{deliveredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold">{overdueCount}</p>
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
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{loans.length}</p>
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
                placeholder="Buscar por documento o analista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchLoans}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bitácora de Préstamos</CardTitle>
          <CardDescription>
            {loans.length} préstamo(s) registrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron préstamos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Analista</TableHead>
                  <TableHead>Fecha Solicitud</TableHead>
                  <TableHead>Fecha Devolución</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div>
                        <p className="font-mono text-sm font-semibold">{loan.document_code}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {loan.document_title}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{loan.analyst_name}</TableCell>
                    <TableCell>
                      {new Date(loan.request_date).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {loan.expected_return_date 
                        ? new Date(loan.expected_return_date).toLocaleDateString('es-ES')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[loan.status]} className="gap-1">
                        {statusIcons[loan.status]}
                        {statusLabels[loan.status] || loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openViewDialog(loan)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {loan.status === 'requested' && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleApprove(loan.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                        )}
                        {loan.status === 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleDeliver(loan.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                        {(loan.status === 'delivered' || loan.status === 'overdue') && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleReturn(loan.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Solicitar Préstamo</DialogTitle>
            <DialogDescription>
              Solicite el préstamo de un documento técnico
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Documento *</label>
              <Select 
                value={formData.document ? formData.document.toString() : ''} 
                onValueChange={(v) => setFormData({ ...formData, document: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un documento" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id.toString()}>
                      {doc.code} - {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Esperada de Devolución</label>
              <Input
                type="date"
                value={formData.expected_return_date}
                onChange={(e) => setFormData({ ...formData, expected_return_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Propósito de la Consulta *</label>
              <Textarea
                placeholder="Describa el motivo del préstamo..."
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Solicitar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalle del Préstamo
            </DialogTitle>
            <DialogDescription>
              {selectedLoan?.document_code}
            </DialogDescription>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4 py-4">
              <div>
                <span className="text-sm text-muted-foreground">Documento</span>
                <p className="font-medium">{selectedLoan.document_title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Analista</span>
                  <p className="font-medium">{selectedLoan.analyst_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Asistente</span>
                  <p className="font-medium">{selectedLoan.assistant_name || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Fecha Solicitud</span>
                  <p className="font-medium">
                    {new Date(selectedLoan.request_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <p>
                    <Badge variant={statusColors[selectedLoan.status]} className="gap-1">
                      {statusIcons[selectedLoan.status]}
                      {statusLabels[selectedLoan.status]}
                    </Badge>
                  </p>
                </div>
              </div>
              {selectedLoan.delivery_date && (
                <div>
                  <span className="text-sm text-muted-foreground">Fecha de Entrega</span>
                  <p className="font-medium">
                    {new Date(selectedLoan.delivery_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Propósito</span>
                <p className="text-sm mt-1">{selectedLoan.purpose}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Firma Analista</span>
                  <p>
                    {selectedLoan.analyst_signature ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Devolución Verificada</span>
                  <p>
                    {selectedLoan.return_verified ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </p>
                </div>
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
    </div>
  );
}
