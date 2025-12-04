'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ScrollText, 
  Search, 
  FileText, 
  Download,
  Eye,
  Settings,
  Building2,
} from 'lucide-react';
import { policyApi } from '@/lib/api';
import type { Policy, PaginatedResponse } from '@/lib/api/types';

const originLabels: Record<string, string> = {
  sudeban: 'SUDEBAN',
  bcv: 'BCV',
  audit: 'Auditoría',
  improvement: 'Mejora de Procesos',
  internal: 'Iniciativa Interna',
  other: 'Otro',
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const areas = ['all', 'sudeban', 'bcv', 'audit', 'improvement', 'internal', 'other'];

  // Fetch published policies only
  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    const params: { status: string; origin?: string; search?: string } = {
      status: 'published'
    };
    
    if (selectedArea !== 'all') params.origin = selectedArea;
    if (searchQuery) params.search = searchQuery;

    const response = await policyApi.list(params);
    if (response.data) {
      const results = (response.data as PaginatedResponse<Policy>).results || [];
      setPolicies(results);
    }
    setLoading(false);
  }, [selectedArea, searchQuery]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Políticas</h1>
            <p className="text-gray-600">Políticas y normativas institucionales</p>
          </div>
          <Link href="/policies/admin">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Administrar
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Buscar políticas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {areas.slice(1).map((area) => (
                    <SelectItem key={area} value={area}>
                      {originLabels[area] || area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies Grid */}
      {policies.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron políticas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <Card
              key={policy.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{policy.title}</h3>
                    <p className="text-xs text-gray-600">
                      {originLabels[policy.origin] || policy.origin}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Vigencia:</span>
                    <span>{policy.effective_date ? new Date(policy.effective_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Versión:</span>
                    <span>{policy.version}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Actualización:</span>
                    <span>{new Date(policy.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // In a real app, this would open a viewer or download the policy
                      alert(`Ver política: ${policy.title}`);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      alert(`Ver detalles: ${policy.title}`);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
