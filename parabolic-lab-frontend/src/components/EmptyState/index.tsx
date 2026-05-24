"use client";
import { Button } from "amvasdev-ui";

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <span className="text-6xl">{emoji}</span>
      <h3 className="text-xl font-semibold text-base-content/70">{title}</h3>
      <p className="text-sm text-base-content/50 text-center max-w-xs">{subtitle}</p>
      {onAction && actionLabel ? (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};

export default EmptyState;
