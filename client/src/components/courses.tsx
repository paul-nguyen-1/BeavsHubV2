import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAllCourses,
  lowerDivisionOne,
  lowerDivisionTwo,
  upperDivisionOne,
  upperDivisionTwo,
} from "../lib/const";
import { CourseInfo } from "../lib/types";
import { Course } from "./course";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import {
  Button,
  Loader,
  Modal,
  MultiSelect,
  Select,
  Skeleton,
  Textarea,
} from "@mantine/core";
import { motion } from "framer-motion";
import SelectMantine from "./ui/select";
import { MantineInput } from "./ui/input";
import {
  BarChartMantine,
  PieChartMantine,
  DonutChartMantine,
} from "./ui/chart";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";

interface CourseFormData {
  course_name: string;
  course_difficulty: string;
  course_time_spent_per_week: string;
  course_tips: string;
  course_taken_date: string;
  pairs: string[];
}

function Courses() {
  const [course, setCourse] = useState<string | null>("");
  const [review, setReview] = useState<string | null>("");
  const [debouncedCourse] = useDebouncedValue(course, 200);
  const [debouncedReview] = useDebouncedValue(review, 200);
  const [opened, { open, close }] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    course_name: "",
    course_difficulty: "",
    course_time_spent_per_week: "",
    course_tips: "",
    course_taken_date: "",
    pairs: [],
  });

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

  const handleCourseInputChange = (name: string, value: string | string[]) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleCourseSubmit = () => {
    mutation.mutate(formData);
  };

  const queryClient = useQueryClient();

  const mutation = useMutation<Response, Error, CourseFormData>({
    mutationFn: (formData: CourseFormData) =>
      fetch(`${import.meta.env.VITE_API_BASE_URL}/courses/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create course");
        }
        return response.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({
        queryKey: ["chartData", course, review],
      });

      close();
      setFormData({
        course_name: "",
        course_difficulty: "",
        course_time_spent_per_week: "",
        course_tips: "",
        course_taken_date: "",
        pairs: [],
      });
    },
    onError: () => {
      alert("Error creating course. Please try again.");
    },
  });

  return (
    <>
      <div>
        <motion.div variants={itemVariants}>
          <div className="flex flex-row justify-center items-center gap-4 overflow-hidden md:overflow-visible mb-4 px-6">
            <div className="flex flex-row gap-4">
              <div className="w-full md:w-56">
                <Skeleton visible={isLoading}>
                  <SelectMantine
                    value={course}
                    onChange={handleCourseChange}
                  />
                </Skeleton>
              </div>
              <div className="w-full md:w-56">
                <Skeleton visible={isLoading}>
                  <MantineInput
                    value={review ?? ""}
                    onChange={handleReviewChange}
                    label="Search"
                    placeholder="Course Reviews"
                  />
                </Skeleton>
              </div>
            </div>
            <Modal
              opened={opened}
              onClose={close}
              title="Create New Course Review"
            >
              <div className="flex flex-col gap-4">
                <Select
                  value={formData.course_name}
                  onChange={(value) =>
                    handleCourseInputChange("course_name", value ?? "")
                  }
                  label="Course Name"
                  placeholder="Select Course Name"
                  data={[
                    ...lowerDivisionOne,
                    ...lowerDivisionTwo,
                    ...upperDivisionOne,
                    ...upperDivisionTwo,
                  ]}
                  clearable
                />
                <Select
                  label="Course Difficulty (1-5)"
                  placeholder="Enter Course Difficulty"
                  data={["1", " 2", "3", "4", "5"]}
                  value={formData.course_difficulty}
                  onChange={(value) => {
                    const numericValue = Number(value);
                    if (!isNaN(numericValue)) {
                      handleCourseInputChange(
                        "course_difficulty",
                        numericValue.toString()
                      );
                    }
                  }}
                  clearable
                />
                <Select
                  label="Time Spent Per Week"
                  placeholder="E.g., 0-5 hours"
                  data={["0-5 hours", "6-12 hours", "13-18 hours", "18+ hours"]}
                  value={formData.course_time_spent_per_week}
                  onChange={(value) => {
                    handleCourseInputChange(
                      "course_time_spent_per_week",
                      value ?? ""
                    );
                  }}
                  clearable
                />
                <Textarea
                  placeholder="Enter Tips for the Course"
                  label="Course Tips"
                  autosize
                  minRows={2}
                  value={formData.course_tips}
                  onChange={(e) =>
                    handleCourseInputChange("course_tips", e.target.value)
                  }
                />
                <MantineInput
                  value={formData.course_taken_date}
                  onChange={(e) =>
                    handleCourseInputChange("course_taken_date", e.target.value)
                  }
                  label="Course Taken Date"
                  placeholder="E.g., WI 2025"
                />
                <MultiSelect
                  label="Course Pairs (Select one or multiple courses)"
                  placeholder="Pick one or more courses"
                  data={[
                    ...lowerDivisionOne,
                    ...lowerDivisionTwo,
                    ...upperDivisionOne,
                    ...upperDivisionTwo,
                  ]}
                  value={formData.pairs}
                  onChange={(selected) =>
                    handleCourseInputChange("pairs", selected)
                  }
                  clearable
                  required
                />
              </div>

              <Button className="mt-4" onClick={handleCourseSubmit}>
                Submit
              </Button>
            </Modal>

            <Button className="relative top-3" onClick={open}>
              New Post
            </Button>
          </div>
        </motion.div>
      </div>
      <div className="flex md:flex-row flex-col items-center md:items-start justify-center gap-y-8">
        <div className="flex gap-y-6 md:gap-y-2 flex-col items-center">
          <div className="flex flex-col md:flex-row gap-6 md:gap-2 mt-2">
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
