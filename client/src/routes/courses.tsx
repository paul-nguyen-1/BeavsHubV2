import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../misc/const";
import { ScrollArea, Table, Skeleton, Badge, Text } from "@mantine/core";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";

type Row = {
  _id: string;
  count?: number;
  avg_difficulty?: number;
  avg_hours?: number;
};

export const Route = createFileRoute("/courses")({
  component: Course,
});

function Course() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fetchTableData = async (): Promise<Row[]> => {
    const response = await fetch(`${getAllCourses}/courses/frequency`);
    if (!response.ok) throw new Error("Failed to fetch table data");
    return response.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["tableData"],
    queryFn: fetchTableData,
  });

  const rows = useMemo(() => {
    const items = Array.isArray(data) ? data : [];
    const num = (n: unknown, fallback = 0) =>
      Number.isFinite(Number(n)) ? Number(n) : fallback;

    return items
      .slice()
      .sort((a, b) => {
        const nameA = a._id?.trim().toUpperCase() || "";
        const nameB = b._id?.trim().toUpperCase() || "";
        return nameA.localeCompare(nameB);
      })
      .map((review) => {
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
  }, [data]);

  return (
    <>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-row flex-wrap justify-between items-center w-full bg-white rounded-lg shadow-md px-4 mb-6 md:px-10 py-2">
          <div>
            <div className="flex flex-col gap-2 items-start">
              <Text fz="xl">Course Reviews</Text>
              <Text fz="sm" c="dimmed">
                Real student feedback on difficulty, workload, and tips
              </Text>
            </div>
          </div>
        </div>
        <div>
          <Skeleton visible={isLoading} h={720} radius="md">
            <ScrollArea h={480} type="auto" scrollbarSize={8}>
              <Table
                striped
                highlightOnHover
                verticalSpacing="sm"
                horizontalSpacing="md"
                className="[&_thead_th]:text-xs [&_thead_th]:uppercase [&_thead_th]:tracking-wide"
              >
                <Table.Thead
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    background: "var(--mantine-color-body)",
                    boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.06)",
                  }}
                >
                  <Table.Tr>
                    <Table.Th style={{ width: 110 }}>Course</Table.Th>
                    <Table.Th>Course Name</Table.Th>
                    <Table.Th style={{ width: 110, textAlign: "right" }}>
                      Reviews
                    </Table.Th>
                    <Table.Th style={{ width: 140, textAlign: "right" }}>
                      Avg Difficulty
                    </Table.Th>
                    <Table.Th style={{ width: 120, textAlign: "right" }}>
                      Avg Hours
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {rows.map((review) => (
                    <Table.Tr
                      key={review.key}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        dispatch(setSelectedCourse(review.course_name));
                        navigate({ to: "/reviews" });
                      }}
                    >
                      <Table.Td>
                        <span className="font-medium">{review.code}</span>
                      </Table.Td>
                      <Table.Td className="text-gray-800">
                        {review.course_name}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "right" }}>
                        {review.count}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "right" }}>
                        {review.diff > 0 ? (
                          <Badge
                            variant="light"
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
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Skeleton>
        </div>
      </div>
    </>
  );
}

export default Course;
