import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
            {trend && (
              <p
                className={`mt-2 text-xs font-medium ${
                  trend.isPositive ? "text-chart-3" : "text-destructive"
                }`}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}% vs mes anterior
              </p>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
