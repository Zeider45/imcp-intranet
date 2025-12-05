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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Políticas y Reglamentos</h1>
          <p className="text-muted-foreground">Consulta las políticas y reglamentos del banco</p>
        </div>
        <Link href="/policies/admin">
          <Button className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Administrar
          </Button>
        </Link>
      </div>

      {/* Area Filter */}
      <div className="bg-card dark:bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <span className="text-foreground">Filtrar por Área:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedArea('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedArea === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary dark:bg-secondary text-secondary-foreground hover:bg-accent dark:hover:bg-accent'
            }`}
          >
            Todas
          </button>
          {areas.slice(1).map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedArea === area
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary dark:bg-secondary text-secondary-foreground hover:bg-accent dark:hover:bg-accent'
              }`}
            >
              {originLabels[area] || area}
            </button>
          ))}
        </div>
      </div>

      {/* Policies List */}
      {policies.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron políticas para esta área</p>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-card dark:bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground mb-2">{policy.title}</h3>
                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{originLabels[policy.origin] || policy.origin}</span>
                      </div>
                      <span>Versión {policy.version}</span>
                      <span>Vigente desde: {policy.effective_date ? new Date(policy.effective_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <button 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    onClick={() => {
                      alert(`Ver política: ${policy.title}`);
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                  <button 
                    className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent dark:hover:bg-accent transition-colors"
                    onClick={() => {
                      alert(`Ver detalles: ${policy.title}`);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-muted-foreground">
                  Última actualización: {new Date(policy.updated_at).toLocaleDateString()}
                </p>
                <p className="text-muted-foreground">Código: {policy.code}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
