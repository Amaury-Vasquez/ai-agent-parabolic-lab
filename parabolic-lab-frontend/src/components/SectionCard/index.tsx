import { ReactNode } from "react";

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

const SectionCard = ({
  icon,
  title,
  description,
  action,
  children,
}: SectionCardProps) => (
  <section className="rounded-2xl bg-base-200 border border-base-300 p-5 md:p-7 shadow-sm">
    <header className="flex items-start justify-between gap-3 mb-5 flex-wrap">
      <div className="flex items-start gap-3 min-w-0">
        <div className="rounded-xl bg-primary/15 text-primary p-2.5">{icon}</div>
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold leading-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-sm opacity-70 mt-1">{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </header>
    {children}
  </section>
);

export default SectionCard;
