import { useState } from 'react';
import { Search, Filter, Download, Eye, FileText, Plus } from 'lucide-react';

interface BibliotecaDocumentosProps {
  isAdmin: boolean;
}

export function BibliotecaDocumentos({ isAdmin }: BibliotecaDocumentosProps) {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminTab, setAdminTab] = useState<'borrador' | 'pendientes' | 'aprobados'>('aprobados');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const categories = [
    'Todos',
    'Manuales',
    'Procedimientos',
    'Políticas',
    'Formularios',
    'Reportes',
  ];

  const documents = [
    {
      id: 1,
      title: 'Manual de Operaciones Bancarias 2024',
      category: 'Manuales',
      uploadDate: '2024-12-01',
      size: '2.5 MB',
      downloads: 124,
      status: 'aprobados',
    },
    {
      id: 2,
      title: 'Procedimiento de Apertura de Cuentas',
      category: 'Procedimientos',
      uploadDate: '2024-11-28',
      size: '1.8 MB',
      downloads: 89,
      status: 'aprobados',
    },
    {
      id: 3,
      title: 'Política de Seguridad de Información',
      category: 'Políticas',
      uploadDate: '2024-11-25',
      size: '3.2 MB',
      downloads: 156,
      status: 'aprobados',
    },
    {
      id: 4,
      title: 'Formulario de Solicitud de Crédito',
      category: 'Formularios',
      uploadDate: '2024-11-20',
      size: '0.5 MB',
      downloads: 234,
      status: 'aprobados',
    },
    {
      id: 5,
      title: 'Reporte Mensual de Gestión - Nov 2024',
      category: 'Reportes',
      uploadDate: '2024-11-15',
      size: '4.1 MB',
      downloads: 67,
      status: 'aprobados',
    },
    {
      id: 6,
      title: 'Guía de Atención al Cliente',
      category: 'Manuales',
      uploadDate: '2024-12-03',
      size: '1.2 MB',
      downloads: 0,
      status: 'pendientes',
    },
    {
      id: 7,
      title: 'Borrador Manual de Ventas',
      category: 'Manuales',
      uploadDate: '2024-12-04',
      size: '0.8 MB',
      downloads: 0,
      status: 'borrador',
    },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'todos' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = isAdmin ? doc.status === adminTab : doc.status === 'aprobados';
    return matchesCategory && matchesSearch && matchesStatus;
  });

  if (isAdmin && showUploadForm) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={() => setShowUploadForm(false)}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Volver
          </button>
          <h1 className="text-gray-900">Subir Nuevo Documento</h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Título del Documento</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el título del documento"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Categoría</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Manuales</option>
                <option>Procedimientos</option>
                <option>Políticas</option>
                <option>Formularios</option>
                <option>Reportes</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Descripción</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del documento"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Archivo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Haz clic o arrastra el archivo aquí</p>
                <p className="text-gray-400">PDF, DOC, DOCX (máx. 10MB)</p>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Estado</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Borrador</option>
                <option>Pendiente de Aprobación</option>
                <option>Aprobado</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar Documento
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
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
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Biblioteca de Documentos</h1>
        <p className="text-gray-600">
          {isAdmin ? 'Gestión de documentos' : 'Accede a manuales y documentación oficial'}
        </p>
      </div>

      {isAdmin && (
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setAdminTab('borrador')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              adminTab === 'borrador'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Borradores
          </button>
          <button
            onClick={() => setAdminTab('pendientes')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              adminTab === 'pendientes'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setAdminTab('aprobados')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              adminTab === 'aprobados'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aprobados
          </button>
          <button
            onClick={() => setShowUploadForm(true)}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Subir Documento
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 mb-1">{doc.title}</h3>
                <p className="text-gray-600">{doc.category}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Fecha:</span>
                <span>{doc.uploadDate}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tamaño:</span>
                <span>{doc.size}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Descargas:</span>
                <span>{doc.downloads}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Descargar
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron documentos</p>
        </div>
      )}
    </div>
  );
}
