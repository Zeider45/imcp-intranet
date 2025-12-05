interface RecentActivityItemProps {
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

export function RecentActivityItem({
  title,
  description,
  time,
  icon,
  color,
}: RecentActivityItemProps) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-${color}/10 text-xl`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm text-card-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}
