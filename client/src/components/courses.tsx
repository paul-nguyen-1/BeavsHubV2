import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../lib/const";
import { CourseInfo } from "../lib/types";
import { Course } from "./course";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { Loader, Skeleton } from "@mantine/core";
import { motion } from "framer-motion";
import SelectMantine from "./ui/select";
import { MantineInput } from "./ui/input";
import {
  BarChartMantine,
  PieChartMantine,
  DonutChartMantine,
} from "./ui/chart";
import { useDebouncedValue } from "@mantine/hooks";

function Courses() {
  const [course, setCourse] = useState<string | null>("");
  const [review, setReview] = useState<string | null>("");
  const [debouncedCourse] = useDebouncedValue(course, 200);
  const [debouncedReview] = useDebouncedValue(review, 200);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const { ref, inView } = useInView();
  const fetchProjects = async ({ pageParam }: { pageParam: number }) => {
    const defaultResponse = `${getAllCourses}/courses/${debouncedCourse ?? ""}?page=${pageParam}`;
    const reviewResponse = `${getAllCourses}/courses/${debouncedCourse ?? ""}?course_tips=${debouncedReview}&page=${pageParam}`;

    const response = await fetch(review ? reviewResponse : defaultResponse);
    if (!response.ok) {
      throw new Error("Failed to fetch courses data");
    }
    return response.json();
  };

  const {
    data,
    isLoading: isLoadingCourses,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["projects", debouncedCourse, debouncedReview],
    queryFn: fetchProjects,
    initialPageParam: 1,
    getNextPageParam: (_lastPage, pages) => pages.length + 1,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === "error") {
    alert("Error: " + error.message);
  }

  const fetchChartData = async () => {
    const response = await fetch(
      course
        ? `${getAllCourses}/courses/${course}/all_reviews?course_tips=${review}`
        : `${getAllCourses}/courses/all?course_tips=${review}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch chart data");
    }
    return response.json();
  };

  const { data: fetchedChartData, error: chartError } = useQuery({
    queryKey: ["chartData", course, review],
    queryFn: fetchChartData,
  });

  if (chartError) {
    console.log("Chart Error: " + chartError.message);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const handleCourseChange = (value: string | null) => {
    setCourse(value);
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReview(e.target.value);
  };

  return (
    <>
      <div>
        <motion.div variants={itemVariants}>
          <div className="flex flex-row justify-center items-center gap-4 overflow-hidden md:overflow-visible mb-4 px-6">
            <div className="w-full md:w-56">
              <Skeleton visible={isLoading}>
                <SelectMantine
                  value={course}
                  onChange={handleCourseChange}
                  charSize={3}
                />
              </Skeleton>
            </div>
            <div className="w-full md:w-56">
              <Skeleton visible={isLoading}>
                <MantineInput
                  value={review ?? ""}
                  onChange={handleReviewChange}
                />
              </Skeleton>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="flex md:flex-row flex-col items-center md:items-start justify-center gap-y-8">
        <div className="flex flex-col gap-y-8 items-center">
          <div className="flex flex-col md:flex-row gap-6 mt-2">
            <PieChartMantine
              data={fetchedChartData}
              isLoading={isLoadingCourses}
            />
            <DonutChartMantine
              data={fetchedChartData}
              isLoading={isLoadingCourses}
            />
          </div>
          <BarChartMantine
            data={fetchedChartData}
            isLoading={isLoadingCourses}
          />
        </div>
        <motion.div
          className={`flex flex-col items-center px-5 w-full md:w-3/5 mt-2.5 ${
            status === "pending" ? "opacity-50" : ""
          }`}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="w-full flex flex-col items-end gap-4 overflow-auto scrollbar-hide md:max-h-[75vh]">
            {data && fetchedChartData && (
              <div className="md:flex absolute justify-end text-xs font-medium mt-[-25px] text-gray-300">
                {data.pages.length * 10 >= fetchedChartData?.length
                  ? fetchedChartData?.length
                  : data.pages.length * 10}{" "}
                of {fetchedChartData?.length} course reviews
              </div>
            )}
            {status === "pending" && (
              <>
                <Skeleton height={350} mt={8} width="100%" radius="xl" />
                <Skeleton height={350} mt={8} width="100%" radius="xl" />
                <Skeleton height={350} mt={8} width="100%" radius="xl" />
              </>
            )}
            {data?.pages.map((page, pageIndex) =>
              page.map((course: CourseInfo) => (
                <Skeleton
                  visible={isLoadingCourses}
                  key={`${pageIndex}-${course._id}`}
                >
                  <div className="w-full flex justify-center">
                    <motion.div
                      variants={itemVariants}
                      className="w-full flex justify-center"
                    >
                      <Course
                        key={`${pageIndex}-${course._id}`}
                        difficulty={course.course_difficulty}
                        course={course.course_name}
                        taken_date={course.course_taken_date}
                        time_spent_per_week={course.course_time_spent_per_week}
                        timestamp={new Date(course.timestamp).toLocaleString()}
                        tips={course.course_tips}
                      />
                    </motion.div>
                  </div>
                </Skeleton>
              ))
            )}
            {hasNextPage &&
              data &&
              fetchedChartData?.length > data.pages.length * 10 && (
                <div ref={ref} className="p-5 text-center w-full">
                  {isFetchingNextPage && <Loader color="blue" />}
                </div>
              )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Courses;
