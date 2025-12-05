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
          <h1 className="text-gray-900 mb-2">Políticas y Reglamentos</h1>
          <p className="text-gray-600">Consulta las políticas y reglamentos del banco</p>
        </div>
        <Link href="/policies/admin">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Administrar
          </Button>
        </Link>
      </div>

      {/* Area Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700">Filtrar por Área:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedArea('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedArea === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron políticas para esta área</p>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-2">{policy.title}</h3>
                    <div className="flex flex-wrap gap-4 text-gray-600">
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    onClick={() => {
                      alert(`Ver política: ${policy.title}`);
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      alert(`Ver detalles: ${policy.title}`);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  Última actualización: {new Date(policy.updated_at).toLocaleDateString()}
                </p>
                <p className="text-gray-600">Código: {policy.code}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
