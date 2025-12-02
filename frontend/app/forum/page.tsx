'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Plus, 
  Eye,
  RefreshCw,
  Pin,
  Lock,
  MessageCircle,
  TrendingUp,
  Clock,
  Users,
} from 'lucide-react';
import { forumCategoryApi, forumPostApi } from '@/lib/api';
import type { ForumCategory, ForumPost, PaginatedResponse } from '@/lib/api/types';
import { getCategoryColor, getAuthorAvatar } from '@/lib/forum-utils';

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  
  // Dialog states
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isViewPostDialogOpen, setIsViewPostDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    category: 0,
  });
  
  const [replyForm, setReplyForm] = useState({
    content: '',
  });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    const response = await forumCategoryApi.list();
    if (response.data) {
      setCategories((response.data as PaginatedResponse<ForumCategory>).results || []);
    }
  }, []);

  // Fetch posts by category
  const fetchPosts = useCallback(async (categoryId?: number) => {
    setLoading(true);
    const params: {
      main_posts_only?: boolean;
      category?: number;
    } = { main_posts_only: true };
    if (categoryId) params.category = categoryId;
    
    const response = await forumPostApi.list(params);
    if (response.data) {
      setPosts((response.data as PaginatedResponse<ForumPost>).results || []);
    }
    setLoading(false);
  }, []);

  // Fetch replies for a post
  const fetchReplies = useCallback(async (postId: number) => {
    const response = await forumPostApi.getReplies(postId);
    if (response.data) {
      setReplies((response.data as PaginatedResponse<ForumPost>).results || []);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

  // Post handlers
  const handleCreatePost = async () => {
    setIsSubmitting(true);
    try {
      const response = isEditMode && selectedPost
        ? await forumPostApi.update(selectedPost.id, postForm)
        : await forumPostApi.create(postForm);
      
      if (response.data) {
        setIsPostDialogOpen(false);
        resetPostForm();
        fetchPosts(selectedCategory?.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReply = async () => {
    if (!selectedPost) return;
    setIsSubmitting(true);
    try {
      const response = await forumPostApi.create({
        title: `Re: ${selectedPost.title}`,
        content: replyForm.content,
        category: selectedPost.category,
        parent_post: selectedPost.id,
      });
      
      if (response.data) {
        setIsReplyDialogOpen(false);
        setReplyForm({ content: '' });
        fetchReplies(selectedPost.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPost = async (post: ForumPost) => {
    await forumPostApi.incrementViews(post.id);
    setSelectedPost(post);
    fetchReplies(post.id);
    setIsViewPostDialogOpen(true);
  };

  // Form reset functions
  const resetPostForm = () => {
    setPostForm({
      title: '',
      content: '',
      category: selectedCategory?.id || 0,
    });
    setIsEditMode(false);
  };

  const selectCategory = (category: ForumCategory) => {
    setSelectedCategory(category);
    fetchPosts(category.id);
  };

  const totalPosts = categories.reduce((sum, cat) => sum + cat.posts_count, 0);
  const totalReplies = posts.reduce((sum, p) => sum + p.replies_count, 0);

  // Get unique active users (authors)
  const activeUsers = Array.from(new Set(posts.map(p => p.author_name))).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            ForoTech
          </h1>
          <p className="text-muted-foreground mt-1">
            Espacio de discusión y colaboración entre empleados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/forum/admin">Admin</Link>
          </Button>
          <Button onClick={() => {
            if (categories.length > 0) {
              setPostForm({ ...postForm, category: categories[0].id });
            }
            setIsPostDialogOpen(true);
          }}>
            Nuevo Tema
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temas Totales</p>
              <p className="text-2xl font-bold text-foreground">{totalPosts.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Miembros</p>
              <p className="text-2xl font-bold text-foreground">{new Set(posts.map(p => p.author)).size.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Respuestas</p>
              <p className="text-2xl font-bold text-foreground">{totalReplies.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Temas Recientes</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchPosts(selectedCategory?.id)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Más Recientes
              </Button>
              <Button variant="outline" size="sm">
                Más Populares
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron publicaciones</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    if (categories.length > 0) {
                      setPostForm({ ...postForm, category: categories[0].id });
                    }
                    setIsPostDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer tema
                </Button>
              </div>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewPost(post)}>
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getAuthorAvatar(post.author_name)} />
                    <AvatarFallback>{post.author_name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.is_pinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                          <h3 className="font-semibold text-foreground text-lg hover:text-primary transition-colors text-balance">
                            {post.title}
                          </h3>
                          {post.views_count > 100 && (
                            <Badge variant="destructive" className="flex-shrink-0">
                              🔥 Hot
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          por <span className="font-medium">{post.author_name}</span> en{" "}
                          <Badge variant="secondary">{post.category_name}</Badge>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.replies_count} respuestas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{post.views_count} vistas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(post.created_at).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Categorías</h3>
            <div className="space-y-3">
              {categories.filter(c => c.is_active).map((category, idx) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent hover:bg-accent/80 cursor-pointer transition-colors"
                  onClick={() => selectCategory(category)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(idx)}`} />
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                  <Badge variant="secondary">{category.posts_count}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Usuarios Activos</h3>
            <div className="space-y-3">
              {activeUsers.length > 0 ? activeUsers.map((user) => (
                <div key={user} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAuthorAvatar(user)} />
                    <AvatarFallback>{user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-muted-foreground">En línea</span>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No hay usuarios activos</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Publicación' : 'Nueva Publicación'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Actualice el contenido de la publicación' : 'Cree una nueva publicación en el foro'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría *</label>
              <Select 
                value={postForm.category?.toString() || ''} 
                onValueChange={(v) => setPostForm({ ...postForm, category: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.is_active).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Título de la publicación"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido *</label>
              <Textarea
                placeholder="Escriba el contenido de su publicación..."
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreatePost} 
              disabled={isSubmitting || !postForm.title || !postForm.content || !postForm.category}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                isEditMode ? 'Guardar Cambios' : 'Publicar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Post Dialog */}
      <Dialog open={isViewPostDialogOpen} onOpenChange={setIsViewPostDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {selectedPost?.is_pinned && (
                <Badge variant="secondary" className="gap-1">
                  <Pin className="h-3 w-3" />
                  Fijado
                </Badge>
              )}
              {selectedPost?.is_locked && (
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Bloqueado
                </Badge>
              )}
              <Badge variant="outline">{selectedPost?.category_name}</Badge>
            </div>
            <DialogTitle className="text-xl">{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              Por {selectedPost?.author_name} • {selectedPost && new Date(selectedPost.created_at).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-6 py-4">
              {/* Post content */}
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-sans">{selectedPost.content}</pre>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {selectedPost.views_count} vistas
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {selectedPost.replies_count} respuestas
                </span>
              </div>

              {/* Replies Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Respuestas ({replies.length})
                  </h4>
                  {!selectedPost.is_locked && (
                    <Button size="sm" onClick={() => setIsReplyDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Responder
                    </Button>
                  )}
                </div>
                
                {replies.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay respuestas aún. ¡Sé el primero en responder!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {replies.map((reply) => (
                      <div key={reply.id} className="p-3 bg-accent/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{reply.author_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reply.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewPostDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Responder a: {selectedPost?.title}</DialogTitle>
            <DialogDescription>
              Escriba su respuesta a esta publicación
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Escriba su respuesta..."
              value={replyForm.content}
              onChange={(e) => setReplyForm({ content: e.target.value })}
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateReply} disabled={isSubmitting || !replyForm.content}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Respuesta'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
