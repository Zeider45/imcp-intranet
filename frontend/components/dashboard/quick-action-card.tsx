import { type LucideIcon } from 'lucide-react';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: string;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  color = "primary",
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-md hover:scale-105 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-${color}/10 text-${color}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
