"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Trash2,
  Edit,
  Pin,
  PinOff,
  RefreshCw,
  Plus,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { forumCategoryApi, forumPostApi } from '@/lib/api';
import type { ForumCategory, ForumPost, PaginatedResponse } from '@/lib/api/types';
import { colorOptions, getColorClass } from '@/lib/forum-utils';

export default function AdminPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
  
  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
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
  
  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    forumName: 'ForoTech',
    forumDescription: 'Comunidad de tecnología y desarrollo',
  });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    const response = await forumCategoryApi.list();
    if (response.data) {
      setCategories((response.data as PaginatedResponse<ForumCategory>).results || []);
    }
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async (categoryId?: number) => {
    setLoading(true);
    const params: {
      main_posts_only?: boolean;
      category?: number;
      search?: string;
    } = { main_posts_only: true };
    if (categoryId) params.category = categoryId;
    if (searchQuery) params.search = searchQuery;
    
    const response = await forumPostApi.list(params);
    if (response.data) {
      setPosts((response.data as PaginatedResponse<ForumPost>).results || []);
    }
    setLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

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

  const handleDeletePost = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este post? Se eliminarán todas las respuestas asociadas.')) {
      await forumPostApi.delete(id);
      fetchPosts(selectedCategory?.id);
    }
  };

  const handleTogglePin = async (post: ForumPost) => {
    await forumPostApi.togglePin(post.id);
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
    setSelectedCategory(null);
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

  // Compute stats
  const totalPosts = categories.reduce((sum, cat) => sum + cat.posts_count, 0);
  const uniqueAuthors = new Set(posts.map(p => p.author)).size;
  const newPostsToday = posts.filter(p => {
    const today = new Date().toDateString();
    return new Date(p.created_at).toDateString() === today;
  }).length;

  const stats = [
    { label: "Total Temas", value: totalPosts.toLocaleString() },
    { label: "Usuarios Activos", value: uniqueAuthors.toString() },
    { label: "Categorías Activas", value: categories.filter(c => c.is_active).length.toString() },
    { label: "Nuevos Hoy", value: newPostsToday.toString() },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/forum">Volver al Foro</Link>
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarImage src="/admin-interface.svg" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="threads" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="threads">Temas</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Threads Tab */}
        <TabsContent value="threads" className="space-y-4">
          <Card>
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-foreground">Gestión de Temas</h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar temas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button variant="outline" onClick={() => fetchPosts()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vistas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay temas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((thread) => (
                    <TableRow key={thread.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {thread.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                          <span className="font-medium truncate max-w-[200px]">{thread.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{thread.author_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{thread.category_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={thread.is_locked ? "secondary" : "default"}>
                          {thread.is_locked ? "Bloqueado" : "Publicado"}
                        </Badge>
                      </TableCell>
                      <TableCell>{thread.views_count}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Acciones
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleTogglePin(thread)}>
                              {thread.is_pinned ? (
                                <>
                                  <PinOff className="h-4 w-4 mr-2" />
                                  Desanclar
                                </>
                              ) : (
                                <>
                                  <Pin className="h-4 w-4 mr-2" />
                                  Anclar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePost(thread.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-foreground">Gestión de Categorías</h2>
                <Button onClick={() => {
                  resetCategoryForm();
                  setIsCategoryDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              </div>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Acciones
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditCategory(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Configuración General</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nombre del Foro</label>
                  <Input 
                    value={settingsForm.forumName} 
                    onChange={(e) => setSettingsForm({...settingsForm, forumName: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Descripción</label>
                  <Input 
                    value={settingsForm.forumDescription}
                    onChange={(e) => setSettingsForm({...settingsForm, forumDescription: e.target.value})}
                    className="mt-1" 
                  />
                </div>
                <Button className="w-full">Guardar Cambios</Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Moderación</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Auto-moderación</p>
                    <p className="text-sm text-muted-foreground">Detectar spam automáticamente</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Activar
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Aprobación manual</p>
                    <p className="text-sm text-muted-foreground">Revisar antes de publicar</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Desactivar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
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
    </div>
  )
}
