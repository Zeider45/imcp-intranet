import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Mail, Phone } from 'lucide-react';

interface Department {
  id: number;
  name: string;
  manager: string;
  employees: number;
  email: string;
  phone: string;
  description: string;
}

interface DepartmentCardProps {
  department: Department;
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {department.employees}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          {department.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {department.description}
        </p>

        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-sm font-medium text-foreground">
            {department.manager}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            {department.email}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {department.phone}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
