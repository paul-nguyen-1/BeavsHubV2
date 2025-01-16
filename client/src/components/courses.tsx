import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../lib/const";
import { CourseInfo } from "../lib/types";
import { Course } from "./course";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { Loader } from "@mantine/core";
import { motion } from "framer-motion";
import SelectMantine from "./ui/select";
import { MantineInput } from "./ui/input";
import {
  BarChartMantine,
  PieChartMantine,
  DonutChartMantine,
} from "./ui/chart";

function Courses() {
  const [course, setCourse] = useState<string | null>("");
  const [review, setReview] = useState<string | null>("");

  const { ref, inView } = useInView();
  const fetchProjects = async ({ pageParam }: { pageParam: number }) => {
    const defaultResponse = `${getAllCourses}/courses/${course ?? ""}?page=${pageParam}`;
    const reviewResponse = `${getAllCourses}/courses/${course ?? ""}?course_tips=${review}&page=${pageParam}`;

    const response = await fetch(review ? reviewResponse : defaultResponse);
    if (!response.ok) {
      throw new Error("Failed to fetch courses data");
    }
    return response.json();
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["projects", course, review],
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

  const {
    data: fetchedChartData,
    isLoading,
    error: chartError,
  } = useQuery({
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
    <div className="flex md:flex-row flex-col gap-y-8">
      <div className="flex flex-col gap-y-8 items-center">
        {isLoading ? (
          <div>Loading charts...</div>
        ) : (
          <>
            <div className="flex flex-row gap-12">
              <PieChartMantine data={fetchedChartData} />
              <DonutChartMantine data={fetchedChartData} />
            </div>
            <BarChartMantine data={fetchedChartData} />
          </>
        )}
      </div>

      <motion.div
        className={`flex flex-col items-center px-5 ${
          status === "pending" ? "opacity-50" : ""
        }`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-row items-center gap-4">
            <SelectMantine
              value={course}
              onChange={handleCourseChange}
              charSize={3}
            />
            <MantineInput value={review ?? ""} onChange={handleReviewChange} />
          </div>
        </motion.div>

        {status === "pending" && (
          <Loader color="blue" style={{ margin: "20px" }} />
        )}
        {data?.pages.map((page, pageIndex) =>
          page.map((course: CourseInfo) => (
            <div
              key={`${pageIndex}-${course._id}`}
              className="w-full flex justify-center"
            >
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
          ))
        )}

        {hasNextPage && (
          <div ref={ref} style={{ padding: "20px", textAlign: "center" }}>
            {isFetchingNextPage && <Loader color="blue" />}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Courses;
