'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Search, 
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Settings,
} from 'lucide-react';
import { internalVacancyApi, departmentApi } from '@/lib/api';
import type { InternalVacancy, Department, PaginatedResponse } from '@/lib/api/types';

export default function InternalVacanciesPage() {
  const [vacancies, setVacancies] = useState<InternalVacancy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const fetchPublishedVacancies = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {
      status: 'published'
    };
    
    if (selectedDepartment !== 'all') {
      params.department = selectedDepartment;
    }

    const response = await internalVacancyApi.list(params);
    if (response.data) {
      setVacancies((response.data as PaginatedResponse<InternalVacancy>).results || []);
    }
    setLoading(false);
  }, [selectedDepartment]);

  const fetchDepartments = useCallback(async () => {
    const response = await departmentApi.list();
    if (response.data) {
      setDepartments((response.data as PaginatedResponse<Department>).results || []);
    }
  }, []);

  useEffect(() => {
    fetchPublishedVacancies();
    fetchDepartments();
  }, [fetchPublishedVacancies, fetchDepartments]);

  const getDepartmentName = (deptId: number) => {
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || 'Sin departamento';
  };

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
          <h1 className="text-foreground mb-2">Vacantes Internas</h1>
          <p className="text-muted-foreground">
            Oportunidades de crecimiento dentro del banco
          </p>
        </div>
        <Link href="/internal-vacancies/admin">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Administrar
          </button>
        </Link>
      </div>

      {/* Department Filter */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <span className="text-foreground">Filtrar por Departamento:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDepartment('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedDepartment === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            Todos
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartment(dept.id.toString())}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedDepartment === dept.id.toString()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Vacancies List */}
      {vacancies.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-muted-foreground">No hay vacantes disponibles para este departamento</p>
        </div>
      ) : (
        <div className="space-y-6">
          {vacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground mb-2">{vacancy.title}</h3>
                    <div className="flex flex-wrap gap-4 text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{getDepartmentName(vacancy.department)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{vacancy.experience_required || 'No especificado'}</span>
                      </div>
                      {vacancy.salary_range_min && vacancy.salary_range_max && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>${vacancy.salary_range_min.toLocaleString()} - ${vacancy.salary_range_max.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-card-foreground mb-3">{vacancy.description}</p>
                    
                    {vacancy.responsibilities && (
                      <div className="mb-3">
                        <p className="text-foreground font-medium mb-2">Responsabilidades:</p>
                        <p className="text-muted-foreground whitespace-pre-line">{vacancy.responsibilities}</p>
                      </div>
                    )}
                    
                    {vacancy.technical_requirements && (
                      <div>
                        <p className="text-foreground font-medium mb-2">Requisitos Técnicos:</p>
                        <p className="text-muted-foreground whitespace-pre-line">{vacancy.technical_requirements}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 flex-shrink-0 ml-4">
                  <button 
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                    onClick={() => alert(`Aplicar a: ${vacancy.title}`)}
                  >
                    Aplicar Ahora
                  </button>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{vacancy.application_count || 0} aplicantes</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-muted-foreground">
                  {vacancy.application_deadline 
                    ? `Fecha límite: ${new Date(vacancy.application_deadline).toLocaleDateString()}`
                    : `Publicado: ${new Date(vacancy.created_at).toLocaleDateString()}`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
