'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Plus,
  MoreVertical,
} from 'lucide-react';
import { forumPostApi } from '@/lib/api';
import type { ForumPost, PaginatedResponse } from '@/lib/api/types';

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = { main_posts_only: true };
    const response = await forumPostApi.list(params);
    if (response.data) {
      setPosts((response.data as PaginatedResponse<ForumPost>).results || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleToggleLike = async (postId: number) => {
    const response = await forumPostApi.toggleLike(postId);
    if (response.data) {
      setPosts(posts.map(p => p.id === postId ? response.data as ForumPost : p));
    }
  };

  const getAuthorInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRandomGradient = (id: number) => {
    const gradients = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-teal-500 to-green-500',
    ];
    return gradients[id % gradients.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Foro de Comunicación</h1>
        <p className="text-gray-600">
          Mantente al día con las novedades del banco
        </p>
      </div>

      {/* Create Post Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 text-xs font-bold">
            US
          </div>
          <Link href="/forum/admin" className="flex-1">
            <div className="px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-left hover:bg-gray-100 transition-colors cursor-pointer">
              Comparte una actualización con el equipo...
            </div>
          </Link>
          <Link href="/forum/admin">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Publicar
            </button>
          </Link>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Post Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRandomGradient(post.id)} flex items-center justify-center text-white flex-shrink-0 text-xs font-bold`}>
                {getAuthorInitials(post.author_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900">{post.author_name}</p>
                <p className="text-gray-600 text-sm">Usuario</p>
                <p className="text-gray-400 text-xs">{new Date(post.created_at).toLocaleString()}</p>
              </div>
              <Link href="/forum/admin">
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </Link>
            </div>

            {/* Post Title & Content */}
            {post.title && (
              <h3 className="text-gray-900 font-medium mb-2">{post.title}</h3>
            )}
            <p className="text-gray-700 mb-4 whitespace-pre-line">{post.content}</p>

            {/* Post Stats */}
            <div className="flex items-center gap-6 py-3 border-t border-b border-gray-200 mb-3">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <ThumbsUp className="w-4 h-4" />
                <span>{post.likes_count || 0} Me gusta</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MessageCircle className="w-4 h-4" />
                <span>{post.replies_count || 0} Comentarios</span>
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleLike(post.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  post.user_has_liked
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>Me gusta</span>
              </button>
              <Link href={`/forum/admin#post-${post.id}`} className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Comentar</span>
                </button>
              </Link>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
                <span>Compartir</span>
              </button>
            </div>

            {/* Comments Section */}
            {post.replies_count > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href={`/forum/admin#post-${post.id}`}>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    Ver todos los comentarios ({post.replies_count})
                  </button>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {posts.length > 0 && (
        <div className="mt-6 text-center">
          <button 
            onClick={fetchPosts}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cargar más publicaciones
          </button>
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No hay publicaciones aún</p>
        </div>
      )}
    </div>
  );
}
