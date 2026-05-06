import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../misc/const";
import { ScrollArea, Table, Skeleton, Badge, Progress } from "@mantine/core";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";
import { classType } from "../misc/utils";

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
  return (
    <span className={`ml-1 text-[10px] ${active ? "text-[#d73f09]" : "text-gray-300"}`}>
      {active ? (asc ? "↑" : "↓") : "↕"}
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
      const count = num(review.count);
      const diff = num(review.avg_difficulty);
      const hrs = num(review.avg_hours);
      return {
        key: course_name,
        code,
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
    { field: "reviews", label: "Reviews" },
    { field: "difficulty", label: "Difficulty" },
    { field: "hours", label: "Hours" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="!text-2xl !font-black text-gray-900">Course Reviews</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Real student feedback on difficulty, workload, and tips
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {viewMode === "grid" && (
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
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
                      <span className="text-[10px]">{sortAsc ? "↑" : "↓"}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
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
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
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
                        <span className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 transition-colors select-none hover:bg-orange-50 ${sortField === "course" ? "text-[#d73f09]" : "hover:text-gray-900"}`}>
                          Course
                          <SortArrow active={sortField === "course"} asc={sortAsc} />
                        </span>
                      </Table.Th>
                      <Table.Th>Course Name</Table.Th>
                      <Table.Th style={{ width: 110, textAlign: "right" }} onClick={() => handleSort("reviews")}>
                        <span className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 transition-colors select-none hover:bg-orange-50 ${sortField === "reviews" ? "text-[#d73f09]" : "hover:text-gray-900"}`}>
                          Reviews
                          <SortArrow active={sortField === "reviews"} asc={sortAsc} />
                        </span>
                      </Table.Th>
                      <Table.Th style={{ width: 140, textAlign: "right" }} onClick={() => handleSort("difficulty")}>
                        <span className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 transition-colors select-none hover:bg-orange-50 ${sortField === "difficulty" ? "text-[#d73f09]" : "hover:text-gray-900"}`}>
                          Avg Difficulty
                          <SortArrow active={sortField === "difficulty"} asc={sortAsc} />
                        </span>
                      </Table.Th>
                      <Table.Th style={{ width: 120, textAlign: "right" }} onClick={() => handleSort("hours")}>
                        <span className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 transition-colors select-none hover:bg-orange-50 ${sortField === "hours" ? "text-[#d73f09]" : "hover:text-gray-900"}`}>
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
                                    ? "red"
                                    : review.diff >= 2.5
                                      ? "yellow"
                                      : "green"
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
                                    ? "red"
                                    : review.hrs >= 10
                                      ? "yellow"
                                      : "teal"
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
                    className="text-left group"
                  >
                    <div className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden border border-gray-100 h-[210px]">
                      <div
                        className={`h-1 w-full ${isCore ? "bg-[#d73f09]" : "bg-[#f28705]"}`}
                      />
                      <div className="flex flex-col flex-1 p-4">
                        <div className="flex justify-between items-start mb-1.5">
                          <h3 className="text-sm font-black text-gray-900">
                            {review.code}
                          </h3>
                          <span
                            className={`${
                              isCore ? "bg-[#d73f09]" : "bg-[#f28705]"
                            } text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}
                          >
                            {classType(review.code)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-600 flex-1 line-clamp-2">
                          {review.course_name}
                        </p>
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                            <span>Difficulty</span>
                            <span className="font-bold text-gray-700">
                              {review.diff > 0 ? `${review.diffLabel} / 5` : "—"}
                            </span>
                          </div>
                          <Progress
                            value={review.diff * 20}
                            color={isCore ? "#d73f09" : "#f28705"}
                            size="sm"
                            radius="xl"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>
                              {review.hrs > 0 ? `${review.hrsLabel} hrs/wk` : "—"}
                            </span>
                            <span className="font-semibold text-gray-600">
                              {review.count} reviews
                            </span>
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
