import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllCourses } from "../lib/const";
import { CourseInfo } from "../lib/types";
import { Course } from "./course";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { Loader } from "@mantine/core";
import { motion } from "framer-motion";

function Courses() {
  const { ref, inView } = useInView();
  const fetchProjects = async ({ pageParam }: { pageParam: number }) => {
    const response = await fetch(`${getAllCourses}${pageParam}`);
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
    queryKey: ["projects"],
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={`flex flex-col items-center px-5 ${
        status === "pending" ? "opacity-50" : ""
      }`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
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
              className="w-full md:w-3/4 flex justify-center"
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
  );
}

export default Courses;
