import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

export function ForumPosts() {
  const posts = [
    {
      id: 1,
      author: 'Ana Martínez',
      position: 'Gerente de Operaciones',
      time: 'Hace 1 hora',
      content: '¡Felicitaciones al equipo de atención al cliente por alcanzar el 98% de satisfacción este mes! 🎉',
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      author: 'Roberto Silva',
      position: 'Director de Recursos Humanos',
      time: 'Hace 3 horas',
      content: 'Recordatorio: La capacitación de seguridad bancaria es obligatoria para todos los empleados. Fecha límite: 20 de diciembre.',
      likes: 15,
      comments: 3,
    },
    {
      id: 3,
      author: 'Laura Fernández',
      position: 'Coordinadora de Comunicaciones',
      time: 'Hace 5 horas',
      content: 'Ya está disponible el boletín informativo de noviembre en la biblioteca de documentos. ¡No olviden revisarlo!',
      likes: 12,
      comments: 5,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-gray-900 mb-6">Últimas Publicaciones del Foro</h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                {post.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-gray-900">{post.author}</p>
                  <span className="text-gray-400">·</span>
                  <p className="text-gray-600">{post.time}</p>
                </div>
                <p className="text-gray-600">{post.position}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
