import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Profile {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

interface ProfileCardProps {
  profile: Profile;
}

const statusConfig = {
  online: { label: 'En línea', color: 'bg-chart-3' },
  offline: { label: 'Desconectado', color: 'bg-muted' },
  away: { label: 'Ausente', color: 'bg-chart-4' },
};

export function ProfileCard({ profile }: ProfileCardProps) {
  const status = statusConfig[profile.status];

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold">
              {profile.avatar}
            </div>
            <span
              className={cn(
                "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card",
                status.color
              )}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {profile.name}
            </h3>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
            <Badge variant="secondary" className="mt-2">
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            {profile.department}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            {profile.email}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {profile.phone}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
