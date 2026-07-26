import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../misc/const";
import { ScrollArea, Table, Skeleton, Badge } from "@mantine/core";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";
import { classType } from "../misc/utils";
import { getDifficultyColor } from "../components/ui/chart";

type SortField = "course" | "reviews" | "difficulty" | "hours";

type Row = {
  _id: string;
  count?: number;
  avg_difficulty?: number;
  avg_hours?: number;
};

export const Route = createFileRoute("/courses")({
  component: Course,
});

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

function SortArrow({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) {
    return <span className="ml-1 text-[10px] text-gray-300">↕</span>;
  }
  return (
    <span
      className="ml-1 inline-block text-[10px] text-white transition-transform duration-200 ease-out"
      style={{ transform: asc ? "rotate(0deg)" : "rotate(180deg)" }}
    >
      ↑
    </span>
  );
}

function Course() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [sortField, setSortField] = useState<SortField>("course");
  const [sortAsc, setSortAsc] = useState(true);

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
        diffLabel: diff > 0 ? diff.toFixed(2) : "—",
        hrsLabel: hrs > 0 ? hrs.toFixed(1) : "—",
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

  const handleRowClick = (course_name: string) => {
    dispatch(setSelectedCourse(course_name));
    navigate({ to: "/reviews" });
  };

  const sortButtons: { field: SortField; label: string }[] = [
    { field: "course", label: "Course" },
    { field: "difficulty", label: "Difficulty" },
    { field: "hours", label: "Hours" },
    { field: "reviews", label: "Reviews" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-4 pt-28 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#d73f09] mb-2">
              Course Reviews
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
              Browse Courses
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Real student feedback on difficulty, workload, and tips
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {viewMode === "grid" && (
              <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-xl p-1">
                {sortButtons.map(({ field, label }) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      sortField === field
                        ? "bg-[#d73f09] text-white"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                    {sortField === field && (
                      <span
                        className="inline-block text-[10px] transition-transform duration-200 ease-out"
                        style={{ transform: sortAsc ? "rotate(0deg)" : "rotate(180deg)" }}
                      >
                        ↑
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-xl p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-[#d73f09] text-white"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                }`}
                title="List view"
              >
                <ListIcon />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-[#d73f09] text-white"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                }`}
                title="Grid view"
              >
                <GridIcon />
              </button>
            </div>

            {!isLoading && (
              <span className="text-sm text-gray-400 font-medium">
                {rows.length} courses
              </span>
            )}
          </div>
        </div>
        {viewMode === "list" && (
          <Skeleton visible={isLoading} h={540} radius="lg">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <ScrollArea
                h={540}
                type="auto"
                scrollbarSize={0}
                styles={{
                  viewport: { background: "var(--mantine-color-body)" },
                }}
              >
                <Table
                  striped
                  highlightOnHover
                  withColumnBorders={false}
                  verticalSpacing="sm"
                  horizontalSpacing="lg"
                  className="min-w-full"
                  styles={{
                    table: { borderCollapse: "separate", borderSpacing: 0 },
                    thead: {
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background:
                        "color-mix(in oklab, var(--mantine-color-body) 85%, white)",
                      backdropFilter: "saturate(180%) blur(6px)",
                      boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.06)",
                    },
                    th: {
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--mantine-color-dimmed)",
                      fontWeight: 600,
                      paddingTop: 10,
                      paddingBottom: 10,
                      background: "transparent",
                      userSelect: "none",
                      cursor: "pointer",
                    },
                    td: {
                      fontSize: "0.92rem",
                      color: "var(--mantine-color-text)",
                    },
                    tr: { transition: "background 120ms ease" },
                  }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: 110 }} onClick={() => handleSort("course")}>
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-md px-2 py-1 transition-colors select-none ${
                            sortField === "course"
                              ? "bg-[#d73f09] text-white"
                              : "text-gray-500 hover:bg-orange-50 hover:text-gray-900"
                          }`}
                        >
                          Course
                          <SortArrow active={sortField === "course"} asc={sortAsc} />
                        </span>
                      </Table.Th>
                      <Table.Th>Course Name</Table.Th>
                      <Table.Th style={{ width: 110, textAlign: "right" }} onClick={() => handleSort("reviews")}>
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-md px-2 py-1 transition-colors select-none ${
                            sortField === "reviews"
                              ? "bg-[#d73f09] text-white"
                              : "text-gray-500 hover:bg-orange-50 hover:text-gray-900"
                          }`}
                        >
                          Reviews
                          <SortArrow active={sortField === "reviews"} asc={sortAsc} />
                        </span>
                      </Table.Th>
                      <Table.Th style={{ width: 140, textAlign: "right" }} onClick={() => handleSort("difficulty")}>
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-md px-2 py-1 transition-colors select-none ${
                            sortField === "difficulty"
                              ? "bg-[#d73f09] text-white"
                              : "text-gray-500 hover:bg-orange-50 hover:text-gray-900"
                          }`}
                        >
                          Avg Difficulty
                          <SortArrow active={sortField === "difficulty"} asc={sortAsc} />
                        </span>
                      </Table.Th>
                      <Table.Th style={{ width: 120, textAlign: "right" }} onClick={() => handleSort("hours")}>
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-md px-2 py-1 transition-colors select-none ${
                            sortField === "hours"
                              ? "bg-[#d73f09] text-white"
                              : "text-gray-500 hover:bg-orange-50 hover:text-gray-900"
                          }`}
                        >
                          Avg Hours
                          <SortArrow active={sortField === "hours"} asc={sortAsc} />
                        </span>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody className="[&>tr]:border-0 [&>tr+tr]:border-t [&>tr+tr]:border-gray-100">
                    {rows.length === 0 && !isLoading ? (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
                          <div className="flex items-center justify-center py-14 text-center">
                            <div>
                              <p className="font-semibold text-gray-700">No reviews yet</p>
                              <p className="text-sm text-gray-400 mt-1">
                                When students add reviews, they'll show up here.
                              </p>
                            </div>
                          </div>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      rows.map((review) => (
                        <Table.Tr
                          key={review.key}
                          className="cursor-pointer"
                          onClick={() => handleRowClick(review.course_name)}
                        >
                          <Table.Td>
                            <span className="font-semibold tabular-nums">
                              {review.code}
                            </span>
                          </Table.Td>
                          <Table.Td className="text-gray-800">
                            {review.course_name}
                          </Table.Td>
                          <Table.Td style={{ textAlign: "right" }}>
                            <span className="tabular-nums">{review.count}</span>
                          </Table.Td>
                          <Table.Td style={{ textAlign: "right" }}>
                            {review.diff > 0 ? (
                              <Badge
                                variant="light"
                                radius="sm"
                                size="sm"
                                className="tabular-nums"
                                color={
                                  review.diff >= 3.5
                                    ? "#d03b3b"
                                    : review.diff >= 2.5
                                      ? "#fab219"
                                      : "#0ca30c"
                                }
                              >
                                {review.diffLabel}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </Table.Td>
                          <Table.Td style={{ textAlign: "right" }}>
                            {review.hrs > 0 ? (
                              <Badge
                                variant="light"
                                radius="sm"
                                size="sm"
                                className="tabular-nums"
                                color={
                                  review.hrs >= 15
                                    ? "#d03b3b"
                                    : review.hrs >= 10
                                      ? "#fab219"
                                      : "#0ca30c"
                                }
                              >
                                {review.hrsLabel}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </div>
          </Skeleton>
        )}

        {viewMode === "grid" && (
          isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} height={200} radius="lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rows.map((review) => {
                const isCore = classType(review.code) === "Core";
                return (
                  <button
                    key={review.key}
                    onClick={() => handleRowClick(review.course_name)}
                    className="text-left group flex w-full"
                  >
                    <div className="flex flex-col w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                      <div
                        className="h-[3px] w-full"
                        style={{
                          backgroundColor:
                            review.diff > 0
                              ? getDifficultyColor(review.diff)
                              : "#e5e1d8",
                        }}
                      />
                      <div className="p-4 pb-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <h3 className="text-base font-black text-gray-900 leading-tight">
                              {review.code}
                            </h3>
                            <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
                              {review.title || review.course_name}
                            </p>
                          </div>
                          <span
                            className={`${
                              isCore ? "bg-[#d73f09]" : "bg-[#f28705]"
                            } shrink-0 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2`}
                          >
                            {classType(review.code)}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 mt-4 pt-3 border-t border-gray-100">
                          <div>
                            <div
                              className={`text-sm font-black tabular-nums ${
                                sortField === "difficulty"
                                  ? "text-[#d73f09]"
                                  : "text-gray-800"
                              }`}
                            >
                              {review.diffLabel}
                            </div>
                            <div
                              className={`text-[9px] font-semibold uppercase tracking-wide mt-0.5 ${
                                sortField === "difficulty"
                                  ? "text-[#d73f09]"
                                  : "text-gray-400"
                              }`}
                            >
                              Difficulty
                            </div>
                          </div>
                          <div>
                            <div
                              className={`text-sm font-black tabular-nums ${
                                sortField === "hours"
                                  ? "text-[#d73f09]"
                                  : "text-gray-800"
                              }`}
                            >
                              {review.hrsLabel}
                            </div>
                            <div
                              className={`text-[9px] font-semibold uppercase tracking-wide mt-0.5 ${
                                sortField === "hours"
                                  ? "text-[#d73f09]"
                                  : "text-gray-400"
                              }`}
                            >
                              Hrs / wk
                            </div>
                          </div>
                          <div>
                            <div
                              className={`text-sm font-black tabular-nums ${
                                sortField === "reviews"
                                  ? "text-[#d73f09]"
                                  : "text-gray-800"
                              }`}
                            >
                              {review.count}
                            </div>
                            <div
                              className={`text-[9px] font-semibold uppercase tracking-wide mt-0.5 ${
                                sortField === "reviews"
                                  ? "text-[#d73f09]"
                                  : "text-gray-400"
                              }`}
                            >
                              Reviews
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Course;
