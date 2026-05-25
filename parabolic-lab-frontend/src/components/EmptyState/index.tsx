"use client";
import { Button } from "amvasdev-ui";

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  emoji,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
      <span className="text-5xl select-none">{emoji}</span>
      <h2 className="text-lg font-semibold text-base-content/80 text-center">
        {title}
      </h2>
      <p className="text-sm text-base-content/50 text-center max-w-sm leading-relaxed">
        {subtitle}
      </p>
      {onAction && actionLabel ? (
        <Button
          variant="primary"
          onClick={onAction}
          className="active:scale-95"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};

export default EmptyState;
