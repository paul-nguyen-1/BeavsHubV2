import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  difficultyList,
  getAllCourses,
  lowerDivisionOne,
  lowerDivisionTwo,
  sortedTimeSpent,
  upperDivisionOne,
  upperDivisionTwo,
} from "../misc/const";
import { CourseInfo } from "../misc/types";
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
  Text,
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
import { AppDispatch, RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCourse } from "../hooks/useCourse";
import { setSelectedDifficulty } from "../hooks/useDifficulty";
import { setSelectedHours } from "../hooks/useHours";
import { classType } from "../misc/utils";

interface CourseFormData {
  course_name: string;
  course_difficulty: string;
  course_time_spent_per_week: string;
  course_enjoyability: string;
  course_tips: string;
  course_taken_date: string;
  pairs: string[];
}

function Courses() {
  const dispatch = useDispatch<AppDispatch>();
  const course = useSelector(
    (state: RootState) => state.useCourse.selectedCourse
  );

  const difficulty = useSelector(
    (state: RootState) => state.useDifficulty.selectedDifficulty
  );

  const timeSpent = useSelector(
    (state: RootState) => state.useHours.selectedHours
  );
  const [date, setDate] = useState<string | null>("");
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
    course_enjoyability: "",
    course_taken_date: "",
    pairs: [],
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const { ref, inView } = useInView();
  const fetchProjects = async ({ pageParam }: { pageParam: number }) => {
    const params = new URLSearchParams({
      page: pageParam.toString(),
    });
    if (date) {
      params.append("date", date);
    }
    if (debouncedReview) {
      params.append("course_tips", debouncedReview);
    }
    if (difficulty) {
      params.append("difficulty", difficulty);
    }

    if (timeSpent) {
      params.append("time_spent", timeSpent);
    }

    if (course === "419 (Legacy)/467 - Capstone") {
      dispatch(setSelectedCourse("Capstone"));
    }

    const url = debouncedCourse
      ? `${getAllCourses}/courses/${debouncedCourse}?${params.toString()}`
      : `${getAllCourses}/courses?${params.toString()}`;
    const response = await fetch(url);
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
    queryKey: [
      "projects",
      debouncedCourse,
      debouncedReview,
      date,
      difficulty,
      timeSpent,
    ],
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
    const params = new URLSearchParams();
    if (debouncedReview) params.append("course_tips", debouncedReview);
    if (date) params.append("date", date);
    if (difficulty) {
      params.append("difficulty", difficulty);
    }

    if (timeSpent) {
      params.append("time_spent", timeSpent);
    }
    const encodedCourse = debouncedCourse
      ? encodeURIComponent(debouncedCourse)
      : "";
    let url = debouncedCourse
      ? `${getAllCourses}/courses/${encodedCourse}/all_reviews?${params.toString()}`
      : `${getAllCourses}/courses/all?${params.toString()}`;
    url = url.replace(/\+/g, "%20");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch chart data");
    return response.json();
  };

  const {
    data: fetchedChartData,
    isLoading: isChartLoading,
    error: chartError,
  } = useQuery({
    queryKey: [
      "chartData",
      debouncedCourse,
      debouncedReview,
      date,
      difficulty,
      timeSpent,
    ],
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
    dispatch(setSelectedCourse(value));
  };

  const handleDateChange = (value: string | null) => {
    setDate(value);
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReview(e.target.value);
  };

  const handleDifficultyChange = (value: string | null) => {
    dispatch(setSelectedDifficulty(value));
  };

  const handleTimeSpentChange = (value: string | null) => {
    dispatch(setSelectedHours(value));
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

  const handleClearFilter = () => {
    dispatch(setSelectedCourse(""));
    setReview("");
    setDate("");
    dispatch(setSelectedDifficulty(""));
    dispatch(setSelectedHours(""));
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
        course_enjoyability: "",
        course_taken_date: "",
        pairs: [],
      });
    },
    onError: () => {
      alert("Error creating course. Please try again.");
    },
  });

  return (
    <div>
      <div className="px-4 md:px-25">
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-2.5 overflow-hidden md:overflow-visible mb-4 pt-5">
            <div className="flex flex-row flex-wrap justify-center gap-4">
              <div className="w-full md:w-56">
                <Skeleton visible={isLoading}>
                  <SelectMantine
                    placeHolder="Pick a class"
                    value={course}
                    onChange={handleCourseChange}
                    data={[
                      ...lowerDivisionOne,
                      ...lowerDivisionTwo,
                      ...upperDivisionOne,
                      ...upperDivisionTwo,
                    ]}
                  />
                </Skeleton>
              </div>
              <div className="w-full md:w-56">
                <Skeleton visible={isLoading}>
                  <MantineInput
                    value={review ?? ""}
                    onChange={handleReviewChange}
                    placeholder="Search for a review"
                  />
                </Skeleton>
              </div>
              <div className="w-full md:w-56">
                <Skeleton visible={isLoading}>
                  <SelectMantine
                    placeHolder="Search Difficulty"
                    value={difficulty ?? ""}
                    onChange={handleDifficultyChange}
                    data={[...difficultyList]}
                  />
                </Skeleton>
              </div>
              <div className="w-full md:w-56">
                <Skeleton visible={isLoading}>
                  <SelectMantine
                    placeHolder="Search Time Spent"
                    value={timeSpent ?? ""}
                    onChange={handleTimeSpentChange}
                    data={[...sortedTimeSpent]}
                  />
                </Skeleton>
              </div>
              <div className="w-full md:w-56">
                <Skeleton visible={isLoading}>
                  <SelectMantine
                    placeHolder="Filter Date"
                    value={date}
                    data={[
                      "1 Month",
                      "3 Months",
                      "6 Months",
                      "1 Year",
                      "2 Years",
                    ]}
                    onChange={handleDateChange}
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
                />
                <Select
                  value={formData.course_enjoyability}
                  onChange={(value) =>
                    handleCourseInputChange("course_enjoyability", value ?? "")
                  }
                  label="Course Enjoyability"
                  placeholder="Select Course Enjoyability"
                  data={["Enjoyable", "Neutral", "Not Enjoyable"]}
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
                <div className="flex flex-row gap-4 w-full">
                  <Select
                    className="w-full"
                    label="Course Taken Date"
                    placeholder="Select term"
                    data={["Spring", "Summer", "Winter", "Fall"]}
                    value={formData.course_taken_date.split(" ")[0] || ""}
                    onChange={(season) =>
                      handleCourseInputChange(
                        "course_taken_date",
                        `${season} ${formData.course_taken_date.split(" ")[1] || ""}`.trim()
                      )
                    }
                    clearable
                  />
                  <MantineInput
                    label="Year"
                    placeholder="E.g., 2025"
                    value={formData.course_taken_date.split(" ")[1] || ""}
                    onChange={(e) => {
                      const year = e.target.value.slice(0, 4);
                      handleCourseInputChange(
                        "course_taken_date",
                        `${formData.course_taken_date.split(" ")[0] || ""} ${year}`.trim()
                      );
                    }}
                  />
                </div>
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
              <div className="mt-4">
                <Button onClick={handleCourseSubmit}>Submit</Button>
              </div>
            </Modal>
            <div className="flex flex-row flex-wrap justify-between items-center w-full bg-white rounded-lg shadow-md px-4 md:px-10 py-2">
              <div>
                <div className="flex flex-row gap-2 items-center">
                  <Text fz="xl">
                    {course
                      ? course.includes("Capstone")
                        ? "Capstone"
                        : course
                      : "Browse All Courses"}
                  </Text>

                  {course && (
                    <div
                      className={`${
                        classType(course) === "Core"
                          ? "bg-[#d73f09]"
                          : "bg-[#f28705]"
                      } text-white text-sm px-3 py-1 rounded-full w-16 flex justify-center`}
                    >
                      {classType(course)}
                    </div>
                  )}
                </div>
                {data && fetchedChartData && (
                  <Text fz="sm" color="dimmed">
                    {data?.pages.reduce(
                      (count, page) => count + page.length,
                      0
                    )}{" "}
                    of {fetchedChartData.length} course reviews
                  </Text>
                )}
              </div>
              <div className="flex flex-row flex-wrap gap-4">
                <div>
                  <Button onClick={handleClearFilter} color="gray">
                    Clear Filters
                  </Button>
                </div>
                <div>
                  <Button onClick={open}>New Post</Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="mx-auto px-4 lg:px-25">
        <div className="flex flex-col md:flex-row justify-center gap-5 md:gap-10 rounded-lg px-4 md:px-0 h-full md:h-144">
          <div className="flex flex-col items-center bg-white rounded-lg p-5 shadow-md gap-4">
            <Text fz="xl" className="text-left w-full">
              Course Statistics
            </Text>
            <div className="flex flex-col md:flex-row gap-4">
              <PieChartMantine
                data={fetchedChartData}
                isLoading={isChartLoading}
              />
              <DonutChartMantine
                data={fetchedChartData}
                isLoading={isChartLoading}
              />
            </div>
            <BarChartMantine
              data={fetchedChartData}
              isLoading={isChartLoading}
            />
          </div>
          <motion.div
            className={`${isLoading && "flex flex-col items-center w-full"} ${status === "pending" ? "opacity-50" : ""}`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="w-full flex flex-col items-end gap-4 overflow-y-auto no-scrollbar md:max-h-[70vh] ">
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
                          enjoyability={course.course_enjoyability}
                          time_spent_per_week={
                            course.course_time_spent_per_week
                          }
                          timestamp={new Date(
                            course.timestamp
                          ).toLocaleString()}
                          tips={course.course_tips}
                          pairs={course.pairs}
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
                    {isFetchingNextPage && <Loader />}
                  </div>
                )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Courses;
