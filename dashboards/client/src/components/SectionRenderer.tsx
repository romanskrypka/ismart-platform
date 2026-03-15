import { Section } from '@/lib/dashboardData';
import CodeBlock from './CodeBlock';
import QuizCard from './QuizCard';
import DataTable from './DataTable';
import { motion } from 'framer-motion';

interface SectionRendererProps {
  section: Section;
  index: number;
  accentColor: string;
}

export default function SectionRenderer({ section, index, accentColor }: SectionRendererProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.5, delay: 0.05 },
  };

  return (
    <motion.div {...fadeIn} id={section.id} className="scroll-mt-24">
      {section.type === 'quiz' && section.quizData ? (
        <QuizCard
          question={section.quizData.question}
          options={section.quizData.options}
          correctIndex={section.quizData.correctIndex}
          explanation={section.quizData.explanation}
          accentColor={accentColor}
        />
      ) : (
        <div>
          <h3 className="font-[var(--font-display)] text-xl font-bold text-foreground mb-4 flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {index + 1}
            </span>
            {section.title}
          </h3>

          {section.type === 'code' ? (
            <CodeBlock code={section.content} language={section.codeLanguage} />
          ) : section.type === 'table' || section.type === 'comparison' ? (
            <div className="space-y-4">
              {section.content && (
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              )}
              {section.tableData && (
                <DataTable
                  headers={section.tableData.headers}
                  rows={section.tableData.rows}
                  accentColor={accentColor}
                />
              )}
            </div>
          ) : (
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
