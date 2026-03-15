import { Section } from '@/lib/dashboardData';

interface ProgressTrackerProps {
  sections: Section[];
  activeSection: string;
  accentColor: string;
  onSectionClick: (id: string) => void;
}

export default function ProgressTracker({ sections, activeSection, accentColor, onSectionClick }: ProgressTrackerProps) {
  return (
    <nav className="hidden xl:block sticky top-24 w-56 shrink-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Содержание
      </p>
      <div className="flex flex-col gap-0.5">
        {sections.map((s, i) => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSectionClick(s.id)}
              className={`
                text-left text-xs py-1.5 pl-3 border-l-2 transition-all leading-snug
                ${isActive
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
                }
              `}
              style={isActive ? { borderColor: accentColor, color: accentColor } : {}}
            >
              {s.title}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
