import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Eye, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  views: number;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

const priorityConfig = {
  high: { label: 'Urgente', variant: 'destructive' as const, icon: true },
  medium: { label: 'Normal', variant: 'secondary' as const, icon: false },
  low: { label: 'Informativo', variant: 'outline' as const, icon: false },
};

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const priority = priorityConfig[announcement.priority];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-foreground">
                {announcement.title}
              </h3>
              {priority.icon && (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {announcement.content}
            </p>
          </div>
          <Badge variant={priority.variant}>{priority.label}</Badge>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {announcement.author}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(announcement.date).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {announcement.views}
            </div>
          </div>
          <Badge variant="outline">{announcement.category}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
