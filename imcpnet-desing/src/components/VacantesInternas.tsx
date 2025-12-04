import { useState } from 'react';
import { Briefcase, MapPin, Clock, DollarSign, Users, Plus, Building2 } from 'lucide-react';

interface VacantesInternasProps {
  isAdmin: boolean;
}

export function VacantesInternas({ isAdmin }: VacantesInternasProps) {
  const [selectedDepartamento, setSelectedDepartamento] = useState('todos');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const departamentos = [
    'Todos',
    'Recursos Humanos',
    'Operaciones',
    'Créditos',
    'Atención al Cliente',
    'Tecnología',
    'Administración',
    'Ventas',
  ];

  const vacantes = [
    {
      id: 1,
      title: 'Analista de Crédito Senior',
      departamento: 'Créditos',
      ubicacion: 'Oficina Central - Ciudad de México',
      tipo: 'Tiempo Completo',
      salario: '$25,000 - $35,000',
      publicado: '2024-12-01',
      aplicantes: 12,
      descripcion: 'Buscamos un analista de crédito con experiencia en evaluación de riesgo crediticio.',
      requisitos: ['5+ años de experiencia', 'Licenciatura en Finanzas', 'Conocimiento en análisis financiero'],
    },
    {
      id: 2,
      title: 'Gerente de Atención al Cliente',
      departamento: 'Atención al Cliente',
      ubicacion: 'Sucursal Norte',
      tipo: 'Tiempo Completo',
      salario: '$30,000 - $40,000',
      publicado: '2024-11-28',
      aplicantes: 18,
      descripcion: 'Responsable de liderar el equipo de atención al cliente y garantizar la satisfacción.',
      requisitos: ['3+ años en gestión', 'Habilidades de liderazgo', 'Experiencia en servicio al cliente'],
    },
    {
      id: 3,
      title: 'Desarrollador Full Stack',
      departamento: 'Tecnología',
      ubicacion: 'Remoto',
      tipo: 'Tiempo Completo',
      salario: '$35,000 - $50,000',
      publicado: '2024-11-25',
      aplicantes: 25,
      descripcion: 'Desarrollador con experiencia en tecnologías web modernas para proyectos bancarios.',
      requisitos: ['React, Node.js', '3+ años de experiencia', 'Conocimiento en seguridad'],
    },
    {
      id: 4,
      title: 'Especialista en Recursos Humanos',
      departamento: 'Recursos Humanos',
      ubicacion: 'Oficina Central',
      tipo: 'Tiempo Completo',
      salario: '$20,000 - $28,000',
      publicado: '2024-11-20',
      aplicantes: 15,
      descripcion: 'Apoyo en procesos de reclutamiento, capacitación y desarrollo de personal.',
      requisitos: ['2+ años en RRHH', 'Licenciatura en Psicología o Administración', 'Conocimiento en nómina'],
    },
    {
      id: 5,
      title: 'Ejecutivo de Ventas',
      departamento: 'Ventas',
      ubicacion: 'Sucursal Sur',
      tipo: 'Tiempo Completo',
      salario: '$18,000 - $25,000 + comisiones',
      publicado: '2024-11-15',
      aplicantes: 22,
      descripcion: 'Venta de productos financieros y captación de nuevos clientes.',
      requisitos: ['Experiencia en ventas', 'Orientación a resultados', 'Excelente comunicación'],
    },
  ];

  const filteredVacantes = vacantes.filter((vacante) => {
    return selectedDepartamento === 'todos' || vacante.departamento === selectedDepartamento;
  });

  if (isAdmin && showCreateForm) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(false)}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Volver
          </button>
          <h1 className="text-gray-900">Publicar Nueva Vacante</h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-3xl">
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Título del Puesto</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Analista de Crédito Senior"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Departamento</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Recursos Humanos</option>
                  <option>Operaciones</option>
                  <option>Créditos</option>
                  <option>Atención al Cliente</option>
                  <option>Tecnología</option>
                  <option>Administración</option>
                  <option>Ventas</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Tipo de Contrato</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Tiempo Completo</option>
                  <option>Medio Tiempo</option>
                  <option>Temporal</option>
                  <option>Por Proyecto</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Ubicación</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Oficina Central"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Rango Salarial</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: $25,000 - $35,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Descripción del Puesto</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe las responsabilidades y funciones principales..."
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Requisitos</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lista los requisitos necesarios (un requisito por línea)..."
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Beneficios</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe los beneficios ofrecidos..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Publicar Vacante
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Vacantes Internas</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gestión de vacantes y oportunidades laborales' : 'Oportunidades de crecimiento dentro del banco'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Vacante
          </button>
        )}
      </div>

      {/* Department Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700">Filtrar por Departamento:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {departamentos.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartamento(dept.toLowerCase())}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedDepartamento === dept.toLowerCase()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Vacantes List */}
      <div className="space-y-6">
        {filteredVacantes.map((vacante) => (
          <div
            key={vacante.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 mb-2">{vacante.title}</h3>
                  <div className="flex flex-wrap gap-4 text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{vacante.departamento}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{vacante.ubicacion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{vacante.tipo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>{vacante.salario}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{vacante.descripcion}</p>
                  <div>
                    <p className="text-gray-700 mb-2">Requisitos:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {vacante.requisitos.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0 ml-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                  Aplicar Ahora
                </button>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{vacante.aplicantes} aplicantes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Publicado: {vacante.publicado}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredVacantes.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No hay vacantes disponibles para este departamento</p>
        </div>
      )}
    </div>
  );
}
