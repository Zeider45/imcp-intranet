import { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, Plus, Image, Video, FileText } from 'lucide-react';

interface ForoProps {
  isAdmin: boolean;
}

export function Foro({ isAdmin }: ForoProps) {
  const [showCreatePost, setShowCreatePost] = useState(false);

  const posts = [
    {
      id: 1,
      author: 'Ana Martínez',
      position: 'Gerente de Operaciones',
      avatar: 'AM',
      time: '2024-12-04 10:30',
      content: '¡Felicitaciones al equipo de atención al cliente por alcanzar el 98% de satisfacción este mes! 🎉 Su dedicación y profesionalismo son un ejemplo para todos. ¡Sigamos trabajando juntos para mantener estos excelentes resultados!',
      likes: 124,
      comments: 28,
      shares: 5,
      hasLiked: false,
    },
    {
      id: 2,
      author: 'Roberto Silva',
      position: 'Director de Recursos Humanos',
      avatar: 'RS',
      time: '2024-12-04 09:15',
      content: 'Recordatorio importante: La capacitación de seguridad bancaria es obligatoria para todos los empleados. Fecha límite de completación: 20 de diciembre. Por favor, asegúrense de inscribirse en la plataforma de capacitaciones.',
      likes: 89,
      comments: 15,
      shares: 12,
      hasLiked: true,
    },
    {
      id: 3,
      author: 'Laura Fernández',
      position: 'Coordinadora de Comunicaciones',
      avatar: 'LF',
      time: '2024-12-03 16:45',
      content: 'Ya está disponible el boletín informativo de noviembre en la biblioteca de documentos. Incluye las actualizaciones más importantes del mes, reconocimientos al personal destacado y próximos eventos. ¡No olviden revisarlo!',
      likes: 67,
      comments: 8,
      shares: 3,
      hasLiked: false,
    },
    {
      id: 4,
      author: 'Carlos Mendoza',
      position: 'Jefe de Tecnología',
      avatar: 'CM',
      time: '2024-12-03 14:20',
      content: 'El nuevo sistema de gestión de clientes estará en mantenimiento este sábado de 6:00 AM a 10:00 AM. Durante ese tiempo, algunas funcionalidades podrían no estar disponibles. Agradecemos su comprensión.',
      likes: 45,
      comments: 12,
      shares: 8,
      hasLiked: false,
    },
    {
      id: 5,
      author: 'María González',
      position: 'Gerente de Sucursal Norte',
      avatar: 'MG',
      time: '2024-12-02 11:30',
      content: '¡Excelente trabajo equipo! Nuestra sucursal alcanzó la meta de captación de clientes este trimestre. Gracias a cada uno de ustedes por su esfuerzo y compromiso. ¡Celebremos este logro juntos! 🎊',
      likes: 156,
      comments: 34,
      shares: 7,
      hasLiked: true,
    },
    {
      id: 6,
      author: 'Jorge López',
      position: 'Especialista en Cumplimiento',
      avatar: 'JL',
      time: '2024-12-02 09:00',
      content: 'Compartiendo el nuevo protocolo de prevención de lavado de dinero que entró en vigor este mes. Es fundamental que todos los empleados del área comercial lo revisen. El documento está disponible en la sección de Políticas.',
      likes: 72,
      comments: 19,
      shares: 15,
      hasLiked: false,
    },
  ];

  if (showCreatePost) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={() => setShowCreatePost(false)}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Volver
          </button>
          <h1 className="text-gray-900">Nueva Publicación</h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-3xl">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
              AD
            </div>
            <div className="flex-1">
              <p className="text-gray-900">Administrador</p>
              <p className="text-gray-600">Publicando en el foro principal</p>
            </div>
          </div>

          <textarea
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="¿Qué te gustaría compartir con el equipo?"
          />

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Image className="w-5 h-5 text-green-600" />
              <span>Foto</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-red-600" />
              <span>Video</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Documento</span>
            </button>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Publicar
            </button>
            <button
              onClick={() => setShowCreatePost(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Foro de Comunicación</h1>
        <p className="text-gray-600">
          {isAdmin ? 'Gestión de publicaciones y comunicados' : 'Mantente al día con las novedades del banco'}
        </p>
      </div>

      {/* Create Post Card */}
      {isAdmin && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
              AD
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-left hover:bg-gray-100 transition-colors"
            >
              Comparte una actualización con el equipo...
            </button>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Publicar
            </button>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Post Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                {post.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900">{post.author}</p>
                <p className="text-gray-600">{post.position}</p>
                <p className="text-gray-400">{post.time}</p>
              </div>
              {isAdmin && (
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Post Content */}
            <p className="text-gray-700 mb-4 whitespace-pre-line">{post.content}</p>

            {/* Post Stats */}
            <div className="flex items-center gap-6 py-3 border-t border-b border-gray-200 mb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <ThumbsUp className="w-4 h-4" />
                <span>{post.likes} Me gusta</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments} Comentarios</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Share2 className="w-4 h-4" />
                <span>{post.shares} Compartidos</span>
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-3">
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  post.hasLiked
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>Me gusta</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>Comentar</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
                <span>Compartir</span>
              </button>
            </div>

            {/* Comments Section (collapsed by default) */}
            {post.comments > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-blue-600 hover:text-blue-700">
                  Ver todos los comentarios ({post.comments})
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-6 text-center">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Cargar más publicaciones
        </button>
      </div>
    </div>
  );
}
