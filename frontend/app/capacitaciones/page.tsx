'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  GraduationCap,
  RefreshCw,
  Award,
  XCircle
} from 'lucide-react';
import { trainingSessionApi, trainingAttendanceApi } from '@/lib/api';
import type { TrainingSession, TrainingAttendance } from '@/lib/api/types';

interface CapacitacionWithAttendance {
  session: TrainingSession;
  attendance?: TrainingAttendance;
}

export default function CapacitacionesPage() {
  const [userTab, setUserTab] = useState<'pendientes' | 'completadas' | 'calendario'>('pendientes');
  
  // User view state
  const [loading, setLoading] = useState(true);
  const [pendientes, setPendientes] = useState<CapacitacionWithAttendance[]>([]);
  const [completadas, setCompletadas] = useState<CapacitacionWithAttendance[]>([]);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedAttendanceToDecline, setSelectedAttendanceToDecline] = useState<number | null>(null);

  // Fetch data for user view
  const fetchUserTrainings = useCallback(async () => {
    setLoading(true);
    try {
      const attendancesResponse = await trainingAttendanceApi.myInvitations();
      
      if (attendancesResponse.data) {
        const attendances = attendancesResponse.data;
        
        const sessionPromises = attendances.map(attendance => 
          trainingSessionApi.get(attendance.session)
        );
        
        const sessionsResponses = await Promise.all(sessionPromises);
        
        const combinedData = sessionsResponses
          .map((response, index) => {
            if (!response.data) return null;
            return {
              session: response.data,
              attendance: attendances[index],
            } as CapacitacionWithAttendance;
          })
          .filter((item): item is CapacitacionWithAttendance => item !== null);
        
        const now = new Date();
        const pending = combinedData.filter(
          item => new Date(item.session.start_datetime) >= now && 
                 item.session.status !== 'completed' && 
                 item.attendance?.confirmation_status !== 'declined'
        );
        
        const completed = combinedData.filter(
          item => item.session.status === 'completed' ||
                 item.attendance?.attendance_status === 'present'
        );
        
        setPendientes(pending);
        setCompletadas(completed);
      }
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserTrainings();
  }, [fetchUserTrainings]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirmAttendance = async (attendanceId: number) => {
    try {
      await trainingAttendanceApi.confirmAttendance(attendanceId);
      fetchUserTrainings();
    } catch (error) {
      console.error('Error confirming attendance:', error);
    }
  };

  const handleDeclineAttendance = async () => {
    if (!selectedAttendanceToDecline || !declineReason.trim()) return;
    
    try {
      await trainingAttendanceApi.declineAttendance(selectedAttendanceToDecline, declineReason);
      setIsDeclineDialogOpen(false);
      setDeclineReason('');
      setSelectedAttendanceToDecline(null);
      fetchUserTrainings();
    } catch (error) {
      console.error('Error declining attendance:', error);
    }
  };

  const openDeclineDialog = (attendanceId: number) => {
    setSelectedAttendanceToDecline(attendanceId);
    setDeclineReason('');
    setIsDeclineDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          Mis Capacitaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Revisa tus cursos pendientes, completados y calendario
        </p>
      </div>

      <Tabs value={userTab} onValueChange={(v) => setUserTab(v as typeof userTab)}>
        <TabsList>
          <TabsTrigger value="pendientes">
            <Clock className="h-4 w-4 mr-2" />
            Pendientes ({pendientes.length})
          </TabsTrigger>
          <TabsTrigger value="completadas">
            <Award className="h-4 w-4 mr-2" />
            Completadas ({completadas.length})
          </TabsTrigger>
          <TabsTrigger value="calendario">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendientes.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    No tienes cursos pendientes en este momento.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendientes.map(({ session, attendance }) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <Badge variant={attendance?.confirmation_status === 'confirmed' ? 'default' : 'secondary'}>
                        {attendance?.confirmation_status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(session.start_datetime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(session.start_datetime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Instructor: {session.instructor_name}</span>
                      </div>
                    </div>
                    {attendance && attendance.confirmation_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleConfirmAttendance(attendance.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => openDeclineDialog(attendance.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Declinar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completadas" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : completadas.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    No has completado ningún curso aún.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completadas.map(({ session, attendance }) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CheckCircle className="h-6 w-6 text-chart-3" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(session.start_datetime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Instructor: {session.instructor_name}</span>
                      </div>
                    </div>
                    {attendance?.evaluation_score && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Calificación</span>
                          <span className="font-semibold text-foreground">{attendance.evaluation_score}/100</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-chart-3 h-2 rounded-full transition-all"
                            style={{ width: `${attendance.evaluation_score}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {attendance?.certificate_issued && (
                      <Button variant="outline" className="w-full">
                        <Award className="h-4 w-4 mr-2" />
                        Ver Certificado
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendario" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Capacitaciones</CardTitle>
              <CardDescription>
                Visualiza todas tus capacitaciones programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...pendientes, ...completadas]
                  .sort((a, b) => new Date(a.session.start_datetime).getTime() - new Date(b.session.start_datetime).getTime())
                  .map(({ session, attendance }) => (
                    <div key={session.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg p-3 min-w-[80px]">
                        <span className="text-2xl font-bold">
                          {new Date(session.start_datetime).getDate()}
                        </span>
                        <span className="text-xs uppercase">
                          {new Date(session.start_datetime).toLocaleDateString('es-ES', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{session.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(session.start_datetime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </span>
                        </div>
                      </div>
                      <div>
                        {session.status === 'completed' ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completada
                          </Badge>
                        ) : attendance?.confirmation_status === 'confirmed' ? (
                          <Badge variant="default">Confirmada</Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Decline Attendance Dialog */}
      <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Declinar Asistencia</DialogTitle>
            <DialogDescription>
              Por favor, indica el motivo por el cual no puedes asistir a esta capacitación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Escribe el motivo de tu ausencia..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeclineDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDeclineAttendance}
              disabled={!declineReason.trim()}
              variant="destructive"
            >
              Declinar Asistencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
