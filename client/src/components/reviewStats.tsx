import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CourseInfo } from "../misc/types";
import { Skeleton } from "@mantine/core";
import { AppDispatch } from "../../app/store";
import { useDispatch } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";
import { setSelectedDifficulty } from "../hooks/useDifficulty";
import { setSelectedHours } from "../hooks/useHours";
import { getDifficultyColor } from "./ui/chart";

const difficultyLabels = ["Easy", "Medium", "Hard", "Very hard", "Insane"];
const hoursLabels = ["0-5", "6-12", "13-18", "18+"];
const hoursColors = ["#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6"];
const pairingColor = "#d73f09";

type StatRow = { label: string; count: number; color: string; onClick: () => void };

function AccordionSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between w-full px-5 py-4 text-left"
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-500">
          {title}
        </span>
        <span className="text-lg text-gray-400 leading-none">
          {open ? "−" : "+"}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBar({ rows }: { rows: StatRow[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <button
          key={row.label}
          onClick={row.onClick}
          className="flex items-center gap-3 w-full text-left"
        >
          <span className="w-20 shrink-0 text-sm text-gray-700 truncate">
            {row.label}
          </span>
          <span className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <span
              className="block h-full rounded-full"
              style={{ width: `${(row.count / max) * 100}%`, backgroundColor: row.color }}
            />
          </span>
          <span className="w-10 shrink-0 text-right text-sm text-gray-500 tabular-nums">
            {row.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export function ReviewStats({
  data,
  isLoading,
}: {
  data: CourseInfo[];
  isLoading: boolean;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const items = Array.isArray(data) ? data : [];

  const difficultyRows: StatRow[] = difficultyLabels.map((label, index) => ({
    label,
    count: items.filter((item) => item.course_difficulty === index + 1).length,
    color: getDifficultyColor(index + 1),
    onClick: () => dispatch(setSelectedDifficulty(String(index + 1))),
  }));

  const hoursRows: StatRow[] = hoursLabels.map((label, index) => ({
    label,
    count: items.filter(
      (item) => item.course_time_spent_per_week === `${label} hours`
    ).length,
    color: hoursColors[index],
    onClick: () => dispatch(setSelectedHours(`${label} hours`)),
  }));

  const pairCounts = items.reduce<Record<string, number>>((acc, item) => {
    (item.pairs || []).forEach((pair) => {
      acc[pair] = (acc[pair] || 0) + 1;
    });
    return acc;
  }, {});

  const pairingRows: StatRow[] = Object.entries(pairCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pair, count]) => ({
      label: pair.split(" - ")[0],
      count,
      color: pairingColor,
      onClick: () => dispatch(setSelectedCourse(pair)),
    }));

  return (
    <div className="order-1 md:order-2 w-full md:w-[300px] shrink-0 md:h-full overflow-y-auto no-scrollbar flex flex-col gap-8">
      {/* Mobile accordion */}
      <div className="sm:hidden border border-gray-200 bg-[#efece2]">
        <Skeleton visible={isLoading}>
          <AccordionSection title="Difficulty Distribution" defaultOpen>
            <StatBar rows={difficultyRows} />
          </AccordionSection>
        </Skeleton>

        <AccordionSection title="Hours Per Week">
          <StatBar rows={hoursRows} />
        </AccordionSection>

        {pairingRows.length > 0 && (
          <AccordionSection title="Most Common Pairings">
            <StatBar rows={pairingRows} />
          </AccordionSection>
        )}
      </div>

      {/* Tablet / desktop flat layout */}
      <div className="hidden sm:flex flex-col gap-8">
        <Skeleton visible={isLoading}>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">
              Difficulty Distribution
            </p>
            <StatBar rows={difficultyRows} />
          </div>
        </Skeleton>

        <Skeleton visible={isLoading}>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">
              Hours Per Week
            </p>
            <StatBar rows={hoursRows} />
          </div>
        </Skeleton>

        {pairingRows.length > 0 && (
          <Skeleton visible={isLoading}>
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                Most Common Pairings
              </p>
              <StatBar rows={pairingRows} />
            </div>
          </Skeleton>
        )}
      </div>

      <div className="pt-6 border-t border-gray-200">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
          About This Data
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Self-reported by students after the term ends. Difficulty is a 1–5
          scale; hours are a weekly average across the term.
        </p>
      </div>
    </div>
  );
}
