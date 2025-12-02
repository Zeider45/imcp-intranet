'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Pin,
  PinOff,
  Lock,
  Unlock,
  MessageCircle,
  TrendingUp,
  Clock,
  FolderOpen,
  Settings,
  Users,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { forumCategoryApi, forumPostApi } from '@/lib/api';
import type { ForumCategory, ForumPost, PaginatedResponse } from '@/lib/api/types';

const colorOptions = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'red', label: 'Rojo', class: 'bg-red-500' },
  { value: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' },
  { value: 'purple', label: 'Púrpura', class: 'bg-purple-500' },
  { value: 'orange', label: 'Naranja', class: 'bg-orange-500' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-500' },
  { value: 'cyan', label: 'Cian', class: 'bg-cyan-500' },
];

const getColorClass = (color: string): string => {
  const colorOption = colorOptions.find(c => c.value === color);
  return colorOption?.class || 'bg-blue-500';
};

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [activeTab, setActiveTab] = useState('categories');
  const [adminTab, setAdminTab] = useState('categories');
  
  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isViewPostDialogOpen, setIsViewPostDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'MessageSquare',
    color: 'blue',
    is_active: true,
    order: 0,
  });
  
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
      search?: string;
    } = { main_posts_only: true };
    if (categoryId) params.category = categoryId;
    if (searchTerm) params.search = searchTerm;
    
    const response = await forumPostApi.list(params);
    if (response.data) {
      setPosts((response.data as PaginatedResponse<ForumPost>).results || []);
    }
    setLoading(false);
  }, [searchTerm]);

  // Fetch replies for a post
  const fetchReplies = useCallback(async (postId: number) => {
    const response = await forumPostApi.getReplies(postId);
    if (response.data) {
      setReplies((response.data as PaginatedResponse<ForumPost>).results || []);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (activeTab === 'posts' || activeTab === 'admin') {
      fetchPosts(selectedCategory?.id);
    }
  }, [activeTab, selectedCategory, fetchPosts]);

  // Category handlers
  const handleCreateCategory = async () => {
    setIsSubmitting(true);
    try {
      const response = isEditMode && selectedCategory
        ? await forumCategoryApi.update(selectedCategory.id, categoryForm)
        : await forumCategoryApi.create(categoryForm);
      
      if (response.data) {
        setIsCategoryDialogOpen(false);
        resetCategoryForm();
        fetchCategories();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta categoría? Se eliminarán todos los posts asociados.')) {
      await forumCategoryApi.delete(id);
      fetchCategories();
    }
  };

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

  const handleDeletePost = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este post? Se eliminarán todas las respuestas asociadas.')) {
      await forumPostApi.delete(id);
      fetchPosts(selectedCategory?.id);
    }
  };

  const handleViewPost = async (post: ForumPost) => {
    await forumPostApi.incrementViews(post.id);
    setSelectedPost(post);
    fetchReplies(post.id);
    setIsViewPostDialogOpen(true);
  };

  const handleTogglePin = async (post: ForumPost) => {
    await forumPostApi.togglePin(post.id);
    fetchPosts(selectedCategory?.id);
  };

  const handleToggleLock = async (post: ForumPost) => {
    await forumPostApi.toggleLock(post.id);
    fetchPosts(selectedCategory?.id);
  };

  // Form reset functions
  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: 'MessageSquare',
      color: 'blue',
      is_active: true,
      order: 0,
    });
    setIsEditMode(false);
  };

  const resetPostForm = () => {
    setPostForm({
      title: '',
      content: '',
      category: selectedCategory?.id || 0,
    });
    setIsEditMode(false);
  };

  const openEditCategory = (category: ForumCategory) => {
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon || 'MessageSquare',
      color: category.color,
      is_active: category.is_active,
      order: category.order,
    });
    setSelectedCategory(category);
    setIsEditMode(true);
    setIsCategoryDialogOpen(true);
  };

  const openEditPost = (post: ForumPost) => {
    setPostForm({
      title: post.title,
      content: post.content,
      category: post.category,
    });
    setSelectedPost(post);
    setIsEditMode(true);
    setIsPostDialogOpen(true);
  };

  const selectCategory = (category: ForumCategory) => {
    setSelectedCategory(category);
    setActiveTab('posts');
    fetchPosts(category.id);
  };

  const totalPosts = categories.reduce((sum, cat) => sum + cat.posts_count, 0);
  const activeCategories = categories.filter(c => c.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            Foro de Discusión
          </h1>
          <p className="text-muted-foreground mt-1">
            Espacio de discusión y colaboración entre empleados
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('admin')}
            className={activeTab === 'admin' ? 'bg-accent' : ''}
          >
            <Settings className="h-4 w-4 mr-2" />
            Administrar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FolderOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categorías</p>
                <p className="text-2xl font-bold">{activeCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{totalPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posts Fijados</p>
                <p className="text-2xl font-bold">{posts.filter(p => p.is_pinned).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Participantes</p>
                <p className="text-2xl font-bold">{new Set(posts.map(p => p.author)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="posts">Publicaciones</TabsTrigger>
          <TabsTrigger value="admin">Administración</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.filter(c => c.is_active).map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => selectCategory(category)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getColorClass(category.color)} text-white`}>
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {category.posts_count} publicaciones
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                {category.description && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          {categories.filter(c => c.is_active).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay categorías disponibles</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Vaya a Administración para crear categorías
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  {selectedCategory && (
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedCategory(null);
                      setActiveTab('categories');
                    }}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <div>
                    <CardTitle>
                      {selectedCategory ? selectedCategory.name : 'Todas las Publicaciones'}
                    </CardTitle>
                    <CardDescription>
                      {selectedCategory?.description || 'Mostrando publicaciones de todas las categorías'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar publicaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={() => fetchPosts(selectedCategory?.id)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => {
                    if (selectedCategory) {
                      setPostForm({ ...postForm, category: selectedCategory.id });
                    }
                    setIsPostDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Publicación
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron publicaciones</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      if (selectedCategory) {
                        setPostForm({ ...postForm, category: selectedCategory.id });
                      }
                      setIsPostDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primera publicación
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div 
                      key={post.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleViewPost(post)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {post.is_pinned && (
                              <Badge variant="secondary" className="gap-1">
                                <Pin className="h-3 w-3" />
                                Fijado
                              </Badge>
                            )}
                            {post.is_locked && (
                              <Badge variant="outline" className="gap-1">
                                <Lock className="h-3 w-3" />
                                Bloqueado
                              </Badge>
                            )}
                            <Badge variant="outline">{post.category_name}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {post.author_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(post.created_at).toLocaleDateString('es-ES')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views_count} vistas
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.replies_count} respuestas
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            onClick={() => openEditPost(post)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            onClick={() => handleDeletePost(post.id)}
                            className="text-destructive hover:text-destructive"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Administración del Foro
              </CardTitle>
              <CardDescription>
                Gestione categorías y modere las publicaciones del foro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={adminTab} onValueChange={setAdminTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="categories">Categorías</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                </TabsList>

                {/* Admin Categories */}
                <TabsContent value="categories">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      {categories.length} categoría(s)
                    </p>
                    <Button onClick={() => {
                      resetCategoryForm();
                      setIsCategoryDialogOpen(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Categoría
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Orden</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Posts</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.order}</TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            <div className={`w-6 h-6 rounded ${getColorClass(category.color)}`} />
                          </TableCell>
                          <TableCell>{category.posts_count}</TableCell>
                          <TableCell>
                            <Badge variant={category.is_active ? 'default' : 'secondary'}>
                              {category.is_active ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                onClick={() => openEditCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Admin Posts */}
                <TabsContent value="posts">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        {posts.length} publicación(es)
                      </p>
                      <Select 
                        value={selectedCategory?.id?.toString() || 'all'} 
                        onValueChange={(v) => {
                          if (v === 'all') {
                            setSelectedCategory(null);
                            fetchPosts();
                          } else {
                            const cat = categories.find(c => c.id === parseInt(v));
                            setSelectedCategory(cat || null);
                            fetchPosts(parseInt(v));
                          }
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Filtrar por categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" onClick={() => fetchPosts(selectedCategory?.id)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Vistas</TableHead>
                        <TableHead>Respuestas</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {post.title}
                          </TableCell>
                          <TableCell>{post.category_name}</TableCell>
                          <TableCell>{post.author_name}</TableCell>
                          <TableCell>{post.views_count}</TableCell>
                          <TableCell>{post.replies_count}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {post.is_pinned && (
                                <Badge variant="secondary" className="text-xs">
                                  <Pin className="h-3 w-3" />
                                </Badge>
                              )}
                              {post.is_locked && (
                                <Badge variant="outline" className="text-xs">
                                  <Lock className="h-3 w-3" />
                                </Badge>
                              )}
                              {!post.is_pinned && !post.is_locked && (
                                <span className="text-muted-foreground text-xs">Normal</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                onClick={() => handleViewPost(post)}
                                title="Ver"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                onClick={() => handleTogglePin(post)}
                                title={post.is_pinned ? 'Desfijar' : 'Fijar'}
                              >
                                {post.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                onClick={() => handleToggleLock(post)}
                                title={post.is_locked ? 'Desbloquear' : 'Bloquear'}
                              >
                                {post.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                onClick={() => openEditPost(post)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeletePost(post.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Actualice la información de la categoría' : 'Cree una nueva categoría para el foro'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre *</label>
              <Input
                placeholder="Nombre de la categoría"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                placeholder="Descripción de la categoría..."
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <Select 
                  value={categoryForm.color} 
                  onValueChange={(v) => setCategoryForm({ ...categoryForm, color: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.class}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Orden</label>
                <Input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={categoryForm.is_active}
                onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm">Categoría activa</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory} disabled={isSubmitting || !categoryForm.name}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                isEditMode ? 'Guardar Cambios' : 'Crear Categoría'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
