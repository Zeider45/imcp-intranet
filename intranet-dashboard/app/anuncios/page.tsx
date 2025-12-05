import { PageHeader } from "@/components/common/page-header";
import { AnnouncementCard } from "@/components/modules/announcements/announcement-card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

const announcements = [
  {
    id: 1,
    title: "Nueva Política de Trabajo Remoto",
    content: "A partir del próximo mes, implementaremos un modelo híbrido que permite trabajar desde casa 2 días a la semana.",
    author: "Recursos Humanos",
    date: "2025-03-10",
    category: "Política",
    priority: "high" as const,
    views: 245,
  },
  {
    id: 2,
    title: "Actualización del Sistema de Nómina",
    content: "El sistema de nómina estará en mantenimiento el próximo viernes de 6 PM a 10 PM.",
    author: "Tecnología",
    date: "2025-03-12",
    category: "Tecnología",
    priority: "medium" as const,
    views: 189,
  },
  {
    id: 3,
    title: "Celebración de Aniversario",
    content: "Los invitamos a celebrar el 25° aniversario de IMCP el próximo 22 de marzo a las 6 PM.",
    author: "Eventos",
    date: "2025-03-08",
    category: "Evento",
    priority: "low" as const,
    views: 312,
  },
  {
    id: 4,
    title: "Nuevo Programa de Capacitación",
    content: "Inscripciones abiertas para el programa de desarrollo de liderazgo 2025.",
    author: "Recursos Humanos",
    date: "2025-03-07",
    category: "Formación",
    priority: "medium" as const,
    views: 156,
  },
];

export default function AnunciosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Anuncios"
        description="Comunicados y noticias de la organización"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Anuncio
          </Button>
        }
      />

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>
    </div>
  );
}
