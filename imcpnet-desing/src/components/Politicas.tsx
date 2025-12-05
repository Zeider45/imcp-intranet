import { useState } from 'react';
import { FileText, Download, Eye, Plus, Building2 } from 'lucide-react';

interface PoliticasProps {
  isAdmin: boolean;
}

export function Politicas({ isAdmin }: PoliticasProps) {
  const [selectedArea, setSelectedArea] = useState('todas');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const areas = [
    'Todas',
    'Recursos Humanos',
    'Operaciones',
    'Créditos',
    'Atención al Cliente',
    'Tecnología',
    'Administración',
  ];

  const politicas = [
    {
      id: 1,
      title: 'Código de Conducta y Ética',
      area: 'Recursos Humanos',
      version: '3.0',
      vigencia: '2024-01-01',
      updateDate: '2024-01-15',
      size: '1.8 MB',
    },
    {
      id: 2,
      title: 'Política de Gestión de Riesgos',
      area: 'Operaciones',
      version: '2.5',
      vigencia: '2024-02-01',
      updateDate: '2024-02-10',
      size: '2.3 MB',
    },
    {
      id: 3,
      title: 'Manual de Otorgamiento de Créditos',
      area: 'Créditos',
      version: '4.1',
      vigencia: '2024-03-01',
      updateDate: '2024-03-05',
      size: '3.5 MB',
    },
    {
      id: 4,
      title: 'Protocolo de Atención al Cliente',
      area: 'Atención al Cliente',
      version: '2.0',
      vigencia: '2024-01-15',
      updateDate: '2024-01-20',
      size: '1.2 MB',
    },
    {
      id: 5,
      title: 'Política de Seguridad de la Información',
      area: 'Tecnología',
      version: '5.2',
      vigencia: '2024-04-01',
      updateDate: '2024-04-10',
      size: '2.8 MB',
    },
    {
      id: 6,
      title: 'Reglamento de Asistencia y Puntualidad',
      area: 'Recursos Humanos',
      version: '1.8',
      vigencia: '2024-01-01',
      updateDate: '2024-01-05',
      size: '0.9 MB',
    },
    {
      id: 7,
      title: 'Manual de Control Interno',
      area: 'Administración',
      version: '3.3',
      vigencia: '2024-02-15',
      updateDate: '2024-02-20',
      size: '4.2 MB',
    },
  ];

  const filteredPoliticas = politicas.filter((politica) => {
    return selectedArea === 'todas' || politica.area === selectedArea;
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
          <h1 className="text-gray-900">Crear Nueva Política</h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Título de la Política</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el título de la política"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Área</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Recursos Humanos</option>
                <option>Operaciones</option>
                <option>Créditos</option>
                <option>Atención al Cliente</option>
                <option>Tecnología</option>
                <option>Administración</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Versión</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1.0"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Fecha de Vigencia</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Descripción</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción de la política o reglamento"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Archivo PDF</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Haz clic o arrastra el archivo aquí</p>
                <p className="text-gray-400">PDF (máx. 10MB)</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Publicar Política
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
          <h1 className="text-gray-900 mb-2">Políticas y Reglamentos</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gestión de políticas bancarias' : 'Consulta las políticas y reglamentos del banco'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Política
          </button>
        )}
      </div>

      {/* Area Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700">Filtrar por Área:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area.toLowerCase())}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedArea === area.toLowerCase()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Politicas List */}
      <div className="space-y-4">
        {filteredPoliticas.map((politica) => (
          <div
            key={politica.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 mb-2">{politica.title}</h3>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{politica.area}</span>
                    </div>
                    <span>Versión {politica.version}</span>
                    <span>Vigente desde: {politica.vigencia}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Última actualización: {politica.updateDate}
              </p>
              <p className="text-gray-600">{politica.size}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredPoliticas.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron políticas para esta área</p>
        </div>
      )}
    </div>
  );
}
