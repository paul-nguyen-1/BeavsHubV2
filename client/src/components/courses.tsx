import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllCourses } from "../lib/const";
import { Button } from "@mantine/core";
import { CourseInfo } from "../lib/types";
import { Course } from "./course";

function Courses() {
  const fetchProjects = async ({ pageParam = 1 }: { pageParam: number }) => {
    const response = await fetch(`${getAllCourses}${pageParam}`);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    return response.json();
  };

  // https://stackoverflow.com/questions/75123685/how-to-achieve-infinite-scroll-in-react-with-react-query

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => pages.length + 1,
  });

  if (status === "error") {
    return <p>Error: {error?.message}</p>;
  }

  console.log(
    "data",
    data?.pages.map((course: CourseInfo) => course)
  );

  return (
    <div>
      {data?.pages.map((page, pageIndex) =>
        page.map((course: CourseInfo) => (
          <Course
            key={`${pageIndex}-${course._id}`}
            difficulty={course.course_difficulty}
            course={course.course_name}
            taken_date={course.course_taken_date}
            time_spent_per_week={course.course_time_spent_per_week}
            timestamp={new Date(course.timestamp).toLocaleString()}
            tips={course.course_tips}
          />
        ))
      )}

      <div>
        <Button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
              ? "Load More"
              : "Nothing more to load"}
        </Button>
      </div>

      {/* Additional fetching state */}
      {isFetching && !isFetchingNextPage && <p>Fetching...</p>}
    </div>
  );
}

export default Courses;
