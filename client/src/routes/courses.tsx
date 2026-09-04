import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../misc/const";
import { Skeleton } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";
import { classType } from "../misc/utils";

type SortField = "course" | "reviews" | "difficulty" | "hours";
type ViewMode = "list" | "cards";

type Row = {
  _id: string;
  count?: number;
  avg_difficulty?: number;
  avg_hours?: number;
};

export const Route = createFileRoute("/courses")({
  component: Course,
});

function TypeBadge({ code }: { code: string }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-widest text-gray-500 shrink-0">
      {classType(code)}
    </span>
  );
}

const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <rect x="0" y="2" width="16" height="2" rx="1" />
    <rect x="0" y="7" width="16" height="2" rx="1" />
    <rect x="0" y="12" width="16" height="2" rx="1" />
  </svg>
);

const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <rect x="0" y="0" width="7" height="7" rx="1" />
    <rect x="9" y="0" width="7" height="7" rx="1" />
    <rect x="0" y="9" width="7" height="7" rx="1" />
    <rect x="9" y="9" width="7" height="7" rx="1" />
  </svg>
);

function SortArrow({ asc }: { asc: boolean }) {
  return (
    <span
      className="inline-block text-base font-bold leading-none transition-transform duration-200 ease-out"
      style={{ transform: asc ? "rotate(0deg)" : "rotate(180deg)" }}
    >
      ↑
    </span>
  );
}

function Course() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortField, setSortField] = useState<SortField>("course");
  const [sortAsc, setSortAsc] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Core" | "Elective">(
    "All"
  );

  const sortButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sortIndicatorStyle, setSortIndicatorStyle] = useState({
    transform: "translateX(0px)",
    width: "0px",
  });

  const fetchTableData = async (): Promise<Row[]> => {
    const response = await fetch(`${getAllCourses}/courses/frequency`);
    if (!response.ok) throw new Error("Failed to fetch table data");
    return response.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["tableData"],
    queryFn: fetchTableData,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(field === "course");
    }
  };

  const sortButtons: { field: SortField; label: string }[] = [
    { field: "course", label: "Course" },
    { field: "difficulty", label: "Difficulty" },
    { field: "hours", label: "Hours" },
    { field: "reviews", label: "Reviews" },
  ];

  const activeSortIndex = sortButtons.findIndex(
    (button) => button.field === sortField
  );

  useEffect(() => {
    const updateIndicator = () => {
      const button = sortButtonRefs.current[activeSortIndex];
      if (button) {
        setSortIndicatorStyle({
          transform: `translateX(${button.offsetLeft}px)`,
          width: `${button.offsetWidth}px`,
        });
      }
    };
    const handle = requestAnimationFrame(updateIndicator);
    window.addEventListener("resize", updateIndicator);
    return () => {
      cancelAnimationFrame(handle);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeSortIndex]);

  const rows = useMemo(() => {
    const items = Array.isArray(data) ? data : [];
    const num = (n: unknown, fallback = 0) =>
      Number.isFinite(Number(n)) ? Number(n) : fallback;

    const mapped = items.map((review) => {
      const course_name = review._id?.trim() || "Unknown";
      const code = course_name.split("-")[0]?.trim() || course_name;
      const title = course_name.split("-").slice(1).join("-").trim();
      const count = num(review.count);
      const diff = num(review.avg_difficulty);
      const hrs = num(review.avg_hours);
      return {
        key: course_name,
        code,
        title,
        course_name,
        count,
        diff,
        hrs,
        diffLabel: diff > 0 ? diff.toFixed(2) : "N/A",
        hrsLabel: hrs > 0 ? hrs.toFixed(1) : "N/A",
      };
    });

    return mapped.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sortField) {
        case "course":
          aVal = a.code.trim().toUpperCase();
          bVal = b.code.trim().toUpperCase();
          break;
        case "reviews":
          aVal = a.count;
          bVal = b.count;
          break;
        case "difficulty":
          aVal = a.diff;
          bVal = b.diff;
          break;
        case "hours":
          aVal = a.hrs;
          bVal = b.hrs;
          break;
      }
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortAsc]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (typeFilter !== "All" && classType(row.code) !== typeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        row.code.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.course_name.toLowerCase().includes(q)
      );
    });
  }, [rows, query, typeFilter]);

  const handleRowClick = (course_name: string) => {
    dispatch(setSelectedCourse(course_name));
    navigate({ to: "/reviews" });
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className="px-6 sm:px-10 lg:px-18 pt-20 pb-12">
        <div className="flex flex-col mb-6">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500">
            Course Reviews
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none !m-0">
            Browse courses
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mt-1">
            Difficulty, weekly hours, and workload notes from students who took
            the class.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pb-4 mb-6 border-b border-gray-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (filteredRows.length > 0) {
                handleRowClick(filteredRows[0].course_name);
              }
            }}
            className="flex flex-col gap-3 sm:flex-row sm:gap-0 w-full sm:flex-1 sm:min-w-[320px] max-w-xl sm:border sm:border-gray-300 sm:bg-white"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by code, title, or keyword"
              className="flex-1 min-w-0 px-4 py-3 sm:h-12 sm:py-0 text-base text-gray-900 placeholder:text-gray-400 outline-none border border-gray-300 bg-white sm:border-0 sm:bg-transparent"
            />
            <button
              type="submit"
              className="shrink-0 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-6 py-3 sm:py-0 sm:h-auto transition-colors"
            >
              Search
            </button>
          </form>

          {/* Mobile controls */}
          <div className="flex sm:hidden flex-col gap-4 w-full">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wide overflow-x-auto no-scrollbar">
              <span className="text-sm font-bold text-gray-500 shrink-0">Sort</span>
              {sortButtons.map(({ field, label }) => {
                const active = sortField === field;
                return (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`flex items-center gap-1 pb-0.5 !uppercase whitespace-nowrap border-b-2 transition-colors ${
                      active
                        ? "text-gray-900 font-bold border-[#d73f09]"
                        : "text-gray-500 border-transparent hover:text-gray-900"
                    }`}
                  >
                    {label}
                    {active && <SortArrow asc={sortAsc} />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              {!isLoading && (
                <span className="text-sm text-gray-600">
                  {filteredRows.length} of {rows.length} courses
                </span>
              )}
              <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest">
                <span className="text-sm font-bold text-gray-500">View</span>
                <button
                  onClick={() => setViewMode("list")}
                  className={`pb-0.5 !uppercase border-b-2 transition-colors ${
                    viewMode === "list"
                      ? "text-gray-900 font-bold border-[#d73f09]"
                      : "text-gray-500 border-transparent hover:text-gray-900"
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`pb-0.5 !uppercase border-b-2 transition-colors ${
                    viewMode === "cards"
                      ? "text-gray-900 font-bold border-[#d73f09]"
                      : "text-gray-500 border-transparent hover:text-gray-900"
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>

          {/* Tablet / desktop controls */}
          <div className="hidden sm:flex sm:flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest">
              <span className="text-sm font-bold text-gray-500">Sort</span>
              <div className="relative flex items-center gap-4">
                <div
                  className="absolute bottom-0 left-0 h-0.5 bg-[#d73f09] rounded-full transition-all duration-300 ease-out"
                  style={sortIndicatorStyle}
                />
                {sortButtons.map(({ field, label }, index) => {
                  const active = sortField === field;
                  return (
                    <button
                      key={field}
                      ref={(el) => (sortButtonRefs.current[index] = el)}
                      onClick={() => handleSort(field)}
                      className={`flex items-center gap-1 pb-0.5 !uppercase transition-colors ${
                        active
                          ? "text-gray-900 font-bold"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {label}
                      {active && <SortArrow asc={sortAsc} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest">
              <span className="text-sm font-bold text-gray-500">Type</span>
              <div className="flex border border-gray-300">
                {(["All", "Core", "Elective"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 !uppercase transition-colors ${
                      typeFilter === type
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
              <span className="text-sm font-bold text-gray-500">View</span>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                title="List view"
                className={`transition-colors ${
                  viewMode === "list"
                    ? "text-[#d73f09]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <ListIcon />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                aria-label="Cards view"
                title="Cards view"
                className={`transition-colors ${
                  viewMode === "cards"
                    ? "text-[#d73f09]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <GridIcon />
              </button>
            </div>

            {!isLoading && (
              <span className="text-sm text-gray-600">
                {filteredRows.length} of {rows.length} courses
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={64} radius="sm" />
            ))}
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-semibold text-gray-900">No courses match</p>
            <p className="text-sm text-gray-600 mt-1">
              Try a different code, title, or keyword.
            </p>
          </div>
        ) : viewMode === "list" ? (
          <>
            {/* Mobile list */}
            <div className="sm:hidden">
              {filteredRows.map((row) => (
                <button
                  key={row.key}
                  onClick={() => handleRowClick(row.course_name)}
                  className="block w-full text-left py-5 border-b border-gray-200 group"
                >
                  <div className="flex items-baseline gap-2 mb-1.5 min-w-0">
                    <span className="font-mono font-bold text-gray-900 shrink-0 group-hover:text-[#d73f09] transition-colors">
                      {row.code}
                    </span>
                    <span className="font-bold text-gray-900 truncate group-hover:text-[#d73f09] transition-colors">
                      {row.title || row.course_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-widest text-gray-500">
                    <span>
                      Diff{" "}
                      <span className="font-bold text-gray-900 tabular-nums">
                        {row.diffLabel}
                      </span>
                    </span>
                    <span>
                      Hrs{" "}
                      <span className="font-bold text-gray-900 tabular-nums">
                        {row.hrsLabel}
                      </span>
                    </span>
                    <span>{row.count} Reviews</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Tablet / desktop list */}
            <div className="hidden sm:block w-full overflow-x-auto">
              <div className="min-w-[700px] md:h-[70vh] md:min-h-[420px] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-[160px_1fr_90px_100px_90px_90px] gap-4 pb-3 border-b border-gray-300 font-mono text-[11px] uppercase tracking-widest text-gray-500 sticky top-0 bg-[#f7f5f0]">
                  <span>Course</span>
                  <span>Title</span>
                  <span>Type</span>
                  <span className="text-right">Difficulty</span>
                  <span className="text-right">Hrs / wk</span>
                  <span className="text-right">Reviews</span>
                </div>
                {filteredRows.map((row) => (
                  <button
                    key={row.key}
                    onClick={() => handleRowClick(row.course_name)}
                    className="grid grid-cols-[160px_1fr_90px_100px_90px_90px] gap-4 items-center w-full text-left py-5 border-b border-gray-200 hover:bg-[#efece2] transition-colors group"
                  >
                    <span className="font-mono font-bold text-gray-900 group-hover:text-[#d73f09] transition-colors">
                      {row.code}
                    </span>
                    <span className="font-bold text-gray-900 group-hover:text-[#d73f09] transition-colors truncate">
                      {row.title || row.course_name}
                    </span>
                    <TypeBadge code={row.code} />
                    <span className="text-right font-mono font-bold tabular-nums text-gray-900">
                      {row.diffLabel}
                    </span>
                    <span className="text-right font-mono font-bold tabular-nums text-gray-900">
                      {row.hrsLabel}
                    </span>
                    <span className="text-right font-mono tabular-nums text-gray-600">
                      {row.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRows.map((row) => (
                <button
                  key={row.key}
                  onClick={() => handleRowClick(row.course_name)}
                  className="text-left group bg-white border border-gray-200 hover:border-gray-900 focus-visible:border-gray-900 focus:outline-none transition-colors p-6 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono font-black text-lg text-gray-900 group-hover:text-[#d73f09] group-focus-visible:text-[#d73f09] transition-colors">
                      {row.code}
                    </span>
                    <TypeBadge code={row.code} />
                  </div>
                  <p className="font-bold text-gray-900 group-hover:text-[#d73f09] group-focus-visible:text-[#d73f09] transition-colors mb-6">
                    {row.title || row.course_name}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-4 mt-auto border-t border-gray-200 text-left sm:text-center">
                    <div>
                      <div className="font-mono font-bold tabular-nums text-gray-900 group-hover:text-[#d73f09] group-focus-visible:text-[#d73f09] transition-colors">
                        {row.diffLabel}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">
                        Difficulty
                      </div>
                    </div>
                    <div>
                      <div className="font-mono font-bold tabular-nums text-gray-900 group-hover:text-[#d73f09] group-focus-visible:text-[#d73f09] transition-colors">
                        {row.hrsLabel}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">
                        Hrs / wk
                      </div>
                    </div>
                    <div>
                      <div className="font-mono font-bold tabular-nums text-gray-900 group-hover:text-[#d73f09] group-focus-visible:text-[#d73f09] transition-colors">
                        {row.count}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">
                        Reviews
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Course;
